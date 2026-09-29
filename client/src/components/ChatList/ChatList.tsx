import "./chatlist.css";
import { Suspense, useContext, useRef, useState } from "react";
import type { UserContacts, UserGroups } from "../../utils";
import NewChatModal from "../NewChatModal/NewChatModal";
import { SelectedChatContext } from "../../utils";
import type { EntityKind } from "@packages/utils";
import { cn } from "../../utils";
import ChatItem from "./ChatItem/ChatItem";

type Props<T extends EntityKind> = {
  kind: T
} & (T extends "user" ? {
  chats: UserContacts
  selectedChat?: UserContacts[number] | null
} : {
  chats: UserGroups
  selectedChat?: UserGroups[number] | null
})

const ChatList = <T extends EntityKind, >({ kind, chats, selectedChat }: Props<T>) => {
  const isContacts = kind === "user";

  const {setSelectedChatID} = useContext(SelectedChatContext);

  const newChatModal = useRef<HTMLDialogElement>(null);
  const isUserSelected = selectedChat && "friendUser" in selectedChat!;
  const isGroupSelected = selectedChat && "group" in selectedChat!;

  const capitalKind = `${kind[0].toUpperCase()}${kind.slice(1)}`;

  return (
    <nav id={`${kind}s-sidebar`} className="overflow-hidden flex flex-col">
      <NewChatModal kind={kind} ref={newChatModal}/>
      <button 
        id={`add_${kind}`} 
        onClick={() => newChatModal.current!.showModal()} 
        className="new-chat flex h-10 gap-2 justify-center items-center hover:bg-primary-500 active:bg-primary-400 bg-dark-400 m-0.5 rounded-full"
      >
        {isContacts && 
         <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6">
          <path d="M3 19C3.69137 16.6928 5.46998 16 9.5 16C13.53 16 15.3086 16.6928 16 19" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"/>
          <path d="M13 9.5C13 11.433 11.433 13 9.5 13C7.567 13 6 11.433 6 9.5C6 7.567 7.567 6 9.5 6C11.433 6 13 7.567 13 9.5Z" stroke="currentColor" fill="none" strokeWidth="2"/>
          <path d="M15 6H21" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18 3L18 9" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
        <p>{`${isContacts ? "Add" : "Create"} ${capitalKind}`}</p>
      </button>
      <div className="list">
        <div id="search-chat" className="search m-2 bg-dark-500 h-8">
          <input type="text" name="" id="" placeholder={`Search ${capitalKind}`}/>
          <button className="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg">
              <use href="/icons.svg#search-magnifying-glass"/>
            </svg>
          </button>
        </div>
        <ul id={`${kind}s`} className="flex flex-col gap-1 px-1.5">
          <Suspense>
            {chats.length > 0 && chats.map((chat, i) => 
              <ChatItem 
                id={`${kind}-chats`}
                kind={kind}
                index={i}
                key={i}
                selected={
                  !!(isUserSelected && isContacts ? 
                  "friendUser" in chat && (selectedChat?.friendUser.name === chat.friendUser.name) :
                  (isGroupSelected && "group" in chat) &&
                  selectedChat?.group.id === chat.group.id)
                }
                chat={chat}
                onClickCapture={e => {
                  const target = e.target as HTMLElement;

                  if (!target.classList.contains("chat-item")) return;

                  setSelectedChatID(() => {
                    if ("status" in chat) return { name: chat.friendUser.name };

                    return { id: chat.group.id };
                  })
                }}
              />
            )}
          </Suspense>
        </ul>
      </div>
    </nav>
  )
}

export default ChatList