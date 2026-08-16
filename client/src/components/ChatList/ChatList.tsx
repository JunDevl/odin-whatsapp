import { Suspense, useContext, useEffect, useRef } from "react";
import type { ChatKind, ChatType, Contact, GroupResponse } from "../../utils";
import AddChat from "../AddChat/AddChat";
import { SelectedChatContext } from "../../utils";

type Props<T extends Contact | GroupResponse> = {
  kind: ChatKind
  chats: ChatType<T>[]
}

const ChatList = <T extends Contact | GroupResponse, >({ kind, chats }: Props<T>) => {
  const newChatModal = useRef<HTMLDialogElement>(null);
  const {selectedChat, setSelectedChat} = useContext(SelectedChatContext);

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
          <Suspense>
            {chats.length > 0 && chats.map((chat, i) => 
              <li 
                className={`${kind} bg-gray-600 hover:bg-gray-500 cursor-pointer data-[selected=true]:bg-white`} 
                data-selected={selectedChat?.name === chat.chat.name}
                key={i} 
                onClick={() => setSelectedChat({kind, name: chat.chat.name})}
              >
                {chat.chat.name}
              </li>
            )}
          </Suspense>
        </ul>
      </div>
    </nav>
  )
}

export default ChatList