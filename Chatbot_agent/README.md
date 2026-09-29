# Chatbot Agent

`Chatbot_agent` is a two-part conversational web application. The React client renders a chat interface, while the Express server sends user messages to Groq and can use Exa as a web-search tool when the model decides that current information is needed.

## Limitations

- Conversation cache is process-local and disappears when the server restarts.
- The default client/server ports are inconsistent; configure `PORT=4000` or update the client URL.
- There is no authentication, rate limiting, persistent storage, or automated server test suite.
- Provider errors are not converted into a consistent API error response.
|-- Client/
|   |-- src/App.jsx                  Conversation state and client workflow
|   |-- src/components/              Chat window, input, and message components
|   `-- src/utils/api.services.js    POST request to the API
`-- Server/
    |-- app.js                       Express application and listener
    |-- Route.js                     /api/chat route
    |-- Controller.js                Request validation and response shape
    `-- LLmEngine.js                 Groq tool-calling loop and cache
```

## Prerequisites

- Node.js 20 LTS or newer is recommended.
- A Groq API key.
- An Exa API key for current-information questions or any query where Groq chooses the web-search tool.

## Configuration

Create `Server/.env`:

```env
PORT=4000
GROQ_API_KEY=your_groq_api_key
EXA_API_KEY=your_exa_api_key
```

`PORT` is optional for the server, but `4000` is needed with the current client because `Client/src/utils/api.services.js` calls `http://localhost:4000/api/chat`. If `PORT` is omitted, Express listens on `5000`; in that case, update the client URL to match.

## Run Locally

Terminal 1, API server:

```bash
cd Chatbot_agent/Server
npm install
npm run dev
```

Terminal 2, frontend:

```bash
cd Chatbot_agent/Client
npm install
npm run dev
```

Open the local Vite URL printed by the client. For a production-style client build:

```bash
cd Chatbot_agent/Client
npm run build
npm run preview
```

The server can also be started without nodemon using `npm start`.

## API

### `GET /`

Returns a simple server health response.

### `POST /api/chat`

Request:

```json
{
  "message": "What is the capital of Bangladesh?",
  "userId": "a-stable-conversation-id"
}
```

Successful response:

```json
{
  "success": true,
  "message": "The capital of Bangladesh is Dhaka."
}
```

Both fields are required. The controller returns HTTP `400` when either field is missing. The client creates a UUID once and stores it as `conversationId` in `localStorage`, allowing the server cache to associate later messages with the same conversation.

## Request Flow

1. `App.jsx` adds the user's message to the UI and calls `ServerCall`.
2. `ServerCall` posts JSON to `/api/chat`.
3. `Controller.js` validates the body and calls `GenerateAnsByLLM`.
4. `LLmEngine.js` restores the cached message history for `userId`.
5. Groq either returns an answer or requests the `webSearch` tool.
6. Exa searches for the requested information; the result is added to the message history.
7. Groq generates the final response, which is cached for up to 24 hours and returned to the client.

The model is configured as `openai/gpt-oss-20b` through Groq, with deterministic temperature `0` and a 500-token completion limit. The system prompt also instructs the assistant to answer in the user's language and to use web search for current information.

## Development Notes

- CORS is enabled for all origins in the current Express app.
- Morgan logs HTTP requests in development.
- Conversation history is held in `node-cache`; it is not a database and is lost on restart.
- The retry loop allows multiple tool-call rounds before returning a fallback message.
- The browser displays a generic error message when the API request fails.

## Troubleshooting

**The browser reports a network error:** confirm the server is running on port `4000`, then check `http://localhost:4000/`.

**The server starts but generation fails:** verify `GROQ_API_KEY`, model access, and the server terminal output.

**Search fails:** verify `EXA_API_KEY` and provider quota. Non-current questions may not invoke search at all.

**The UI does not update:** inspect the browser console and confirm the API response has a `message` property.