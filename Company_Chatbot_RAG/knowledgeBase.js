import "dotenv/config";
import { Document } from "@langchain/core/documents";
import { PDFParse } from "pdf-parse";
import {readFile}  from "node:fs/promises";
import { splitPdfDoc } from "./utils/splitdoc.js";
import { createPineconeStore } from "./utils/pineconeDb.js";



export const loadPdfDoc = async (filepath) =>{
    const buffer = await readFile(filepath);

    const parser = new PDFParse({
        data: new Uint8Array(buffer)
    })

    try{
        const {pages} = await parser.getText()
        // console.log(pages)

        return pages.map((page)=>
            new Document({
                pageContent:page.text,
                metadata:{
                    source:filepath,
                    page:page.num-1,
                }
            })
        )
    }finally{
        await parser.destroy()
    }
}



export const indexPdf = async (filepath) => {
    //split the docs here using util's funciton....
    const chunks = await splitPdfDoc(loadPdfDoc,filepath);
    //crate vectorStrore also using util's funciton..
    const vectorStore = await createPineconeStore();

    const ids =  chunks.map((_,indx)=> {return `resume-chunk-${indx}`})

    await vectorStore.addDocuments(chunks,{
        ids
    })

    console.log(`Indexed ${chunks.length} chunks in Pinecone`);

    return vectorStore;
}






