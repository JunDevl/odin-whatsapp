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
  
  const {data: groups, error} = useSuspenseQuery({
    queryKey: ["user", "groups"],
    queryFn: () => getUserGroups(),
    staleTime: Infinity
  })

  const messages = useQueries({
    queries: groups ? groups.map(group => ({
      queryKey: ["group_chats", group.group.id],
      queryFn: () => getMessagesFromChat("group", group.group.id),
      staleTime: Infinity
    })) : []
  });

  const chats = groups.map(group => ({
    chat: group.group,
    lastMessage: {
      id: "abc",
      content: "test",
      sentAt: "2026-03-05 10:00",
      editedAt: null,
      deletedAt: null,
      sender: { name: "test" }
    }
  }))

  return (
    <>
      <ErrorBoundary fallback={<p>Something went wrong when loading user's groups: <br/>{error ? error.stack : ""}</p>}>
        <ChatList kind="group" chats={chats}/>
      </ErrorBoundary>
      {selectedChat ? 
        <Chat/> :
        <UnselectedChat kind="group"/>
      }
    </>
  )
}

export default Groups