import { useState } from "react"
import Chatwindow from "./components/Chatwindow"
import Textarea from "./components/Textarea"

function App() {

  let [messages,setMessage] = useState([]);

  function sendMessage(messageText){
    const userMessage = {
      id:crypto.randomUUID(),
      role:"user",
      text:messageText,
    };

    setMessage((prev)=>[
      ...prev,
      userMessage
    ]);


    // agent's message demo...
    const agentMessage = {
      id:crypto.randomUUID(),
      role:"agent",
      text : "Hi I'm fine what about you."
    }
      
    setTimeout(() => {
        setMessage((prev)=>[
          ...prev,
          agentMessage
        ])
    }, 1500);
  }



  return (
    <div className="bg-slate-800 relative py-3 flex flex-col h-screen overflow-x-hidden">
      <Chatwindow messages={messages}/>

      {/* messge submit section */}
      <div className="w-3/6 m-auto ">
        <Textarea onSend={sendMessage}/>
      </div>
      
    </div>
  )
}

export default App
