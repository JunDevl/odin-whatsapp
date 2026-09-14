import type { DetailedHTMLProps, DialogHTMLAttributes, RefObject } from "react";
import type { UserContacts, UserGroups } from "../../utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getGroupMembers } from "../../actions";
import { format } from "date-fns";

interface GroupDetailsProps {
  chat: UserGroups[number]
}

const GroupDetails = ({chat}: GroupDetailsProps) => {
  const {group} = chat;

  const {data: members} = useSuspenseQuery({
    queryKey: ["group_members", group.id],
    queryFn: () => getGroupMembers(group.id)
  })

  return <>
    <h2 className="group-name">
      {group.name}
      <sub className="created-date ml-1">{format(group.createdAt, "P")}</sub>
    </h2>
    <h3 className="mt-3">
      {group.description}
    </h3>
    <fieldset className="mt-6 flex flex-col border border-dark-400 rounded-2xl p-3 gap-2 self-center">
      <h3 className="self-start">Members:</h3>
      <ul className="flex-1 bg-dark-900 rounded-2xl">
        {members.map(member => <li key={member.user.name} className="flex justify-start border border-dark-300 rounded-2xl p-2 px-4">
          <p>
            {member.user.profile_name}
            {member.authority !== "member" && <sup className="ml-1">{member.authority}</sup>}
          </p>
        </li>)}
      </ul>
    </fieldset>
  </>
}

type Props = {
  ref: RefObject<HTMLDialogElement | null>
  chat: UserGroups[number] | UserContacts[number]
} & Omit<DetailedHTMLProps<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>, "className" | "ref">

const ChatDetailModal = ({chat, ...props}: Props) => {
  const isUserSelected = "friendUser" in chat;

  const kind = "friendUser" in chat ? "user" : "group";

  const modal = props.ref;

  return (
    <dialog {...props} className="w-[50%] open:flex flex-col">
      {kind === "user" && 
        <>
          <p>{isUserSelected && chat.friendUser.profile_name}</p>
          <p>{isUserSelected && chat.friendUser.name}</p>
        </>
      }
      {kind == "group" &&
        <GroupDetails chat={chat as any}/>
      }
      <button 
        onClick={() => modal.current!.close()}
        className="hover:bg-dark-300 active:bg-dark-400"
      >
        Back
      </button>
    </dialog>
  )
}

export default ChatDetailModal