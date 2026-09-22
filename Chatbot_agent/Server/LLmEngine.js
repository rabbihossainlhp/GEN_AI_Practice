import { config } from "dotenv";
config()
import Groq from "groq-sdk";
// import { tavily } from "@tavily/core";
import Exa from "exa-js";




const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY })
const exa = new Exa(process.env.EXA_API_KEY);


export async function GenerateAnsByLLM(userMessage) {


    const messages = [
        {
            role: "system",
            content: `Suppose Your the smart assitent and  , answare the question. 
                You have access to following tools:
                1.webSearch({query}:{query:string}) //Search the latest information and realtime data on the internet
                current date and time is ${new Date().toUTCString()}
                `
        },
        //temporarily comment for make this dynamic
        // {
        //     role: "user",
        //     content: "Hi, what is bd's capital",
        // },
    ]


    messages.push({
        role: "user",
        content: userMessage
    });


    while (true) {
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
        console.log({
            finishReason:completion.choices[0].finish_reason,
            content:completion.choices[0].message.content,
            toolCalls:completion.choices[0].message.tool_calls
        })

        if (!toolCalls) {
            // console.log(`AI assitant: `, completion.choices[0].message.content)
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
            type:"auto",
            numResults:2,
            contents:{
                text:{
                    maxCharacters:10000
                },
                highlights:true
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