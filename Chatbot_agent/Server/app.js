import express from "express"




const app = express();


let port = process.env.PORT || 5000;


app.get("/",(req,res)=>{
    res.send("Hellow")
})

app.listen(port,()=>{
    console.log(`your server is running here : http://localhost:${port}`)
})