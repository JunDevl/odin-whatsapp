import { useContext } from "react";
import Chat from "../../components/Chat/Chat";
import ChatList from "../../components/ChatList/ChatList";
import { GroupsContext, SelectedChatContext } from "../../utils";
import { useQueries, useSuspenseQuery } from "@tanstack/react-query";
import { getMessagesFromChat, getUserGroups } from "../../actions";
import { ErrorBoundary } from "react-error-boundary";
import UnselectedChat from "../../components/UnselectedChat/UnselectedChat";

type Props = {}

const Groups = (props: Props) => {
  const groups = useContext(GroupsContext)!;
  const {selectedChat} = useContext(SelectedChatContext);

  return (
    <>
      <ChatList kind="group" chats={groups}/>
      {selectedChat ? 
        <Chat/> :
        <UnselectedChat kind="group"/>
      }
    </>
  )
}

export default Groups