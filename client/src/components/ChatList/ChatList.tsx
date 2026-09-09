import "./chatlist.css";
import { Suspense, useContext, useRef } from "react";
import type { ChatType, Contact, GroupResponse } from "../../utils";
import NewChatModal from "../NewChatModal/NewChatModal";
import { SelectedChatContext } from "../../utils";
import type { EntityKind } from "@packages/utils";

type Props<T extends Contact | GroupResponse> = {
  kind: EntityKind
  chats: ChatType<T>[]
}

const ChatList = <T extends Contact | GroupResponse, >({ kind, chats }: Props<T>) => {
  const newChatModal = useRef<HTMLDialogElement>(null);
  const {selectedChat, setSelectedChat} = useContext(SelectedChatContext);
  const isUserSelected = selectedChat && "user" in selectedChat!;
  const isGroupSelected = selectedChat && "group" in selectedChat!;

  return (
    <nav id={`${kind}s-sidebar`} className="overflow-hidden flex flex-col">
      <NewChatModal kind={kind} ref={newChatModal}/>
      <button 
        id={`add_${kind}`} 
        onClick={() => newChatModal.current!.showModal()} 
        className="new-chat flex h-10 gap-2 justify-center items-center hover:bg-primary-500 active:bg-primary-400 bg-dark-400 m-0.5 rounded-full"
      >
        {kind === "user" && 
         <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6">
          <path d="M3 19C3.69137 16.6928 5.46998 16 9.5 16C13.53 16 15.3086 16.6928 16 19" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"/>
          <path d="M13 9.5C13 11.433 11.433 13 9.5 13C7.567 13 6 11.433 6 9.5C6 7.567 7.567 6 9.5 6C11.433 6 13 7.567 13 9.5Z" stroke="currentColor" fill="none" strokeWidth="2"/>
          <path d="M15 6H21" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18 3L18 9" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
        <p>{`${kind === "user" ? "Add" : "Create"} ${kind[0].toUpperCase()}${kind.slice(1)}`}</p>
      </button>
      <div className="list">
        <div id="search-chat" className="search m-2 bg-dark-500 h-8">
          <input type="text" name="" id="" placeholder={`Search ${kind[0].toUpperCase()}${kind.slice(1)}`}/>
          <button className="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M 10 2 C 5.5965257 2 2 5.5965291 2 10 C 2 14.403471 5.5965257 18 10 18 C 11.752132 18 13.370523 17.422074 14.691406 16.458984 L 19.845703 21.613281 A 1.250125 1.250125 0 1 0 21.613281 19.845703 L 16.458984 14.691406 C 17.422074 13.370523 18 11.75213 18 10 C 18 5.5965291 14.403474 2 10 2 z M 10 4.5 C 13.052375 4.5 15.5 6.947627 15.5 10 C 15.5 13.052373 13.052375 15.5 10 15.5 C 6.9476251 15.5 4.5 13.052373 4.5 10 C 4.5 6.947627 6.9476251 4.5 10 4.5 z"/>
            </svg>
          </button>
        </div>
        <ul id={`${kind}s`} className="flex flex-col gap-2 px-1.5">
          <Suspense>
            {chats.length > 0 && chats.map((chat, i) => 
              <li 
                className={`${kind} hover:bg-dark-300 cursor-pointer data-[selected=true]:bg-dark-300 py-2 rounded-md`} 
                data-selected={
                  isUserSelected && kind === "user" ? 
                  selectedChat?.user.name === chat.chat.name :
                  (isGroupSelected && "id" in chat.chat) &&
                  selectedChat?.group.id === chat.chat.id
                }
                key={i} 
                onClick={() => setSelectedChat(() => {
                  if (kind === "user") return { [kind]: chat.chat } as { user: Contact }

                  const groupChat = (chat as unknown) as {chat: GroupResponse}

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