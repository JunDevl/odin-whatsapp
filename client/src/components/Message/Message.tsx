import type { MessageResponse } from "../../utils";

type Props = {
  message: MessageResponse
}

const Message = ({ message }: Props) => {
  return (
    <li className="message inline-block bg-green-600 text-gray-100 p-1 px-3 rounded-lg">
      <article>
        <p>{message.content}</p>
        
      </article>
    </li>
  )
}

export default Message