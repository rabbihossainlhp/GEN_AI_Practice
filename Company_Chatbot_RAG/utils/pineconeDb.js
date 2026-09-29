import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import {PineconeStore} from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";



export const createPineconeStore = async ()=>{
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey:process.env.GOOGLE_API_KEY,
        modelName:"gemini-embedding-2"
    });

    const pinecone = new PineconeClient({apiKey:process.env.PINECONE_API_KEY});

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    return PineconeStore.fromExistingIndex(embeddings,{
        pineconeIndex,
        maxConcurrency:5,
        namespace:process.env.PINECONE_INDEX_NAME
    })

}

