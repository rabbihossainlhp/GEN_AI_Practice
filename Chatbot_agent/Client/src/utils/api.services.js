export const ServerCall = async(text) =>{
    const response = await fetch("http://localhost:4000/api/chat",{
        method:"POST",
        headers:{
            "content-type":"application/json"
        },
        body:JSON.stringify({message:text})
    })


    if(!response.ok){
        throw new Error("Error--> generating response");
        
    }

    const result = await response.json();
    
    return result;

    
}