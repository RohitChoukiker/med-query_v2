MedQuery – AI-Powered Medical Q&A System (In Progress)

MedQuery is an intelligent medical question-answering system that uses **LangChain**, **LLMs**, and **RAG (Retrieval-Augmented Generation)** to provide accurate responses based on medical documents and research data.

---

  Live link : https://med-query1.vercel.app

Features:

 💬 Natural Language Q&A over medical PDFs and PubMed data
 🧠 LangChain RAG pipeline with ChromaDB as vector store
 🔍 Semantic search using OpenAI embeddings
 🤖 Hugging Face LLM integration for domain-specific reasoning
 ⚡  FastAPI backend with REST endpoints
 🌐 React.js frontend** with Context API
 ☁️ Deployments**: Vercel (frontend) & Render (backend)

 🏗️ Tech Stack

| Layer      | Tools Used                               |
|------------|-------------------------------------------|
| Frontend   | React.ts, Context API, Tailwind CSS       |
| Backend    | FastAPI, LangChain, Hugging Face          |
| Vector DB  | ChromaDB, OpenAI Embeddings               |
| Data       | PDF files, PubMed, Biomedical Documents   |
| Deployment | Vercel, Render, GitHub                    |


Setup Instructions:

1. git clone https://github.com/RohitChoukiker/medQuery.git

2. For Backend
   cd server
   pip install -r requirements.txt
   uvicorn main:app --reload          
   
3. For client  
   cd client
   npm install
   npm run dev


   

