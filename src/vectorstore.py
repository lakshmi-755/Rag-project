
from langchain_chroma import Chroma

def create_db(chunks, embeddings):
    return Chroma.from_documents(
        chunks,
        embeddings,
        persist_directory="db"
    )