import "./message.css";

import { SelectedChatContext, type MessageResponse, type UserResponse } from "../../utils";
import { format } from "date-fns";
import { useContext, useEffect, useRef, useState, type MouseEvent, type SubmitEvent, type ToggleEvent } from "react";
import { deleteMesssages, editMessage, getMessagesFromChat } from "../../actions";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  message: MessageResponse
  user: UserResponse
  index: number
}

const Message = ({ message, user, index }: Props) => {
  const {selectedChat} = useContext(SelectedChatContext);
  const kind = "user" in selectedChat! ? "user" : "group";
  const isUserSelected = selectedChat && "user" in selectedChat!;

  const queryClient = useQueryClient();

  const checkbox = useRef<HTMLInputElement>(null);

  const selectArrowIcon = useRef<SVGSVGElement>(null);
  const messageContextMenu = useRef<HTMLDivElement>(null);

  const messageElement = useRef<HTMLLIElement>(null);

  const editMessageModal = useRef<HTMLDialogElement>(null);
  const messageInfoModal = useRef<HTMLDialogElement>(null);

  const [hovering, setHovering] = useState<"row" | "message" | null>(null);
  const [menuActive, setMenuActive] = useState(false);

  const {id, content, sentAt, editedAt, sender, deletedAt} = message;

  const isOwn = user.name === sender.name;

  const selectCheckbox = <input type="checkbox" name="select" className="select-message" hidden={!(hovering === "row") && !(checkbox.current && checkbox.current.checked)} ref={checkbox}/>;

  const handleDelete = async (e: MouseEvent) => {
    const deletedMessages = await deleteMesssages([message.id]);

    const deletedSingleMessage = deletedMessages[0]!;

    queryClient.setQueryData(
      [`${kind}_chats`, isUserSelected ? selectedChat.user.name : selectedChat?.group.id],
      (prevMessages: {contact: string, messages: MessageResponse[]}) => {
        const {contact, messages} = prevMessages;

        messages[index] = deletedSingleMessage;

        return {contact, messages};
      }
    )
  }

  const openMessageModal = (e: MouseEvent) => {
    const modalType = (e.target as HTMLButtonElement).textContent;

    console.log(modalType);

    switch (modalType) {
      case "Info": { messageInfoModal.current!.showModal(); break; }
      case "Edit": { editMessageModal.current!.showModal(); break; }
    }
  }

  return (
    <li 
      id={id}
      className={`message px-10 flex-1 flex gap-2 relative ${isOwn ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setHovering("row")}
      onMouseLeave={() => setHovering(null)}
      onClick={(e) => {
        if (hovering === "row" && e.target !== checkbox.current) checkbox.current!.checked = !checkbox.current!.checked;
      }}
      ref={messageElement}
    >
      <dialog className="message-info" ref={messageInfoModal}>
        <p>{sentAt}</p>
        <p>{editedAt ?? ""}</p>
        <p>{deletedAt ?? ""}</p>
        <button type="reset" onClick={() => {messageInfoModal.current!.close()}}>Quit</button>
      </dialog>
      <dialog className="edit-message" ref={editMessageModal}>
        <input type="text" name="content" id="content" defaultValue={content} />
        <button type="submit" className="highlight">Edit</button>
        <button type="reset" onClick={() => {editMessageModal.current!.close()}}>Cancel</button>
      </dialog>
      {isOwn && selectCheckbox}
      <article 
        className={`message-info py-1 px-2 text-start wrap-anywhere relative box-border inline-block text-gray-100 rounded-lg max-w-[55%] ${isOwn ? "bg-blue-800" : "bg-green-600"}`} 
        title={`${sender.name}, ${format(sentAt, "P HH:mm:ss")}`}
        onMouseEnter={() => setHovering("message")}
        onMouseLeave={(e) => (e.relatedTarget as HTMLElement).matches("li.message") ? setHovering("row") : setHovering(null)}
      >
        <button 
          popoverTarget={`${id}-message-menu`}
          className={`message-menu-arrow absolute right-0 top-0 rounded-full select-none h-8 aspect-square bg-radial ${isOwn ? "from-blue-800" : "from-green-600"} from-35% flex justify-center items-center`} 
          hidden={!(hovering === "message") && !menuActive}
        >
          <svg className="arrow-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" ref={selectArrowIcon}>
            <path d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"/>
          </svg>
        </button>
        <div 
          id={`${id}-message-menu`}
          className="message-menu bg-gray-800 z-10"
          popover="auto"
          onToggle={(e) => setMenuActive(e.newState === "open" ? true : false)}
          ref={messageContextMenu}
          onBeforeToggle={() => {
            selectArrowIcon.current!.classList.toggle("open");
          }}
        >
          <ul className="detail p-1 flex *:flex *:h-10 flex-col gap-1 items-stretch">
            {isOwn && <>
              <li>
                <button className="pencil flex-1 bg-amber-700 flex justify-between items-center gap-5" onClick={openMessageModal}>
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="max-w-6">
                    <path fillRule="evenodd" clipRule="evenodd" d="M15.8787 3.70705C17.0503 2.53547 18.9498 2.53548 20.1213 3.70705L20.2929 3.87862C21.4645 5.05019 21.4645 6.94969 20.2929 8.12126L18.5556 9.85857L8.70713 19.7071C8.57897 19.8352 8.41839 19.9261 8.24256 19.9701L4.24256 20.9701C3.90178 21.0553 3.54129 20.9554 3.29291 20.7071C3.04453 20.4587 2.94468 20.0982 3.02988 19.7574L4.02988 15.7574C4.07384 15.5816 4.16476 15.421 4.29291 15.2928L14.1989 5.38685L15.8787 3.70705ZM18.7071 5.12126C18.3166 4.73074 17.6834 4.73074 17.2929 5.12126L16.3068 6.10738L17.8622 7.72357L18.8787 6.70705C19.2692 6.31653 19.2692 5.68336 18.8787 5.29283L18.7071 5.12126ZM16.4477 9.13804L14.8923 7.52185L5.90299 16.5112L5.37439 18.6256L7.48877 18.097L16.4477 9.13804Z" fill="currentColor"/>
                  </svg>
                  <p className="edit-message">Edit</p>
                </button>
              </li>
              <li>
                <button className="trash flex-1 bg-amber-700 flex justify-between items-center gap-5" onClick={handleDelete}>
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="max-w-6">
                    <path d="M10 12L14 16M14 12L10 16M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M18 6V16.2C18 17.8802 18 18.7202 17.673 19.362C17.3854 19.9265 16.9265 20.3854 16.362 20.673C15.7202 21 14.8802 21 13.2 21H10.8C9.11984 21 8.27976 21 7.63803 20.673C7.07354 20.3854 6.6146 19.9265 6.32698 19.362C6 18.7202 6 17.8802 6 16.2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                  <p className="delete-message">Delete</p>
                </button>
              </li>
              <li>
                <button className="info flex-1 bg-amber-700 flex justify-between items-center gap-5" onClick={openMessageModal}>
                  <svg width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="max-w-6">
                    <g id="Warning / Info">
                    <path id="Vector" d="M12 11V16M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 8V8.1L11.9502 8.1002V8H12.0498Z" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                  </svg>
                  <p className="message-info">Info</p>
                </button>
              </li>
            </>}            
            <li>
              <button className="share flex-1 bg-amber-700 flex justify-between items-center gap-5">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="max-w-6">
                  <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="share-message">Share</p>
              </button>
            </li>
          </ul>
        </div>
        {deletedAt ? "Message has been deleted." : content}
        <span className="text-xs float-right ml-3 mt-2">
          {format(sentAt, "HH:mm")}
        </span>
      </article>
      {!isOwn && selectCheckbox}
    </li>
  )
}

export default Message