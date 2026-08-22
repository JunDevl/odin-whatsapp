import { Suspense, useContext, useRef } from "react";
import type { ChatType, Contact } from "../../utils";
import AddChat from "../AddChat/AddChat";
import { SelectedChatContext } from "../../utils";
import type { Group } from "@types";
import type { EntityKind } from "@packages/utils";

type Props<T extends Contact | Group> = {
  kind: EntityKind
  chats: ChatType<T>[]
}

const ChatList = <T extends Contact | Group, >({ kind, chats }: Props<T>) => {
  const newChatModal = useRef<HTMLDialogElement>(null);
  const {selectedChat, setSelectedChat} = useContext(SelectedChatContext);

  return (
    <nav id={`${kind}s-sidebar`} className="overflow-hidden">
      <AddChat kind={kind} ref={newChatModal}/>
      <div id="new_chat">
        <button id={`add_${kind}`} onClick={() => newChatModal.current!.showModal()}>
          {`Add ${kind[0].toUpperCase()}${kind.slice(1)}`}
        </button>
      </div>
      <div className="list">
        <div id="search-chat" className="search m-2 bg-gray-700 h-8">
          <input type="text" name="" id="" placeholder="Search Chat"/>
          <button>s</button>
        </div>
        <ul id={`${kind}s`} className="flex flex-col gap-2">
          <Suspense>
            {chats.length > 0 && chats.map((chat, i) => 
              <li 
                className={`${kind} bg-gray-600 hover:bg-gray-500 cursor-pointer data-[selected=true]:bg-white py-2 rounded-md`} 
                data-selected={
                  selectedChat?.kind === "user" && kind === "user" ? 
                  selectedChat?.name === chat.chat.name :
                  (selectedChat?.kind === "group" && "id" in chat.chat) &&
                  selectedChat?.id === chat.chat.id
                }
                key={i} 
                onClick={() => setSelectedChat(() => {
                  if (kind === "user") return {
                    kind,
                    name: chat.chat.name
                  }

                  const groupChat = (chat as unknown) as {chat: {kind: string, id: string}}

                  return {
                    kind,
                    id: groupChat.chat.id
                  }
                })}
              >
                {
                  "profile_name" in chat.chat ? 
                  chat.chat.profile_name : 
                  chat.chat.name
                }
              </li>
            )}
          </Suspense>
        </ul>
      </div>
    </nav>
  )
}

export default ChatList