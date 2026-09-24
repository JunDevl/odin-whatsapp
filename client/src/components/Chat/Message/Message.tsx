import "./message.css";

import type { MessageResponse, LoggedUserResponse, UserContacts, UserGroups } from "../../../utils";
import { cn } from "../../../utils";
import { format } from "date-fns";
import type { MouseEvent } from "react";
import { useRef, useState,  } from "react";
import { deleteMesssages } from "../../../actions";
import { useQueryClient } from "@tanstack/react-query";
import { ContextMenu, MenuItem } from "../../ContextMenu/ContextMenu";

type Props = {
  message: MessageResponse
  user: LoggedUserResponse
  chat: UserGroups[number] | UserContacts[number]
  index: number
  onSelect?: (selected: boolean) => void
}

const Message = ({ message, user, chat, index, onSelect }: Props) => {
  const kind = "friendUser" in chat ? "user" : "group";
  const isUserSelected = "friendUser" in chat;

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

  const selectCheckbox = <input type="checkbox" name="select" className="select-message" id={`select-button${index}`} hidden={!(hovering === "row") && !(checkbox.current && checkbox.current.checked)} ref={checkbox}/>;

  const handleDelete = async () => {
    const deletedMessages = await deleteMesssages([message.id], "friendUser" in chat ? {name: chat.friendUser.name} : {id: chat.group.id});

    const deletedSingleMessage = deletedMessages[0]!;

    queryClient.setQueryData(
      [`${kind}_chats`, isUserSelected ? chat.friendUser.name : chat.group.id],
      (prevMessages: {contact: string, messages: { message: MessageResponse }[] }) => {
        const {contact, messages} = prevMessages;

        messages[index] = { message: deletedSingleMessage };

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
      className={cn(
        "message px-10 flex-1 flex gap-2 relative", 
        deletedAt && "deleted", 
        isOwn ? "justify-end" : "justify-start"
      )}
      onMouseEnter={() => setHovering("row")}
      onMouseLeave={() => setHovering(null)}
      onClick={(e) => {
        if (hovering === "row" && e.target !== checkbox.current) checkbox.current!.checked = !checkbox.current!.checked;

        onSelect!(checkbox.current!.checked);
      }}
      ref={messageElement}
    >
      <dialog className="modal message-info" ref={messageInfoModal}>
        <p>{sentAt}</p>
        <p>{editedAt ?? ""}</p>
        <p>{deletedAt ?? ""}</p>
        <button type="reset" onClick={() => {messageInfoModal.current!.close()}}>Quit</button>
      </dialog>
      <dialog className="modal edit-message" ref={editMessageModal}>
        <input type="text" name="content" id="content" defaultValue={content} />
        <button type="submit" className="highlight">Edit</button>
        <button type="reset" onClick={() => {editMessageModal.current!.close()}}>Cancel</button>
      </dialog>
      {isOwn && selectCheckbox}
      <article 
        className={cn(
          "message-info py-1 px-2 text-start wrap-anywhere relative box-border inline-block text-gray-100 rounded-lg max-w-[60%]", 
          isOwn ? "bg-blue-800" : "bg-green-600"
        )} 
        title={`${sender.name}, ${format(sentAt, "P HH:mm:ss")}`}
        onMouseEnter={() => setHovering("message")}
        onMouseLeave={(e) => (e.relatedTarget as HTMLElement).matches("li.message") ? setHovering("row") : setHovering(null)}
      >
        <button 
          popoverTarget={`${id}-message-menu`}
          className={cn(
            "message-menu-arrow absolute right-0 top-0 rounded-full select-none h-8 aspect-square bg-radial from-35% flex justify-center items-center", 
            isOwn ? "from-blue-800" : "from-green-600"
          )} 
          hidden={!(hovering === "message") && !menuActive}
        >
          <svg className="arrow-icon" xmlns="http://www.w3.org/2000/svg" ref={selectArrowIcon}>
            <use href="/icons.svg#select-arrow"/>
          </svg>
        </button>
        <ContextMenu 
          id={`${id}-message-menu`}
          className="message-menu [&>ul>li>button]:bg-dark-500 [&>ul>li>button:not(.delete)]:hover:bg-dark-600"
          ref={messageContextMenu}
          onToggle={(e) => setMenuActive(e.newState === "open" ? true : false)}
          onBeforeToggle={() => {
            selectArrowIcon.current!.classList.toggle("open");
          }}
        >
          {isOwn && <>
            <MenuItem name="edit" onClick={() => editMessageModal.current!.showModal()}>
              <svg xmlns="http://www.w3.org/2000/svg">
                <use href="/icons.svg#edit-pencil"/>
              </svg>
            </MenuItem>
            <MenuItem 
              name="delete" 
              className="hover:bg-semantic-error-200"
              onClick={handleDelete}
            >
              <svg xmlns="http://www.w3.org/2000/svg">
                <use href="/icons.svg#delete-trash-can"/>
              </svg>
            </MenuItem>
            <MenuItem name="info" onClick={() => messageInfoModal.current!.showModal()}>
              <svg xmlns="http://www.w3.org/2000/svg">
                <use href="/icons.svg#info"/>
              </svg>
            </MenuItem>
          </>}
          <MenuItem name="share">
            <svg xmlns="http://www.w3.org/2000/svg">
              <use href="/icons.svg#share"/>
            </svg>
          </MenuItem>
        </ContextMenu>

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