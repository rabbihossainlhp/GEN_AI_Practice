import { GenerateAnsByLLM } from "./LLmEngine.js";

export  const userQuestionHandler = async (req,res) =>{
    const {message} =  req.body;

    const result = await GenerateAnsByLLM(message);

    console.log("Ans: ", result);

    return res.status(200).json({
        success:true,
        message:result,
    })
}