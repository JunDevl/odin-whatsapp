import type { ChatKind } from "../../utils";

type Props = {
  kind: ChatKind
  chats: Record<string, any>[]
}

const ChatList = ({ kind, chats }: Props) => {
  return (
    <nav id={`${kind}s-sidebar`}>
      <div id="search-chat">
        <input type="text" name="" id="" />
      </div>
      <ul id={`${kind}s`}>
        {chats.map(chat => <li className={`${kind}`}>
          {chat.whatever}
        </li>)}
      </ul>
    </nav>
  )
}

export default ChatList