import type { EntityKind } from "@packages/utils";
import type { DetailedHTMLProps, DialogHTMLAttributes, RefObject } from "react";

type Props = {
  kind: EntityKind,
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