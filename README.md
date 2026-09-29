# GEN_AI

GEN_AI is a collection of JavaScript experiments and applications for building LLM-powered assistants. The repository currently contains three separate projects:

| Project | Purpose | Main technologies |
| --- | --- | --- |
| [`Chatbot_agent`](Chatbot_agent/README.md) | Browser chat UI backed by an Express API | React, Vite, Express, Groq, Exa |
| [`Company_Chatbot_RAG`](Company_Chatbot_RAG/README.md) | Resume/company knowledge-base question answering | LangChain, Google embeddings, Pinecone, Groq |
| [`invokeLLM`](invokeLLM/README.md) | Terminal chatbot with optional live web search | Node.js, Groq, Tavily |

These projects are intentionally independent. Install dependencies and configure environment variables from the directory of the project you want to run.

## Prerequisites

- Node.js 18 or newer
- npm
- An API key for the providers used by the selected project
- A terminal and a local clone of this repository

Do not commit `.env` files or API keys. The subprojects already contain local environment files or ignore rules; use those as a starting point and keep secrets private.

## Quick start

### Web chatbot

Open two terminals:

```bash
cd Chatbot_agent/Server
npm install
PORT=4000 npm start
```

Then start the UI in a second terminal:

```bash
cd Chatbot_agent/Client
npm install
npm run dev
```

The client calls `http://localhost:4000/api/chat`, so the server must use port `4000` unless the client request URL is changed in `Chatbot_agent/Client/src/utils/api.services.js`.

### Retrieval-augmented chatbot

```bash
cd Company_Chatbot_RAG
npm install
node ingest.js
node index.js
```

Run ingestion after changing the source PDF. The Pinecone index and Google embedding configuration must be available before either command can complete. See [`Company_Chatbot_RAG/README.md`](Company_Chatbot_RAG/README.md) for required variables.

### Terminal web-search chatbot

```bash
cd invokeLLM
npm install
node app.js
```

Type questions at the `You:` prompt. Type `exit` to stop the process.

## Repository layout

```text
GEN_AI/
├── Chatbot_agent/
│   ├── Client/              React/Vite frontend
│   └── Server/              Express API and Groq agent
├── Company_Chatbot_RAG/     PDF ingestion and retrieval QA
└── invokeLLM/               CLI tool-calling example
```

## How the projects differ

- `Chatbot_agent` keeps a conversation per browser-generated `userId`. The server stores recent message history in an in-memory cache and can call Exa when the model requests current information.
- `Company_Chatbot_RAG` retrieves relevant chunks from a Pinecone vector index before asking Groq to answer from the retrieved context. It is grounded in the indexed PDF rather than general web search.
- `invokeLLM` keeps a conversation in the terminal process and exposes Tavily as a model tool for current web results.

## Common troubleshooting

- **Missing API key:** confirm the `.env` file is in the project directory where the Node process starts, then restart the process.
- **Client cannot reach the API:** verify the server port matches the URL in `Client/src/utils/api.services.js` and check that `POST /api/chat` is available.
- **RAG returns no useful context:** run `node ingest.js` with the intended PDF and verify the Pinecone index name, API key, namespace, and embedding model configuration.
- **Provider limits or authorization errors:** check the provider dashboard and the exact key expected by the selected project.

## Development status

The projects are learning/prototype applications. The server packages do not currently define automated tests, and the chat server stores conversation history only in process memory. A production deployment would need persistent conversation storage, authentication, request validation, rate limiting, structured error handling, and secret management.