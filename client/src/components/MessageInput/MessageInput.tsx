import "./messageinput.css"

import { useEffect, useRef, useState, type InputEvent, type KeyboardEvent, type SubmitEvent } from "react";
import { SelectedChatContext, type MessageResponse } from "../../utils";
import { useContext } from "react";
import { createMessage } from "../../actions";
import { useQueryClient } from "@tanstack/react-query";
import type { EntityKind } from "@packages/utils";

type Props = {
  kind: EntityKind
};

const MessageInput = ({ kind }: Props) => {
  const [text, setText] = useState("");

  const queryClient = useQueryClient();

  const form = useRef<HTMLFormElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  const {selectedChat} = useContext(SelectedChatContext);
  const isSelectedUser = selectedChat && "user" in selectedChat;

  const onSubmitMessage = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(form.current!);
    
    const messageContent = String(formData.get("content"));
    const reciever = selectedChat!;

    const createdMessage = await createMessage(messageContent, reciever);

    if (!createdMessage) throw new Error("Wasn't able to send message to the server.");

    queryClient.setQueryData(
      [`${kind}_chats`, isSelectedUser ? selectedChat.user.name : selectedChat!.group.id],
      (prevMessages: {contact: string, messages: { message: MessageResponse }[] }) => ({
        contact: prevMessages.contact,
        messages: [...prevMessages.messages, createdMessage]
      })
    )

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
      <form id="message-form" method="POST" onSubmit={onSubmitMessage} ref={form} className="overflow-hidden bg-dark-300 rounded-3xl has-[textarea:focus]:outline-1 has-[textarea:focus]:outline-light-900">
        <label className="flex items-end gap-2 p-0.5" htmlFor="content">
          <button id="send" className={`flex items-center justify-center size-11 aspect-square rounded-4xl ${text !== "" ? "bg-primary-400" : ""}`}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z" stroke="currentColor" fill="transparent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <textarea 
            className="min-w-0 flex-1 field-sizing-content focus:outline-0 self-center"
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