import { useContext, useEffect, useRef } from "react";
import Chat from "../../components/Chat/Chat";
import ChatList from "../../components/ChatList/ChatList";
import { GroupsContext, SelectedChatContext } from "../../utils";
import { useParams } from "react-router";
import GroupInvitationModal from "../../components/GroupInvitationModal/GroupInvitationModal";
import { useQuery } from "@tanstack/react-query";
import { getInvitingGroup } from "../../actions";

// const status = "success";

// const joinGroup = {
//   name: "test",
//   id: "402d4b0a-a5cf-47ad-b605-3eb7e366699c",
//   description: null,
//   createdAt: "2026-09-28"
// } as GroupResponse

// const error = null;

type Props = {}

const Groups = (props: Props) => {
  const params = useParams();

  const joinGroupID = params.groupID;

  const joinGroupModal = useRef<HTMLDialogElement>(null);

  const groups = useContext(GroupsContext)!;
  const {selectedChatID} = useContext(SelectedChatContext)

  const selectedGroupID = selectedChatID && selectedChatID as {id: string};

  const selectedChat = selectedChatID && groups.find(({group}) => group.id === selectedGroupID?.id);

  useEffect(() => {joinGroupID && joinGroupModal.current!.showModal()}, []);

  return (
    <>
      <ChatList kind="group" chats={groups} selectedChat={selectedChat}/>
      <Chat kind="group" selectedChat={selectedChat}/>
      {params.groupID && <GroupInvitationModal ref={joinGroupModal}/>}
    </>
  )
}

export default Groups