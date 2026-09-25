import { useState } from "react"
import { ServerCall } from "../utils/api.services";

export default function Textarea({ onSend }) {
  let [text, setText] = useState('');

  async function handleSendButton() {

    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    };

    const getResponse = await ServerCall(trimmedText);
    
    onSend(trimmedText,getResponse.message);
    
    setText("");
  }


  return (
    <div className=" h-32 bg-slate-900 flex flex-col justify-evenly rounded-3xl overflow-hidden py-2 px-5">
      <textarea name="text-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyUp={(e)=>{
          if(e.key === "Enter" && !e.shiftKey){
            handleSendButton();
          }
        }}
        placeholder="Ask anything to AI agent?" id="textinput"
        className="w-full resize-none bg-transparent outline-none text-white"  >
      </textarea>

      <div className="w-full text-black flex justify-between ">
        <p className=" border border-sky-400  text-white  py-1 px-4   rounded-full" >Tools</p>

        <button onClick={handleSendButton} className=" bg-white py-1 px-4 font-bold cursor-pointer active:scale-95  transition-all duration-75 rounded-full">Send</button>
      </div>
    </div>
  )
}
