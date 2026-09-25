import express from "express"
import router from "./Route.js";
import morgan from "morgan";
import cors from "cors";




const app = express();

app.use(cors())
app.use(morgan("dev"))
app.use(express.json())

let port = process.env.PORT || 5000;


app.get("/",(req,res)=>{
    res.send("Hellow")
})

app.use("/api",router);


app.listen(port,()=>{
    console.log(`your server is running here : http://localhost:${port}`)
})