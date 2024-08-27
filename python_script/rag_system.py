import os
import openai
import pinecone
import glob
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import LLMChain
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.document_loaders import TextLoader
from langchain.vectorstores import Pinecone
from langchain.embeddings.openai import OpenAIEmbeddings
from anthropic import Client as ClaudeClient

# Set OpenAI, Claude, and Pinecone API keys
openai.api_key = "OPENAI_API_KEY"
pinecone_api_key = "PINECONE_API_KEY"
pinecone_environment = "PINECONE_ENVIRONMENT"
claude_api_key = "CLAUDE_API_KEY"

# Initialize Pinecone
pinecone.init(api_key=pinecone_api_key, environment=pinecone_environment)
index_name = "brilliant-it-interview-task"
index = pinecone.Index(index_name)

# Optional: Initialize Claude client
claude_client = ClaudeClient(api_key=claude_api_key) if claude_api_key else None

# Function to perform advanced text analysis using GPT-4 or Claude 3.5
def perform_advanced_text_analysis(document_text, model="gpt-4"):
    if model == "claude" and claude_client:
        response = claude_client.completions.create(
            prompt=document_text,
            model="claude-v1.3",
            max_tokens_to_sample=150
        )
        return response['completion'].strip()
    else:
        response = openai.Completion.create(
            engine="gpt-4",
            prompt=document_text,
            max_tokens=150,
            temperature=0.3
        )
        return response.choices[0].text.strip()

# Function to update document metadata in Pinecone
def update_pinecone_metadata(document_id, topics):
    metadata = {
        "topics": topics
    }
    index.update(id=document_id, set_metadata=metadata)

# Function to read text from a PDF file
def read_pdf(file_path):
    pdf_reader = PdfReader(file_path)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

# Function to load and process multiple files from a folder
def load_and_process_files(folder_path):
    # Supported file extensions
    file_extensions = ["*.txt", "*.pdf"]

    # Iterate over all files in the folder
    file_paths = []
    for ext in file_extensions:
        file_paths.extend(glob.glob(os.path.join(folder_path, ext)))

    for file_path in file_paths:
        file_name = os.path.basename(file_path)
        if file_path.endswith(".txt"):
            with open(file_path, "r", encoding="utf-8") as file:
                document_text = file.read()
        elif file_path.endswith(".pdf"):
            document_text = read_pdf(file_path)
        
        # Split the document into chunks if necessary
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=50)
        doc_texts = text_splitter.split_text(document_text)

        for i, doc_text in enumerate(doc_texts):
            document_id = f"{file_name}_chunk_{i}"  # Unique document ID
            topics = perform_advanced_text_analysis(doc_text, model="gpt-4")
            update_pinecone_metadata(document_id, topics)
            print(f"Updated document ID {document_id} with topics: {topics}")

# Function to perform Retrieval Augmented Generation (RAG)
def perform_rag(query, top_k=5):
    embedding_model = OpenAIEmbeddings()
    vector_store = Pinecone(index=index, embedding_function=embedding_model.embed_query)

    # Retrieve relevant documents from Pinecone
    docs = vector_store.similarity_search(query, k=top_k)

    # Combine retrieved documents to enhance the prompt
    context = "\n\n".join([doc.page_content for doc in docs])

    # Enhance the query with the retrieved context
    enhanced_query = f"Context: {context}\n\nQuestion: {query}"

    # Get the response from GPT-4 or Claude 3.5
    response = perform_advanced_text_analysis(enhanced_query, model="gpt-4")
    return response

# Main function to load, process, and update documents
def main():
    folder_path = "rag_documents"
    load_and_process_files(folder_path)

    # Example of performing RAG for a question
    question = "What are the main topics discussed in the documents?"
    answer = perform_rag(question)
    print(f"Answer: {answer}")

if __name__ == "__main__":
    main()
