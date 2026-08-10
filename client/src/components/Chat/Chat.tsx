import "./chat.css"

import Message from "../Message/Message";
import type { ChatKind, MessageResponse } from "../../utils";
import MessageInput from "../MessageInput/MessageInput";

type Props = {
  kind: ChatKind
  messages: MessageResponse[]
}

const Chat = ({ kind, messages }: Props) => {
  return (
    <div id="chat">
      <aside id={`current-${kind}-details`} className="border-b-2 flex p-3">
        <div className="details flex-1">
          Details
        </div>
        <div className="search-message flex">
          <input type="text" name="searchMessage" id="search-message" />
          <p>s</p>
        </div>
      </aside>
      <main className="overflow-hidden">
        <ul id={`current-${kind}-messages`} className="flex flex-col items-start gap-2 p-3">
          {messages.map(message => 
            <Message message={message}/>
          )}
        </ul>
      </main>
      <MessageInput/>
    </div>
  )
}

export default Chat