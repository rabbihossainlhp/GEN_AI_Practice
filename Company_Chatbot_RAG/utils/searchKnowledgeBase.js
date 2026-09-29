import { createPineconeStore } from "./pineconeDb.js";

export const searchKnowledgeBase = async(question) =>{
    const vectorStore = await createPineconeStore();
    return vectorStore.similaritySearch(question,4)
}