import "./messageinput.css"

import { useRef, useState, type InputEvent, type KeyboardEvent, type SubmitEvent } from "react";
import { cn } from "../../utils";
import type { MessageResponse, UserContacts, UserGroups } from "../../utils";
import { createMessage } from "../../actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { EntityKind } from "@packages/utils";
import { ContextMenu, MenuItem } from "../ContextMenu/ContextMenu";

type Props = {
  kind: EntityKind
  chat: UserGroups[number] | UserContacts[number]
};

const MessageInput = ({ kind, chat }: Props) => {
  const [text, setText] = useState("");

  const queryClient = useQueryClient();

  const form = useRef<HTMLFormElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const attachMenu = useRef<HTMLDivElement>(null);

  const isSelectedUser = "friendUser" in chat;

  const { mutateAsync: sendMessage } = useMutation({
    mutationFn: ({content, chat}: {content: string, chat: {name: string} | {id: string}}) => createMessage(content, chat),
    onSuccess: (data, params, result, context) => {
      return queryClient.setQueryData(
        [`${kind}_chats`, isSelectedUser ? chat.friendUser.name : chat!.group.id],
        (prevMessages: {contact: string, messages: { message: MessageResponse }[] }) => ({
          contact: prevMessages.contact,
          messages: [...prevMessages.messages, data]
        })
      )
    }
  });

  const onSubmitMessage = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(form.current!);
    
    const messageContent = String(formData.get("content"));
    const reciever = chat;

    const createdMessage = await sendMessage({content: messageContent, chat: "friendUser" in reciever ? {name: reciever.friendUser.name} : {id: reciever.group.id}});

    setText("");
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.key === "Enter" && !e.shiftKey)) return
    
    e.preventDefault();

    form.current!.requestSubmit();
  }

  const handleInput = (e: InputEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;

    setText(target.value);
    // console.log(text);?
  }

  return (
    <footer className="z-20 px-1 pb-1" id="input-area">
      <form id="message-form" method="POST" onSubmit={onSubmitMessage} ref={form} className="overflow-hidden bg-dark-300 rounded-3xl [&>button]:flex [&>button]:items-center has-[textarea:focus]:outline-1 has-[textarea:focus]:outline-light-900 items-end">
        <label className="flex items-end p-0.5" htmlFor="content">
          <div className="flex gap-0.5 items-center [&>button]:justify-center [&>button]:aspect-square [&>button]:rounded-4xl [&>button]:flex [&>button]:items-center">
            <button 
              id="send" 
              type="submit"
              className={cn("size-11", text !== "" ? "bg-primary-400" : "")}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z" stroke="currentColor" fill="transparent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              id="attach" 
              className="hover:bg-dark-200 size-10" 
              popoverTarget="file-attach-menu"
              type="button"
            >
              <ContextMenu id="file-attach-menu" ref={attachMenu}>
                <MenuItem className="m-2">
                  <form 
                    action="POST" 
                    id="add-file" 
                    onSubmit={e => e.preventDefault()}
                  >
                    <label 
                      htmlFor="file-input"
                    >
                      Choose a file
                    </label>
                    <input 
                      type="file" 
                      name="file-input" 
                      id="file-input"
                      hidden
                    />
                  </form>
                </MenuItem>
              </ContextMenu>
              <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 1024 1024">
                <path fill="currentColor" d="M779.3 196.6c-94.2-94.2-247.6-94.2-341.7 0l-261 260.8c-1.7 1.7-2.6 4-2.6 6.4s.9 4.7 2.6 6.4l36.9 36.9a9 9 0 0 0 12.7 0l261-260.8c32.4-32.4 75.5-50.2 121.3-50.2s88.9 17.8 121.2 50.2c32.4 32.4 50.2 75.5 50.2 121.2c0 45.8-17.8 88.8-50.2 121.2l-266 265.9l-43.1 43.1c-40.3 40.3-105.8 40.3-146.1 0c-19.5-19.5-30.2-45.4-30.2-73s10.7-53.5 30.2-73l263.9-263.8c6.7-6.6 15.5-10.3 24.9-10.3h.1c9.4 0 18.1 3.7 24.7 10.3c6.7 6.7 10.3 15.5 10.3 24.9c0 9.3-3.7 18.1-10.3 24.7L372.4 653c-1.7 1.7-2.6 4-2.6 6.4s.9 4.7 2.6 6.4l36.9 36.9a9 9 0 0 0 12.7 0l215.6-215.6c19.9-19.9 30.8-46.3 30.8-74.4s-11-54.6-30.8-74.4c-41.1-41.1-107.9-41-149 0L463 364L224.8 602.1A172.22 172.22 0 0 0 174 724.8c0 46.3 18.1 89.8 50.8 122.5c33.9 33.8 78.3 50.7 122.7 50.7s88.8-16.9 122.6-50.7l309.2-309C824.8 492.7 850 432 850 367.5c.1-64.6-25.1-125.3-70.7-170.9"/>
              </svg>
            </button>
          </div>
          <textarea 
            className="pl-2 min-w-0 flex-1 field-sizing-content focus:outline-0 self-center"
            name="content" 
            id="content" 
            ref={input}
            value={text}
            required={true}
            placeholder="Write a message"
            onInput={handleInput}
            onKeyDown={handleKeyDown}
          />
        </label>
      </form>
    </footer>
  )
}

export default MessageInput