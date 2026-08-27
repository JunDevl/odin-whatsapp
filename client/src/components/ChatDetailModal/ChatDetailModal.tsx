import { useContext, type DetailedHTMLProps, type DialogHTMLAttributes, type RefObject } from "react";
import { SelectedChatContext } from "../../utils";
import type { Group } from "@types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getGroupMembers } from "../../actions";

const GroupDetails = () => {
  const {selectedChat} = useContext(SelectedChatContext);

  const {group} = selectedChat as { group: Group };

  const {data: members} = useSuspenseQuery({
    queryKey: ["group_members", group.id],
    queryFn: () => getGroupMembers(group.id)
  })

  return <>
    <p>{group.name}</p>
    <p>{(group as any).createdAt}</p>
    <ul>
      {members.map(member => <li key={member.user.name}>
        <p>{member.user.profile_name}</p>
        <p>{member.authority}</p>
      </li>)}
    </ul>
  </>
}

type Props = {
  ref: RefObject<HTMLDialogElement | null>
} & Omit<DetailedHTMLProps<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>, "className" | "ref">

const ChatDetailModal = (props: Props) => {
  const {selectedChat} = useContext(SelectedChatContext);

  const isUserSelected = "user" in selectedChat!;

  const kind = "user" in selectedChat! ? "user" : "group";

  const modal = props.ref;

  return (
    <dialog {...props} className={`${kind}`}>
      {kind === "user" && 
        <>
          <p>{isUserSelected && selectedChat!.user.profile_name}</p>
          <p>{isUserSelected && selectedChat!.user.name}</p>
        </>
      }
      {kind == "group" &&
        <GroupDetails/>
      }
      <button 
        onClick={() => modal.current!.close()}
        className="hover:bg-amber-300 active:bg-amber-500"
      >
        Back
      </button>
    </dialog>
  )
}

export default ChatDetailModal