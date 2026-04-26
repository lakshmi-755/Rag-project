
from fastapi import FastAPI, UploadFile, File
from typing import Annotated, List
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ✅ Create FastAPI app
app = FastAPI()

# ✅ Enable CORS (for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to store PDFs
DATA_PATH = "data"

# Global vector DB
vector_db = None


# ✅ Home API
@app.get("/")
def home():
    return {"message": "Backend is running"}


# ✅ Import RAG modules
from src.loader import load_pdfs
from src.splitter import split_docs
from src.embeddings import get_embeddings
from src.vectorstore import create_db
from src.retriever import get_retriever
from src.chain import build_chain


# ✅ Upload PDFs API
@app.post("/upload")
async def upload_pdfs(
    files: Annotated[List[UploadFile], File(...)]
):
    global vector_db

    # Clear old PDFs
    if os.path.exists(DATA_PATH):
        shutil.rmtree(DATA_PATH)

    os.makedirs(DATA_PATH, exist_ok=True)

    # Save uploaded PDFs
    for file in files:
        with open(os.path.join(DATA_PATH, file.filename), "wb") as f:
            f.write(await file.read())

    # 🔥 RAG Processing
    docs = load_pdfs(DATA_PATH)
    chunks = split_docs(docs)

    embeddings = get_embeddings()
    vector_db = create_db(chunks, embeddings)

    return {"message": "PDFs uploaded and processed"}


# ✅ Request model for asking questions
class Query(BaseModel):
    question: str


# ✅ Ask Question API
@app.post("/ask")
async def ask_question(query: Query):
    global vector_db

    if vector_db is None:
        return {"error": "Upload PDFs first"}

    retriever = get_retriever(vector_db)
    chain = build_chain(retriever)

    result = chain(query.question)
    source_names = [
        doc.metadata.get("source", "unknown")
        for doc in result["source_documents"]
    ]
    unique_sources = list(dict.fromkeys(source_names))

    return {
        "answer": result["result"],
        "sources": unique_sources
    }
