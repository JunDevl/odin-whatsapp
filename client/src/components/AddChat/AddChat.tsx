import { useRef, type DetailedHTMLProps, type DialogHTMLAttributes, type RefObject, type SubmitEvent } from "react";
import type { ChatKind } from "../../utils";
import { addContact, getUserContacts } from "../../actions";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  kind: ChatKind,
  ref: RefObject<HTMLDialogElement | null>
} & Omit<DetailedHTMLProps<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>, "className" | "ref">

const AddChat = ({ kind, ...props }: Props) => {
  const queryClient = useQueryClient();

  const modal = props.ref;
  const form = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(form.current!);

    await addContact(String(formData.get("name")));

    await queryClient.fetchQuery({
      queryKey: ["user", "friends"],
      queryFn: () => getUserContacts()
    });

    modal.current!.close();
  }

  return (
    <dialog {...props} className="bg-black">
      <form 
        method="POST" 
        onSubmit={handleSubmit} 
        className="flex flex-col gap-3"
        ref={form}
      >
        <input 
          type="text" 
          name="name" 
          id="name" 
          placeholder="Contact Name"
        />
        <div className="buttons flex justify-around">
          <button type="submit" className="bg-primary-500 hover:bg-primary-400">
            Submit
          </button>
          <button type="reset" onClick={() => modal.current!.close()} className="bg-dark-600 hover:bg-dark-500">
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default AddChat