# Company Chatbot RAG

`Company_Chatbot_RAG` is a command-line retrieval-augmented generation (RAG) application. It reads text from a PDF, splits that text into overlapping chunks, stores embeddings in Pinecone, retrieves the most similar chunks for a question, and asks Groq to answer using that context.

## Pipeline

```text
Rabbi__Hossain_Resume.pdf
        |
        v
pdf-parse -> LangChain Documents -> 500-character chunks
        |
        v
Google Gemini embeddings -> Pinecone namespace
        |
        v
Similarity search (top 4)
        |
        v
Top 2 chunks + question -> Groq -> terminal answer
```

## Requirements

- Node.js 18 or newer
- npm
- A Pinecone project and index
Create `Company_Chatbot_RAG/.env` with:

```env
GOOGLE_API_KEY=your_google_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name
GROQ_API_KEY=your_groq_api_key
```

The Pinecone index must be compatible with the configured embedding model, `gemini-embedding-2`. The application uses `PINECONE_INDEX_NAME` as both the selected index and the Pinecone namespace.

## Install and run

```bash
cd Company_Chatbot_RAG
npm install
```

The current ingestion entry point uses `./Rabbi__Hossain_Resume.pdf`:

```bash
node ingest.js
```

Then start the interactive question-answering loop:

```bash
node index.js
```

At the `You:` prompt, enter a question. Enter `q` to exit.

To index a different document, update the path passed to `indexPdf` in `ingest.js` before running ingestion. The file must be readable from the `Company_Chatbot_RAG` working directory.

## Implementation details

- `knowledgeBase.js` loads PDF pages with `pdf-parse`, preserves source and page metadata, and writes chunks to Pinecone.
- `utils/splitdoc.js` uses `RecursiveCharacterTextSplitter` with `chunkSize: 500` and `chunkOverlap: 100`.
- `utils/pineconeDb.js` creates the Google embedding model and connects to the existing Pinecone index.
The system prompt instructs Groq to answer politely from the supplied context and to say that the information was not provided when the context does not contain an answer. The application does not perform web search and does not persist chat history between process runs.

## Re-indexing notes

`ingest.js` adds documents using deterministic IDs such as `resume-chunk-0`. If the source PDF changes, old vectors may remain in Pinecone unless the index or namespace is cleared, or the ingestion strategy is updated to delete/reconcile previous IDs first. Avoid blindly re-running ingestion against a production namespace.

## Troubleshooting

- **PDF not found:** run the command from `Company_Chatbot_RAG` and verify the filename in `ingest.js`.
- **Pinecone connection failure:** verify the API key, index name, region/configuration, and embedding dimensions.
- **No relevant answers:** confirm ingestion completed and that querying uses the same index and namespace.
- The package has no automated test script.
- `ragEngine.js` performs a sample `LLM_Answare_Generate("Who is Rabbi")` call when imported/run, so startup can make an immediate model request.
- There is no HTTP API; interaction is currently terminal-only.

## Pipeline

```text
PDF -> PDFParse -> LangChain Documents -> text chunks -> Google embeddings -> Pinecone
                                                               |
question -> Google embedding -> similarity search (4) -> top 2 chunks -> Groq answer
```

## Project Structure

```text
Company_Chatbot_RAG/
|-- Rabbi__Hossain_Resume.pdf       Default source document
|-- ingest.js                       Indexes the PDF in Pinecone
|-- index.js                        Starts the interactive prompt
|-- knowledgeBase.js                Loads PDFs and writes document chunks
|-- ragEngine.js                    Retrieves context and calls Groq
`-- utils/
    |-- splitdoc.js                 500-character chunks, 100-character overlap
    |-- pineconeDb.js               Embedding and Pinecone store setup
    `-- searchKnowledgeBase.js      Four-result similarity search
```

## Requirements

- Node.js 20 LTS or newer is recommended.
- A Pinecone account and an existing index.
- A Google API key that can create Gemini embeddings.
- A Groq API key with access to `openai/gpt-oss-20b` through Groq.
- A PDF to index. The included default file is `Rabbi__Hossain_Resume.pdf`.

## Configuration

Create or update `.env` in this folder:

```env
GROQ_API_KEY=your_groq_api_key
GOOGLE_API_KEY=your_google_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name
```

The Pinecone index must be compatible with the embedding model configured in `utils/pineconeDb.js` (`gemini-embedding-2`). The code uses `PINECONE_INDEX_NAME` for both the selected index and the Pinecone namespace.

## Install And Index

```bash
cd Company_Chatbot_RAG
npm install
node ingest.js
```

`ingest.js` calls `indexPdf('./Rabbi__Hossain_Resume.pdf')`. To index another document, change that path or call `indexPdf` from a small script with the desired PDF path.

The ingestion process:

1. Reads the PDF into memory.
2. Extracts text page by page with `pdf-parse`.
3. Preserves the source path and zero-based page number as metadata.
4. Splits documents into chunks of 500 characters with 100 characters of overlap.
5. Creates a Pinecone-backed vector store and writes IDs such as `resume-chunk-0`.

## Ask Questions

```bash
node index.js
```

Example session:

```text
You: Who is Rabbi?
Assistant: ...
You: What experience is mentioned in the document?
Assistant: ...
You: q
```

The prompt searches Pinecone for four similar chunks, passes the first two chunks to Groq, and asks the model to answer from that context. When the answer is not present, the system prompt directs the model to say that the information was not provided instead of inventing it.

## Important Implementation Notes

- `ragEngine.js` currently invokes `LLM_Answare_Generate("Who is Rabbi")` at module load, so starting `index.js` may perform an initial query before the interactive prompt appears.
- The command-line loop exits only for the exact input `q`.
- There is no HTTP server in this project; it is a terminal application.
- The current package scripts do not provide a test command. Use the direct Node commands above for smoke testing.
- Re-indexing uses deterministic IDs. Check Pinecone behavior and index contents before repeatedly loading the same source.

## Troubleshooting

**PDF loading fails:** confirm the path is relative to `Company_Chatbot_RAG` and that the file exists.

**Pinecone connection fails:** verify the API key, index name, index region/configuration, and namespace.

**Embedding errors occur:** ensure the Google API key has access to the configured embedding model and that the Pinecone index dimension matches the embedding output.

**Answers are not grounded:** inspect retrieved chunks and confirm the source document was indexed successfully. The assistant can only use the context returned by similarity search.