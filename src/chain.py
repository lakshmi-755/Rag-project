
from langchain_openai import ChatOpenAI

def build_chain(retriever):
    # Create LLM
    llm = ChatOpenAI(temperature=0)

    # Define custom QA function
    def qa_chain(question):
        # Step 1: Retrieve relevant documents
        docs = retriever.invoke(question)


        # Step 2: Combine content
        context = "\n\n".join([doc.page_content for doc in docs])

        # Step 3: Create prompt
        prompt = f"""
        Answer the question based only on the context below.

        Context:
        {context}

        Question:
        {question}
        """

        # Step 4: Generate answer
        response = llm.invoke(prompt)

        return {
            "result": response.content,
            "source_documents": docs
        }

    return qa_chain