# invokeLLM

`invokeLLM` is a minimal terminal-based LLM agent example. It maintains a conversation in memory, sends messages to Groq, and exposes a `webSearch` function backed by Tavily so the model can request current information when needed.

## Flow

```text
Terminal question
        |
        v
Groq chat completion
        |
        +-- normal answer --------------------+
        |                                     |
        +-- webSearch tool call -> Tavily ----+
                                              v
                                      answer printed to terminal
```

## Requirements


## Configuration

Create `invokeLLM/.env`:

```env
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
```

Keep this file out of version control. The application loads it with `dotenv` when started from this directory.

## Install and run

```bash
cd invokeLLM
npm install
node app.js
```

Use the interactive prompt:

```text
You: What is the latest news about ...?
Calling tool....>
AI assitant: ...
```

Enter `exit` to end the session. The current conversation is held in the running process and is lost when the process exits.

## Tool-calling behavior

The model is given a `webSearch` function schema with a required `query` string. When Groq requests that function, `app.js` calls Tavily with advanced search and up to two results, adds the returned text as a tool message, and loops until Groq returns a normal assistant message.

The model is configured with:


## Source map


## Error handling

If Tavily fails because of authorization, limits, or another provider error, the helper logs the error and returns `Search failed due to authorization or limits.` to the model. Groq request failures are not currently wrapped in a top-level recovery handler, so inspect the terminal output and provider configuration when the process exits unexpectedly.

## Limitations

- No automated tests or lint script are configured.
- There is no persistent conversation storage.
- Search results are passed as text without source URLs being displayed by the CLI.
- There is no input validation, authentication, rate limiting, or production deployment configuration.