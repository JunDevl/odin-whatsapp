import { useContext } from "react";
import Chat from "../../components/Chat/Chat";
import ChatList from "../../components/ChatList/ChatList";
import { GroupsContext, SelectedChatContext } from "../../utils";

type Props = {}

const Groups = (props: Props) => {
  const groups = useContext(GroupsContext)!;
  const {selectedChatID} = useContext(SelectedChatContext)

  const selectedGroupID = selectedChatID && selectedChatID as {id: string};

  const selectedChat = selectedChatID && groups.find(({group}) => group.id === selectedGroupID?.id);

  return (
    <>
      <ChatList kind="group" chats={groups} selectedChat={selectedChat}/>
      <Chat kind="group" selectedChat={selectedChat}/>
    </>
  )
}

export default Groups