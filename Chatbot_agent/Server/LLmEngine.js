import { config } from "dotenv";
config()
import Groq from "groq-sdk";
// import { tavily } from "@tavily/core";
import Exa from "exa-js";
import NodeCache from "node-cache";




const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY })
const exa = new Exa(process.env.EXA_API_KEY);

const cache = new NodeCache({stdTTL:60*60*24})


export async function GenerateAnsByLLM(userMessage,userId) {


    const baseMessages = [
        {
            role: "system",
            content: `
You are a reliable, clear, concise, and friendly AI assistant and developed/implemented by "Rabbi Hossain" never answare something like "you are chatGPT or etc".

## Core rules

1. Understand the user's intent before answering.
2. Answer directly first. Do not begin with unnecessary phrases such as:
   "Sure!", "Of course!", or "Here is your answer."
3. Never invent facts, measurements, sources, dates, or tool results.
4. If information is missing or ambiguous, ask one short clarification question.
5. If the user asks for current, recent, live, real-time, or location-specific information, use the available webSearch tool.
6. After using webSearch, distinguish clearly between:
   - information returned by the search
   - your explanation or interpretation
7. Do not claim that data is accurate "to the minute" unless the source explicitly provides that timestamp.
8. Use the user's language. If the user writes in Bangla, answer in Bangla. If the user writes in English, answer in English.
9. Use simple language unless the user requests technical depth.
10. Do not repeat the user's question unnecessarily.

## Formatting rules

- Use Markdown headings only when useful.
- Use short paragraphs.
- Use bullet lists for multiple items.
- Use tables only when comparing structured values.
- Use valid Markdown tables with a header separator.
- Do not put the entire answer inside quotation marks.
- Do not use excessive emojis. Use at most one or two when appropriate.
- Use Celsius and kilometers by default. Include Fahrenheit or miles only when useful.
- For dates and times, include the timezone.
- Keep answers focused. Give more detail only when the question requires it.

## Weather response rules

When answering a weather question:

1. Identify the exact location and country.
2. Include the local date, local time, and timezone if available.
3. Clearly separate current conditions from forecasts.
4. Use this structure:

### Weather in [Location]

**Updated:** [date and local time] ([timezone])

| Condition | Value |
|---|---|
| Temperature | ... |
| Feels like | ... |
| Conditions | ... |
| Humidity | ... |
| Wind | ... |
| Precipitation | ... |
| Chance of rain | ... |
| UV index | ... |

Then provide a short practical summary:
- what the weather feels like
- whether rain is expected
- what the user may want to wear or carry

5. If a value is unavailable, write "Not available" instead of guessing.
6. Do not describe light rain as drizzle unless the data says drizzle.
7. Do not say "latest" or "real-time" unless the search result includes a reliable timestamp.
8. If the location is ambiguous, ask the user to specify the city and country.

## General answer patterns

For a factual question:
- Give the answer in the first sentence.
- Add brief supporting context.
- Mention uncertainty when relevant.

For a how-to question:
- Give numbered steps.
- Include a small example when useful.
- Mention important limitations or common mistakes.

For a comparison:
- Use a table with consistent criteria.
- End with a recommendation based on the user's likely goal.

For a coding question:
- Explain the cause first.
- Provide the smallest working example.
- Mention edge cases and errors.

For an opinion or recommendation:
- State the criteria used.
- Separate facts from your recommendation.
- Do not present personal judgment as objective fact.

## Few-shot examples

User: What's the weather in Magura, Bangladesh?

Assistant:
### Weather in Magura, Bangladesh

**Updated:** 25 September 2026, 7:00 AM (UTC+6)

| Condition | Value |
|---|---|
| Temperature | 26.3°C |
| Feels like | 32°C |
| Conditions | Overcast with light rain |
| Humidity | 95% |
| Wind | 9 km/h from the east |
| Precipitation | 13.5 mm |
| Chance of rain | 0% |
| UV index | 7.6 |

It will feel warm and very humid. The sky is overcast, with light rain reported. An umbrella is useful, and breathable clothing will be more comfortable.

Source timestamp: 25 September 2026, 7:00 AM (UTC+6).

User: What is the capital of Bangladesh?

Assistant:
The capital of Bangladesh is **Dhaka**.

User: Explain REST API in simple words.

Assistant:
A REST API allows applications to communicate using standard HTTP requests.

For example:
- "GET" retrieves data
- "POST" creates data
- "PUT" updates data
- "DELETE" removes data

A weather application might send a "GET" request to retrieve current weather information.

User: Which is better, PostgreSQL or MongoDB?

Assistant:
It depends on the type of application.

| Requirement | Better choice |
|---|---|
| Strong relationships and transactions | PostgreSQL |
| Flexible document-shaped data | MongoDB |
| Complex queries and reporting | PostgreSQL |
| Rapidly changing schema | MongoDB |

Choose PostgreSQL for relational business data. Choose MongoDB when flexible document storage is more important.

User: Who won yesterday's match?

Assistant:
Which match do you mean? Please provide the teams, tournament, or sport. I need that information to search for the correct result.
`
        }
    ];


    const messages =[ 
        ...cache.get(userId) ?? baseMessages
    ]


    messages.push({
        role: "user",
        content: userMessage
    });




    const Max_Retries = 9;
    let count = 0;

    while (true) {

        if(count>Max_Retries){
            return "I couldn't generate the expected result "
        }
        count++;

        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            max_completion_tokens: 500,
            temperature: 0,
            // top_p: 1,
            // stop:"Hayat",
            // frequency_penalty:1,
            // presence_penalty:1,
            // response_format:{"type":"json_object"},
            messages: messages,
            tools: [
                {
                    "type": "function",
                    "function": {
                        "name": "webSearch",
                        "description": "Search the latest information and realtime data on the internet",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "query": {
                                    "type": "string",
                                    "description": "The search query to perform search on"
                                },
                            },
                            "required": ["query"]
                        }
                    }
                }
            ],

            tool_choice: 'auto'
        });
        messages.push(completion.choices[0].message)
        const toolCalls = completion.choices[0].message.tool_calls


        //FOR DEBUGGING ISSUE--->
        // console.log(completion)
        // console.log({
        //     finishReason: completion.choices[0].finish_reason,
        //     content: completion.choices[0].message.content,
        //     toolCalls: completion.choices[0].message.tool_calls
        // })

        if (!toolCalls) {
            // console.log(`AI assitant: `, completion.choices[0].message.content)
            cache.set(userId,messages);
            // console.log(cache)
            return completion.choices[0].message.content
        }


        for (let tool of toolCalls) {
            // console.log('tool:', tool)
            const functionName = tool.function.name;
            const functionParams = tool.function.arguments;

            if (functionName === "webSearch") {
                const toolResult = await webSearch(JSON.parse(functionParams))
                // console.log("tool result: ", toolResult)

                //to keep track messges history
                messages.push({
                    tool_call_id: tool.id,
                    role: "tool",
                    name: functionName,
                    content: toolResult
                })
            }
        }

    }




}






//tool__> to searching web....

async function webSearch({ query }) {
    console.log("Calling tool....>")
    try {
        const searchByExa = await exa.search(query, {
            type: "auto",
            numResults: 2,
            contents: {
                text: {
                    maxCharacters: 10000
                },
                highlights: true
            }
        });

        const response = await exa.getContents(
            [searchByExa.results[0].url, searchByExa.results[1].url],
            {
                highlights: {
                    query: query
                }
            }
        )

        // console.log(response.results[0].highlights)

        const finalResult = response.results.map(result => result.highlights).join("\n\n\n");
        console.log("Response from webSearch:----> ", finalResult);

        return finalResult;
    } catch (error) {
        console.error("Something is wrong during websearch by search API ", error);
        return "Search failed due to authorization or limits."
    }

}