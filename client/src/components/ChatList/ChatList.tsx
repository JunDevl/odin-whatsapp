import type { ChatKind, ChatType, Contact, GroupResponse } from "../../utils";

type Props<T extends Contact | GroupResponse> = {
  kind: ChatKind
  chats: ChatType<T>[]
}

const ChatList = <T extends Contact | GroupResponse, >({ kind, chats }: Props<T>) => {
  return (
    <nav id={`${kind}s-sidebar`}>
      <div id="search-chat" className="m-2 bg-gray-700 h-8 flex">
        <input type="text" name="" id="" />
        <p className="flex items-center px-3">s</p>
      </div>
      <ul id={`${kind}s`} className="flex flex-col gap-2">
        {chats.map(chat => <li className={`${kind} bg-gray-600`}>
          test
        </li>)}
      </ul>
    </nav>
  )
}

export default ChatList