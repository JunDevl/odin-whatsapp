import "./message.css";

import type { MessageResponse, UserResponse } from "../../utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getLoggedUser } from "../../actions";
import { format } from "date-fns";
import { useEffect, useRef, useState, type Dispatch } from "react";

type Props = {
  message: { message: MessageResponse }
  user: UserResponse
}

const Message = ({ message, user }: Props) => {
  const checkbox = useRef<HTMLInputElement>(null);

  const {message: data} = message;

  const [hovering, setHovering] = useState<"row" | "message" | null>(null);
  const [menuActive, setMenuActive] = useState(false);

  const {id, content, sentAt, editedAt, sender, deletedAt} = data;

  const isOwn = user.name === sender.name;

  const selectCheckbox = <input type="checkbox" name="select" className="select-message" hidden={!(hovering === "row") && !(checkbox.current && checkbox.current.checked)} ref={checkbox}/>;

  return (
    <li 
      id={id}
      className={`message px-10 flex-1 flex gap-2 relative ${isOwn ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setHovering("row")}
      onMouseLeave={() => setHovering(null)}
      onClick={() => {
        if (hovering === "row") checkbox.current!.checked = !checkbox.current!.checked;
      }}
    >
      {isOwn && selectCheckbox}
      <article 
        className={`py-1 px-2 text-start wrap-anywhere relative box-border inline-block text-gray-100 rounded-lg max-w-[55%] ${isOwn ? "bg-blue-800" : "bg-green-600"}`} 
        title={`${sender.name}, ${format(sentAt, "P HH:mm:ss")}`}
        onMouseEnter={() => setHovering("message")}
        onMouseLeave={(e) => (e.relatedTarget as HTMLElement).matches("li.message") ? setHovering("row") : setHovering(null)}
      >
        <button 
          popoverTarget={`${id}-message-menu`}
          className={`message-menu-arrow absolute right-0 top-0 rounded-full select-none h-8 aspect-square bg-radial ${isOwn ? "from-blue-800" : "from-green-600"} from-25% flex justify-center items-center`} 
          hidden={!(hovering === "message") && !menuActive} 
        >
          &gt;
        </button>
        <div id={`${id}-message-menu`} className="message-menu bg-gray-800 z-10" popover="auto" onToggle={(e) => setMenuActive(e.newState === "open" ? true : false)}>
          <ul className="p-1 *:p-1 *:bg-amber-400 flex flex-col gap-1">
            {isOwn && <>
              <li className=""><button>Edit</button></li>
              <li className=""><button>Delete</button></li>
            </>}            
            <li className=""><button>Send to</button></li>
          </ul>
        </div>
        {content}
        <span className="text-xs float-right ml-3 mt-2">
          {format(sentAt, "HH:mm")}
        </span>
      </article>
      {!isOwn && selectCheckbox}
    </li>
  )
}

export default Message