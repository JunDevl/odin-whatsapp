import type { EntityKind } from "@packages/utils";
import "../chatlist.css";
import { cn, type UserContacts, type UserGroups } from "../../../utils";
import { useRef, useState, type ComponentProps } from "react";
import { ContextMenu, MenuItem } from "../../ContextMenu/ContextMenu";

type Props = {
  kind: EntityKind
  index: number
  selected: boolean
  chat: UserContacts[number] | UserGroups[number]
} & ComponentProps<"li">

const ChatItem = ({kind, index, selected, chat, className, ...props}: Props) => {
  const isContacts = kind === "user";
  const [hovering, setHovering] = useState(false);
  const [menuActive, setMenuActive] = useState(false);

  const selectArrowIcon = useRef<SVGSVGElement>(null);
  const chatContextMenu = useRef<HTMLDivElement>(null);

  return (
    <li 
      {...props}
      className={cn(`chat-item ${kind} relative hover:bg-dark-300 cursor-pointer data-[selected=true]:bg-dark-300 py-2 rounded-md flex items-center justify-center gap-2`, className)} 
      data-selected={selected}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {isContacts && 
        <span 
          className={cn(
            `block size-2 rounded-full`, 
            (chat && "status" in chat) 
            && chat.status === "online" ? 
            "bg-semantic-ok-600" : "bg-dark-200"
          )}
        >
          
        </span>}
      {
        "status" in chat ? 
        chat.friendUser.profile_name : 
        chat.group.name
      }
      <button 
        // popoverTarget={`${id}-message-menu`}
        className="chat-menu-arrow absolute right-0 rounded-full select-none h-8 aspect-square bg-radial from-35% flex justify-center items-center"
        hidden={!hovering && !menuActive}
      >
        <svg className="arrow-icon" xmlns="http://www.w3.org/2000/svg" ref={selectArrowIcon}>
          <use href="/icons.svg#select-arrow"/>
        </svg>
      </button>
      <ContextMenu 
        className="chat-menu [&>ul>li>button]:bg-dark-500 [&>ul>li>button:not(.delete)]:hover:bg-dark-600"
        ref={chatContextMenu}
        onToggle={(e) => setMenuActive(e.newState === "open" ? true : false)}
        onBeforeToggle={() => {
          selectArrowIcon.current!.classList.toggle("open");
        }}
      >
        <MenuItem>
          
        </MenuItem>
      </ContextMenu>
    </li>
  )
}

export default ChatItem