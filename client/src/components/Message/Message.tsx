import type { MessageResponse } from "../../utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getLoggedUser } from "../../actions";
import { format } from "date-fns";

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

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <li 
      className={`message inline-block text-gray-100 rounded-lg max-w-[55%] ${user?.name === sender.name ? "bg-blue-800 self-end" : "bg-green-600"}`}
    >
      <article className="py-1 px-2 text-start wrap-anywhere relative box-border" title={`${sender.name}, ${format(sentAt, "P HH:mm:ss")}`}>
        {content}
        <span className="text-xs float-right ml-3 mt-2">
          {format(sentAt, "HH:mm")}
        </span>
      </article>
    </li>
  )
}

export default Message