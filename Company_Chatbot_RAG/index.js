import readline from "node:readline/promises"
import { LLM_Answare_Generate } from "./ragEngine.js"


    const rl =  readline.createInterface({input: process.stdin,  output:process.stdout})

while(true){

    const qs = await rl.question("You: ");

    if(qs==="q") break;
    
    
    const answare = await LLM_Answare_Generate(qs)

    console.log("Assitant: ",answare)

}    

rl.close();