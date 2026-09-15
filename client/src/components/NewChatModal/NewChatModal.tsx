import { useRef, type ComponentProps, type DetailedHTMLProps, type DialogHTMLAttributes, type RefObject, type SubmitEvent } from "react";
import { addContact, createGroup, getUserContacts, getUserGroups } from "../../actions";
import { useQueryClient } from "@tanstack/react-query";
import type { EntityKind } from "@packages/utils";

type Props = {
  kind: EntityKind,
  ref: RefObject<HTMLDialogElement | null>
} & Omit<ComponentProps<"dialog">, "className" | "ref">

const NewChatModal = ({ kind, ...props }: Props) => {
  const queryClient = useQueryClient();

  const modal = props.ref;
  const form = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(form.current!);

    if (kind === "user") {
      await addContact(String(formData.get("name")));

      await queryClient.fetchQuery({
        queryKey: ["user", "friends"],
        queryFn: () => getUserContacts()
      });
    } else {
      await createGroup(String(formData.get("name")), String(formData.get("description")))

      await queryClient.fetchQuery({
        queryKey: ["user", "groups"],
        queryFn: () => getUserGroups()
      });
    }

    modal.current!.close();
  }

  return (
    <dialog {...props}>
      <form 
        method="POST" 
        onSubmit={handleSubmit} 
        className="flex flex-col gap-3"
        ref={form}
      >
        {kind === "user" ? 
          <>
            <input 
              type="text" 
              name="name" 
              id="name" 
              placeholder="Contact Name"
            />
          </> :
          <>
            <input 
              type="text" 
              name="name" 
              id="name" 
              placeholder="Group Name"
            />
            <textarea 
              name="description" 
              id="description" 
              placeholder="Group Description"
            />
          </>
        }
        <div className="buttons flex justify-around">
          <button type="submit" className="bg-primary-400 hover:bg-primary-500 active:bg-primary-100">
            Submit
          </button>
          <button type="reset" onClick={() => modal.current!.close()} className="hover:bg-dark-400 active:bg-dark-500">
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default NewChatModal