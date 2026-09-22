import {config} from "dotenv";
config()
import readline from 'node:readline/promises'
import Groq from "groq-sdk";
import {tavily} from "@tavily/core";




const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tavilyClient = tavily({apiKey:process.env.TAVILY_API_KEY})


export async function main() {

    const rl = readline.createInterface({input:process.stdin, output:process.stdout})


    const messages = [
        {
            role: "system",
            content: `Suppose Your the smart assitent , answare the question. 
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


    while(true){

        const quesetion = await rl.question("You: ");

        messages.push({
            role:"user",
            content:quesetion
        });

        //to exit from terminal.
        if(quesetion === "exit") break;

        while (true) {
            const completion = await groq.chat.completions.create({
                model: "openai/gpt-oss-20b",
                max_completion_tokens: 200,
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


            // console.log(completion)

            if (!toolCalls) {
                console.log(`AI assitant: `, completion.choices[0].message.content)
                break;
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
    
    rl.close()

}




main();





//tool__> to searching web....

async function webSearch({query}){
    console.log("Calling tool....>")
    try{
        const response = await tavilyClient.search(query, {
            searchDepth: "advanced",
            maxResults:2
        });

        const finalResult = response.results.map(result => result.content).join("\n\n");
        // console.log("Response from webSearch:----> ", finalResult);

        return finalResult;
    }catch(error){
        console.error("Something is wrong during websearch by tavily ", error );
        return "Search failed due to authorization or limits."
    }

}