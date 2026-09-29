import { useContext, useRef } from "react";
import Chat from "../../components/Chat/Chat";
import ChatList from "../../components/ChatList/ChatList";
import { GroupsContext, SelectedChatContext, type GroupResponse } from "../../utils";
import { useParams } from "react-router";
import GroupInvitationModal from "../../components/GroupInvitationModal/GroupInvitationModal";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

type Props = {}

const Groups = (props: Props) => {
  const params = useParams();

  const joinGroupModal = useRef<HTMLDialogElement>(null);

  const {data: joinGroup, error, status} = useQuery({
    queryKey: ["join_group"],
    queryFn: () => ({
      name: "test",
      id: "402d4b0a-a5cf-47ad-b605-3eb7e366699c",
      description: null,
      createdAt: "2026-09-28"
    } as GroupResponse),
    enabled: !!params.groupID
  })

  const groups = useContext(GroupsContext)!;
  const {selectedChatID} = useContext(SelectedChatContext)

  const selectedGroupID = selectedChatID && selectedChatID as {id: string};

  const selectedChat = selectedChatID && groups.find(({group}) => group.id === selectedGroupID?.id);

  return (
    <>
      <ChatList kind="group" chats={groups} selectedChat={selectedChat}/>
      <Chat kind="group" selectedChat={selectedChat}/>
      {params.groupID && <GroupInvitationModal ref={joinGroupModal} status={status} group={joinGroup} error={error}/>}
    </>
  )
}

export default Groups