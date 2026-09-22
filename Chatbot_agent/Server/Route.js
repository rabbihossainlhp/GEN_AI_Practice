import { Router } from "express";
import {userQuestionHandler} from "./Controller.js";


const router = Router();

//first endpoint router to reach the question's answare......>
router.post("/chat",userQuestionHandler)


export default router;