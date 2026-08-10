type Props = {}

const MessageInput = (props: Props) => {
  return (
    <aside className="border-t-2 p-3">
      <label className="flex bg-gray-600 rounded-2xl p-2" htmlFor="send-message">
        <button id="send" className="p-2 px-3">Send</button>
        <input type="text" className="flex-1" id="send-message"/>
      </label>
    </aside>
  )
}

export default MessageInput