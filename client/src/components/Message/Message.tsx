import type { MessageResponse, UserResponse } from "../../utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getLoggedUser } from "../../actions";
import { format } from "date-fns";
import { useEffect, useState } from "react";

type Props = {
  message: { message: MessageResponse }
  user: UserResponse
}

const Message = ({ message, user }: Props) => {
  const {message: data} = message;

  const [hovering, setHovering] = useState<"row" | "message" | null>(null);

  const {id, content, sentAt, editedAt, sender, deletedAt} = data;

  const isOwn = user.name === sender.name;

  useEffect(() => {
    console.log(hovering);
  }, [hovering])

  const selectCheckbox = <input type="checkbox" name="select" className="select-message" hidden={!hovering}/>;

  return (
    <li 
      id={id}
      className={`message px-10 flex-1 flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setHovering("row")}
      onMouseLeave={() => setHovering(null)}
    >
      {isOwn && selectCheckbox}
      <article 
        className={`py-1 px-2 text-start wrap-anywhere relative box-border inline-block text-gray-100 rounded-lg max-w-[55%] ${user?.name === sender.name ? "bg-blue-800" : "bg-green-600"}`} 
        title={`${sender.name}, ${format(sentAt, "P HH:mm:ss")}`}
        onMouseEnter={() => setHovering("message")}
        onMouseLeave={(e) => (e.relatedTarget as HTMLElement).matches("li.message") ? setHovering("row") : setHovering(null)}
      >
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