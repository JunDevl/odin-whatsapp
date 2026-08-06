type Props = {
  message: Record<string, any>
}

const Message = ({ message }: Props) => {
  return (
    <li className="message">
      <article>
        {message.whatever}
      </article>
    </li>
  )
}

export default Message