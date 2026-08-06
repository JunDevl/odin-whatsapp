type Props = {
  chats: Record<string, any>[]
}

const ChatList = ({ chats }: Props) => {
  return (
    <nav id="chats-sidebar">
      <ul id="chats">
        {chats.map(chat => <li className="chat">
          {chat.whatever}
        </li>)}
      </ul>
    </nav>
  )
}

export default ChatList