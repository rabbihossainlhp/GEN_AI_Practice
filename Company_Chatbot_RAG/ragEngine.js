import { indexPdf } from "./knowledgeBase.js";
import {searchKnowledgeBase} from "./utils/searchKnowledgeBase.js"
import {Groq}  from "groq-sdk"



const groq = new Groq({apiKey:process.env.GROQ_API_KEY})


// console.log("Starting RAG application")

// console.log("Starting Pinecone search")




export const LLM_Answare_Generate = async (question) => {

    const results = await searchKnowledgeBase(question);

    const context = results.slice(0,2).map((result)=>result.pageContent).join("\n\n"); 
    // console.log("context is = ", context , context.length)

    const userQueryWithContext = `question from user : ${question} and context is ${context}`

    const llm = await groq.chat.completions.create({
        model:"openai/gpt-oss-20b",
        messages:[
            {
                role:"system",
                content:"You are a personal assistant of Rabbi Hossain . you have to answare all of the user's question polietly  based on provided context so that you don't have to hallusunation if something not found on context so just simple answare  I don't have that info of Golam Rabbi didn't provided that info"
            },
            {
                role:"user",
                content:userQueryWithContext
            }
        ]
    })

    return llm.choices[0].message.content;
    // console.log(llm.choices[0].message.content)
}


await LLM_Answare_Generate("Who is Rabbi")