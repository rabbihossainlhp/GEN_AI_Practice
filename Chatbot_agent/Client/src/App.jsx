import { useState } from "react"
import Chatwindow from "./components/Chatwindow"
import Textarea from "./components/Textarea"
import { ServerCall } from "./utils/api.services"



function App() {

  const [messages, setMessage] = useState([]);
  const [isResponding, setIsResponding] = useState(false);

  const [conversationId] = useState(()=> {
    const existConversationId = localStorage.getItem("conversationId");
    
    if(existConversationId){
      return existConversationId;
    }

    const newId = crypto.randomUUID();
    localStorage.setItem("conversationId",newId);

    return newId;
  });

  async function sendMessage(msgFromUser) {
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: msgFromUser,
    };

    setMessage((prev) => [
      ...prev,
      userMessage
    ]);

    setIsResponding(true);



    // agent's message 
    try {
      const response = await ServerCall(msgFromUser,conversationId);

      const agentMessage = {
        id: crypto.randomUUID(),
        role: "agent",
        text: response.message
      }

      setMessage((prev) => [
        ...prev,
        agentMessage
      ])

    } catch (error) {
      setMessage((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "agent",
          text: "Sorry, I could not generate a response."
        }
      ])
    } finally {
      setIsResponding(false);
    }

  }



  return (
    <div className="bg-slate-800 relative py-3 flex flex-col h-screen overflow-x-hidden">
      <Chatwindow messages={messages} isResponding={isResponding} />

      {/* messge submit section */}
      <div className="w-3/6 m-auto ">
        <Textarea onSend={sendMessage} />
      </div>

    </div>
  )
}

export default App
