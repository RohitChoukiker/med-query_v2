import xml.etree.ElementTree as ET
import requests

def fetch_pubmed_ids(query="cancer", limit=20):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={query}&retmax={limit}"
    xml_data = requests.get(url).text
    root = ET.fromstring(xml_data)
    return [elem.text for elem in root.findall(".//Id")]

def fetch_pubmed_details(pmid):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={pmid}&retmode=xml"
    xml_data = requests.get(url).text
    root = ET.fromstring(xml_data)

    def find(path):
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

    return {
        "pmid": pmid,
        "title": title,
        "abstract": abstract,
        "journal": journal,
        "year": pub_date,
        "doi": doi,
        "authors": authors
    }

# -------------------------
# MAIN USE CASE
# -------------------------

ids = fetch_pubmed_ids("cancer", 10)

print(f"Fetched {len(ids)} PMIDs\n")

all_papers = []

for pmid in ids:
    details = fetch_pubmed_details(pmid)
    all_papers.append(details)

# Print nicely
for paper in all_papers:
    print("\n==========================")
    print("PMID:", paper["pmid"])
    print("Title:", paper["title"])
    print("Authors:", ", ".join(paper["authors"]))
    print("Journal:", paper["journal"])
    print("Year:", paper["year"])
    print("DOI:", paper["doi"])
    print("Abstract:", paper["abstract"])
