import { useRef, type SubmitEvent } from "react";
import type { ChatKind, ChatType, Contact, GroupResponse } from "../../utils";
import AddChat from "../AddChat/AddChat";

type Props<T extends Contact | GroupResponse> = {
  kind: ChatKind
  chats: ChatType<T>[]
}

const ChatList = <T extends Contact | GroupResponse, >({ kind, chats }: Props<T>) => {
  const newChatModal = useRef<HTMLDialogElement>(null);

  return (
    <nav id={`${kind}s-sidebar`}>
      <AddChat kind={kind} ref={newChatModal}/>
      <div id="new_chat">
        <button id={`add_${kind}`} onClick={() => newChatModal.current!.showModal()}>
          {`Add ${kind[0].toUpperCase()}${kind.slice(1)}`}
        </button>
      </div>
      <div className="list">
        <div id="search-chat" className="m-2 bg-gray-700 h-8 flex">
          <input type="text" name="" id="" placeholder="Search Chat"/>
          <button className="flex items-center px-3">s</button>
        </div>
        <ul id={`${kind}s`} className="flex flex-col gap-2">
          {chats.map((chat, i) => <li className={`${kind} bg-gray-600`} key={i}>
            {chat.chat.name}
          </li>)}
        </ul>
      </div>
    </nav>
  )
}

export default ChatList