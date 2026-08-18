import type { DetailedHTMLProps, DialogHTMLAttributes, RefObject } from "react";
import type { ChatKind } from "../../utils";

type Props = {
  kind: ChatKind,
  ref: RefObject<HTMLDialogElement | null>
} & Omit<DetailedHTMLProps<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>, "className" | "ref">

const ChatDetailModal = ({ kind, ...props }: Props) => {
  const modal = props.ref;

  return (
    <dialog className={`${kind}`} {...props}>
      <button onClick={() => modal.current!.close()}>Back</button>
    </dialog>
  )
}

export default ChatDetailModal