import xml.etree.ElementTree as ET
import requests
import logging
import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from repository.auth import get_current_user
from database import get_db
from models import User
from schemas import PubMedPaper, PubMedSearchResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pubmed", tags=["pubmed"])

# Rate limiting constants - PubMed allows 3 requests per second without API key
MIN_REQUEST_INTERVAL = 0.34  # ~3 requests per second
MAX_RETRIES = 3
INITIAL_RETRY_DELAY = 1.0  # Start with 1 second delay


def fetch_pubmed_ids(query: str, limit: int = 20) -> List[str]:
    """Fetch PubMed IDs based on a search query."""
    try:
        url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={query}&retmax={limit}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        xml_data = response.text
        root = ET.fromstring(xml_data)
        return [elem.text for elem in root.findall(".//Id")]
    except requests.RequestException as e:
        logger.error(f"Error fetching PubMed IDs: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to fetch PubMed IDs: {str(e)}"
        )
    except ET.ParseError as e:
        logger.error(f"Error parsing PubMed XML: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to parse PubMed response"
        )


def fetch_pubmed_details(pmid: str, retry_count: int = 0) -> Optional[PubMedPaper]:
    """Fetch detailed information about a PubMed article with retry logic."""
    try:
        url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={pmid}&retmode=xml"
        response = requests.get(url, timeout=10)
        
        # Handle rate limiting (429) with exponential backoff
        if response.status_code == 429:
            if retry_count < MAX_RETRIES:
                retry_delay = INITIAL_RETRY_DELAY * (2 ** retry_count)  # Exponential backoff
                logger.warning(f"Rate limited for {pmid}, retrying in {retry_delay}s (attempt {retry_count + 1}/{MAX_RETRIES})")
                time.sleep(retry_delay)
                return fetch_pubmed_details(pmid, retry_count + 1)
            else:
                logger.error(f"Max retries reached for {pmid} due to rate limiting")
                return None
        
        response.raise_for_status()
        xml_data = response.text
        root = ET.fromstring(xml_data)

        def find(path: str) -> Optional[str]:
            elem = root.find(path)
            return elem.text if elem is not None else None

        # Extract details
        title = find(".//ArticleTitle")
        abstract = find(".//Abstract/AbstractText")
        journal = find(".//Journal/Title")
        pub_date = find(".//PubDate/Year")
        doi = find(".//ArticleId[@IdType='doi']")
        authors = []

        for a in root.findall(".//Author"):
            last = a.find("LastName")
            fore = a.find("ForeName")
            if last is not None and fore is not None:
                authors.append(f"{fore.text} {last.text}")

        return PubMedPaper(
            pmid=pmid,
            title=title or "N/A",
            abstract=abstract or "N/A",
            journal=journal or "N/A",
            year=pub_date or "N/A",
            doi=doi or "N/A",
            authors=authors
        )
    except requests.HTTPError as e:
        if e.response and e.response.status_code == 429:
            if retry_count < MAX_RETRIES:
                retry_delay = INITIAL_RETRY_DELAY * (2 ** retry_count)
                logger.warning(f"Rate limited for {pmid}, retrying in {retry_delay}s (attempt {retry_count + 1}/{MAX_RETRIES})")
                time.sleep(retry_delay)
                return fetch_pubmed_details(pmid, retry_count + 1)
            else:
                logger.error(f"Max retries reached for {pmid} due to rate limiting")
        else:
            logger.error(f"Error fetching PubMed details for {pmid}: {e}")
        return None
    except requests.RequestException as e:
        logger.error(f"Error fetching PubMed details for {pmid}: {e}")
        return None
    except ET.ParseError as e:
        logger.error(f"Error parsing PubMed XML for {pmid}: {e}")
        return None


@router.get("/search", response_model=PubMedSearchResponse)
def search_pubmed(
    query: str = Query(..., min_length=1, description="Search query for PubMed"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Search PubMed and return detailed information about matching papers."""
    try:
        # Fetch PubMed IDs
        ids = fetch_pubmed_ids(query, limit)
        
        # Add delay before fetching details to respect rate limits
        if ids:
            time.sleep(MIN_REQUEST_INTERVAL)
        
        if not ids:
            return PubMedSearchResponse(
                query=query,
                papers=[],
                count=0
            )

        # Fetch details for each paper with rate limiting
        all_papers = []
        for i, pmid in enumerate(ids):
            # Add delay between requests to respect rate limits (except for first request)
            if i > 0:
                time.sleep(MIN_REQUEST_INTERVAL)
            
            details = fetch_pubmed_details(pmid)
            if details:
                all_papers.append(details)

        return PubMedSearchResponse(
            query=query,
            papers=all_papers,
            count=len(all_papers)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error in PubMed search: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@router.get("/paper/{pmid}", response_model=PubMedPaper)
def get_pubmed_paper(
    pmid: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get detailed information about a specific PubMed paper by PMID."""
    details = fetch_pubmed_details(pmid)
    
    if not details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not fetch details for PubMed ID: {pmid}"
        )
    
    return details

