import type { DetailedHTMLProps, DialogHTMLAttributes, RefObject, SubmitEvent } from "react";
import type { ChatKind } from "../../utils";

type Props = {
  kind: ChatKind,
  ref: RefObject<HTMLDialogElement | null>
} & Omit<DetailedHTMLProps<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>, "className" | "ref">

const AddChat = ({ kind, ...props }: Props) => {
  const modal = props.ref;

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
  }

  return (
    <dialog {...props}>
      <form method="POST" onSubmit={handleSubmit}>
        <input type="text" name="name" id="name" placeholder="Contact Name"/>
        <button type="submit">
          Submit
        </button>
        <button type="reset" onClick={() => modal.current!.close()}>
          Cancel
        </button>
      </form>
    </dialog>
  )
}

export default AddChat