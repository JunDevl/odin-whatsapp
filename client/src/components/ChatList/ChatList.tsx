import { Suspense, useContext, useRef } from "react";
import type { ChatType, Contact } from "../../utils";
import NewChat from "../NewChat/NewChat";
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
  const isUserSelected = selectedChat && "user" in selectedChat!;
  const isGroupSelected = selectedChat && "group" in selectedChat!;

  return (
    <nav id={`${kind}s-sidebar`} className="overflow-hidden">
      <NewChat kind={kind} ref={newChatModal}/>
      <div id="new_chat">
        <button id={`add_${kind}`} onClick={() => newChatModal.current!.showModal()}>
          {`${kind === "user" ? "Add" : "Create"} ${kind[0].toUpperCase()}${kind.slice(1)}`}
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
                  isUserSelected && kind === "user" ? 
                  selectedChat?.user.name === chat.chat.name :
                  (isGroupSelected && "id" in chat.chat) &&
                  selectedChat?.group.id === chat.chat.id
                }
                key={i} 
                onClick={() => setSelectedChat(() => {
                  if (kind === "user") return { [kind]: chat.chat } as { user: Contact }

                  const groupChat = (chat as unknown) as {chat: Group}

                  return { [kind]: groupChat.chat }
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