import { useContext } from "react";
import Chat from "../../components/Chat/Chat";
import ChatList from "../../components/ChatList/ChatList";
import { SelectedChatContext } from "../../utils";
import { useQueries, useSuspenseQuery } from "@tanstack/react-query";
import { getMessagesFromChat } from "../../actions";
import { ErrorBoundary } from "react-error-boundary";

const boilerplateMessages = [
  {
    content: "Hello, group!",
    sentAt: new Date("2026-08-05 13:00"),
    editedAt: null,
  },
  {
    content: "Hi",
    sentAt: new Date("2026-08-05 14:00"),
    editedAt: null,
  },
  {
    content: "?",
    sentAt: new Date("2026-08-05 15:00"),
    editedAt: null,
  },
]

const boilerplateGroups = [
  {
    chat: {name: "Dumb people", description: null, createdAt: new Date("2025-08-05 15:00")},
    lastMessage: {
      content: "?",
      sentAt: new Date("2026-08-05 15:00"),
      editedAt: null,
    }
  },
  {
    chat: {name: "College Subjects", description: null, createdAt: new Date("2024-08-05 15:00")},
    lastMessage: {
      content: "I love CS!",
      sentAt: new Date("2026-08-05 14:00"),
      editedAt: null,
    }
  },
  {
    chat: {name: "Family", description: null, createdAt: new Date("2023-08-05 15:00")},
    lastMessage: {
      content: "We're having a baby...",
      sentAt: new Date("2026-08-05 15:00"),
      editedAt: null,
    }
  },
]

type Props = {}

const Groups = (props: Props) => {
  const {selectedChat} = useContext(SelectedChatContext);
  
  const {data: groups, error} = useSuspenseQuery({
    queryKey: ["user", "friends"],
    queryFn: () => getUserGroups(),
    staleTime: Infinity
  })

  const messages = useQueries({
    queries: groups ? groups.map(group => ({
      queryKey: ["conversations", group.id],
      queryFn: () => getMessagesFromChat("group", group.id),
      staleTime: Infinity
    })) : []
  });

  const chats = groups.map(group => ({
    chat: group,
    lastMessage: {
      contact: "test",
      message: {
        content: "test",
        sentAt: "2026-03-05 10:00",
        editedAt: null,
        deletedAt: null,
        sender: { name: "test" }
      }
    }
  }))

  return (
    <>
      <ErrorBoundary fallback={<p>Something went wrong when loading user's groups: <br/>{error ? error.stack : ""}</p>}>
        <ChatList kind="group" chats={chats}/>
      </ErrorBoundary>
      {selectedChat ? 
        <Chat kind="group"/> :
        <div id="chat" className="flex flex-col flex-1 overflow-hidden">
          No chats selected.
        </div>
      }
    </>
  )
}

export default Groups