import "./messageinput.css"

import { useEffect, useRef, type InputEvent, type SubmitEvent } from "react";
import { SelectedChatContext, type MessageResponse } from "../../utils";
import { useContext } from "react";
import { createMessage } from "../../actions";
import { useQueryClient } from "@tanstack/react-query";

type Props = {};

const MessageInput = (props: Props) => {
  const queryClient = useQueryClient();

  const form = useRef<HTMLFormElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  const {selectedChat} = useContext(SelectedChatContext);

  const onSubmitMessage = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(form.current!);
    
    const messageContent = String(formData.get("content"));
    const reciever = selectedChat!;

    const createdMessage = await createMessage(messageContent, reciever);

    if (!createdMessage) throw new Error("Wasn't able to send message to the server.");

    input.current!.value = "";
  }

  const handleInput = (e: InputEvent<HTMLTextAreaElement>) => {
    console.log(e);
  }

  return (
    <footer className="border-t-2">
      <form id="message_form" onSubmit={onSubmitMessage} ref={form}>
        <label className="flex bg-gray-600 rounded-2xl p-2" htmlFor="content">
          <button id="send" className="p-2 px-3">Send</button>
          <textarea 
            className="min-w-0 flex-1 resize-none field-sizing-content"
            name="content" 
            id="content" 
            ref={input} 
            onInput={handleInput}
          />
        </label>
      </form>
    </footer>
  )
}

export default MessageInput