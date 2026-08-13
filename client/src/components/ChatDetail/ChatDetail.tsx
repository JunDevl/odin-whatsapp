import type { DetailedHTMLProps, DialogHTMLAttributes } from "react";
import type { ChatKind } from "../../utils";

type Props = {
  kind: ChatKind
} & Omit<DetailedHTMLProps<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>, "className">

const ChatDetailModal = ({ kind, ...props }: Props) => {
  return (
    <dialog className={`${kind}`} {...props}>
      details
    </dialog>
  )
}

export default ChatDetailModal