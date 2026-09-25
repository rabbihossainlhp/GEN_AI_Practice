import Usermessage from "./Usermessage";
import AgentMessage from "./AgentMessage";
import { useEffect,useRef } from "react";

export default function Chatwindow({messages}) {
    const bottomRef = useRef(null);

    
    useEffect(()=>{
        bottomRef.current?.scrollIntoView({
            behavior:"smooth",
            block:"end",
        })
    },[messages])


    return (
        <div className="text-white mb-3 font-mono relative w-3/6 m-auto overflow-x-hidden h-screen hide-scrollbar ">
            {/* User message's div this is */}
            {/* <div className="w-full   flex justify-end">
                <p className=" text-white text-end px-4 w-fit mt-4 mr-2 bg-slate-700 rounded-2xl py-2 ">Hellow How are you</p>
            </div> */}

            {messages.map((msg)=>
                msg.role === "user"?(
                    <Usermessage key={msg.id} message={msg.text}/>
                ):

                    <AgentMessage key={msg.id} message={msg.text}/>
            )}


            {/* This section for containing agent's reply */}
            {/* <div className="w-full flex justify-start ">
                <p className=" text-white text-end px-4 w-fit mt-4 ml-2 bg-slate-700 rounded-2xl py-2">Fine how can I assist you today ?</p>
            </div> */}
            
        </div>
    )
}
