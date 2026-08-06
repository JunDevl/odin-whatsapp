import Message from "../Message/Message";

type Props = {
  messages: Record<string, any>[]
}

const Chat = ({ messages }: Props) => {
  return (
    <>
      <aside id="current-chat-details">
        details
      </aside>
      <main>
        <ul id="current-chat-messages">
          {messages.map(message => 
            <Message message={message}/>
          )}
        </ul>
      </main>
    </>
  )
}

export default Chat