import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const splitPdfDoc = async(loader,filePath)=>{
    const pages = await loader(filePath);
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize:500,
        chunkOverlap:100
    })

    return splitter.splitDocuments(pages)
}