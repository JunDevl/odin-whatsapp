import type { ChatKind } from "../../utils";

type Props = {
  kind: ChatKind
}

const ChatDetailModal = ({ kind }: Props) => {
  return (
    <dialog className={`${kind}`}>
      details
    </dialog>
  )
}

export default ChatDetailModal