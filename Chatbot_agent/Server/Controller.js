import { GenerateAnsByLLM } from "./LLmEngine.js";

export  const userQuestionHandler = async (req,res) =>{
    const {message,userId} =  req.body;

    if(!message || !userId){
        return res.status(400).json({
            success:true,
            message:"All fields are required.."
        })
    }

    const result = await GenerateAnsByLLM(message,userId);

    console.log("Ans: ", result);

    return res.status(200).json({
        success:true,
        message:result,
    })
}