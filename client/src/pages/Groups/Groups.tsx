import { useContext } from "react";
import Chat from "../../components/Chat/Chat";
import ChatList from "../../components/ChatList/ChatList";
import { SelectedChatContext } from "../../utils";
import { useQueries, useSuspenseQuery } from "@tanstack/react-query";
import { getMessagesFromChat, getUserGroups } from "../../actions";
import { ErrorBoundary } from "react-error-boundary";
import UnselectedChat from "../../components/UnselectedChat/UnselectedChat";

type Props = {}

const Groups = (props: Props) => {
  const {selectedChat} = useContext(SelectedChatContext);

  return (
    <>
      <ChatList kind="group"/>
      {selectedChat ? 
        <Chat/> :
        <UnselectedChat kind="group"/>
      }
    </>
  )
}

export default Groups