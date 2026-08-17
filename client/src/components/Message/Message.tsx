import { useEffect } from "react";
import type { MessageResponse } from "../../utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getLoggedUser } from "../../actions";

type Props = {
  message: MessageResponse
}

const Message = ({ message }: Props) => {
  const {data: user} = useSuspenseQuery({
    queryKey: ["user"],
    queryFn: () => getLoggedUser()
  })

  const {message: data} = message;

  const {content, sentAt, editedAt, sender} = data;

  return (
    <li 
      className={`message inline-block text-gray-100 p-1 px-3 rounded-lg ${user?.name === sender.name ? "bg-blue-800 self-end" : "bg-green-600"}`}
    >
      <article>
        <p>{content}</p>
      </article>
    </li>
  )
}

export default Message