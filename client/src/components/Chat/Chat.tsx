import "./chat.css"

import Message from "./Message/Message";
import MessageInput from "./MessageInput/MessageInput";
import { cn } from "../../utils";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getLoggedUser, getMessagesFromChat } from "../../actions";
import { ErrorBoundary } from "react-error-boundary";
import ChatDetailModal  from "./ChatDetailModal/ChatDetailModal";
import UnselectedChat from "../UnselectedChat/UnselectedChat";
import type { UserContacts, UserGroups } from "../../utils";
import type { EntityKind } from "@packages/utils";


type Props<T extends EntityKind> = T extends "user" ? {
  kind: T
  selectedChat?: UserContacts[number] | null
} : {
  kind: T
  selectedChat?: UserGroups[number] | null
}

const Chat = <T extends EntityKind,>({kind, selectedChat}: Props<T>) => {
  if (!selectedChat) return <UnselectedChat kind={kind}/>

  const {data: user} = useSuspenseQuery({
    queryKey: ["user"],
    queryFn: () => getLoggedUser()
  })

  const details = useRef<HTMLDialogElement>(null);
  const messagesList = useRef<HTMLDivElement>(null);

  const [selectedMessages, setSelectedMessages] = useState<Set<number>>(new Set());

  const isUserChat = "friendUser" in selectedChat;
  
  const {data: messages, error} = useSuspenseQuery({
    queryKey: [`${kind}_chats`, isUserChat ? selectedChat.friendUser.name : selectedChat.group.id],
    queryFn: () => getMessagesFromChat(kind, isUserChat ? selectedChat.friendUser.name : selectedChat.group.id),
    staleTime: Infinity
  })

  useEffect(() => {
    const list = messagesList.current!;

    list.scrollTop = list.scrollHeight;
  }, [])

  useEffect(() => {
    const list = messagesList.current!;

    const messageBlockCountThreshold = 2; // how many messages up high should trigger scrolling on new messages

    const messageBlockHeight = 35.1; // estimate in pixels of the height of message blocks

    const scrollThreshold = 
      messageBlockHeight + // height of the new incoming message
      (messageBlockHeight * messageBlockCountThreshold)

    if (
      list.scrollHeight - (list.clientHeight + list.scrollTop) <=
      scrollThreshold
    ) {
      list.scrollTo({
        behavior: "smooth",
        top: list.scrollHeight + scrollThreshold,
      });
    }
  }, [messages])

  return (
    <div id="chat" className="flex flex-col flex-1 overflow-hidden">
      <ChatDetailModal ref={details} chat={selectedChat}/>
      <header id={`current-${kind}-details`} className="chat-header flex to-dark-500 shadow-2xl">
        <div className="details flex flex-1 cursor-pointer p-3 justify-center items-center gap-4" onClick={() => details.current!.showModal()}>
          <div className={cn("chat-image rounded-full bg-amber-400 size-10", isUserChat && selectedChat.status === "online" ? "bg-semantic-ok-600" : "bg-dark-200")}></div>
          <h2 className="chat-name">
            {isUserChat ? selectedChat.friendUser.profile_name : selectedChat.group.name}
          </h2>
        </div>
        <div className="search search-message h-8 bg-dark-500 self-center mr-2">
          <input type="text" name="searchMessage" id="search-message" placeholder="Search Messages"/>
          <button>
            <svg xmlns="http://www.w3.org/2000/svg">
              <use href="/icons.svg#search-magnifying-glass"/>
            </svg>
          </button>
        </div>
      </header>
      <main className="overflow-hidden overflow-y-auto flex-1" ref={messagesList}>
        <ul 
          id={`current-${kind}-messages`} 
          className="flex flex-col gap-1 p-1" 
        >
          <ErrorBoundary fallback={<p>An error ocurred: <br/>{error ? error.stack : ""}</p>}>
            <Suspense fallback={<p>Loading messages ...</p>}>
              {messages.messages.map(({message}, i) => 
                <Message 
                  user={user!} 
                  message={message} 
                  chat={selectedChat} 
                  index={i} 
                  key={i}
                  onSelect={s => setSelectedMessages(sm => {
                    const newSelected = new Set(sm);

                    s ? newSelected.add(i) : newSelected.delete(i);

                    return newSelected;
                  })}
                />
              )}
            </Suspense>
          </ErrorBoundary>
        </ul>
      </main>
      <dialog 
        id="messages-tool" 
        open={!!selectedMessages.size}
        className="top-4 rounded-4xl p-1 justify-between gap-2"
      >
        <button>edit</button>
        <button>delete</button>
        <button>info</button>
        <button>share</button>
        <button 
          onClick={() => {
            setSelectedMessages(sm => {
              const newSelected = new Set(sm);

              newSelected.clear();

              return newSelected;
            })

            selectedMessages.forEach(i => {
              const checkbox = document.querySelector(`input#select-button${i}`) as HTMLInputElement;

              checkbox.checked = false;
            })
          }}
        >
          x
        </button>
      </dialog>
      <MessageInput kind={kind} chat={selectedChat}/>
    </div>
  )
}

export default Chat