import Message from "../Message/Message";
import type { ChatKind } from "../../utils";

type Props = {
  kind: ChatKind
  messages: Record<string, any>[]
}

const Chat = ({ kind, messages }: Props) => {
  return (
    <div>
      <aside id={`current-${kind}-details`}>
        <div className="details">
          Details
        </div>
        <div className="search-message">
          <input type="text" name="searchMessage" id="search-message" />
        </div>
      </aside>
      <main>
        <ul id={`current-${kind}-messages`}>
          {messages.map(message => 
            <Message message={message}/>
          )}
        </ul>
      </main>
    </div>
  )
}

export default Chat