import { useQueries, useSuspenseQuery } from "@tanstack/react-query";
import Chat from "../../components/Chat/Chat";
import ChatList from "../../components/ChatList/ChatList";
import { getMessagesFromChat, getUserContacts } from "../../actions";
import { ErrorBoundary } from "react-error-boundary";
import { useContext } from "react";
import { SelectedChatContext } from "../../utils";

// const boilerplateMessages = [
//   {
//     content: "Yo!",
//     sentAt: new Date("2026-08-05 8:00"),
//     editedAt: null,
//   },
//   {
//     content: "You aight?",
//     sentAt: new Date("2026-08-05 9:00"),
//     editedAt: null,
//   },
//   {
//     content: "...",
//     sentAt: new Date("2026-08-05 10:00"),
//     editedAt: null,
//   },
// ]

// const boilerplateConvos = [
//   {
//     chat: {name: "john_doe", profile_name: "John Doe"},
//     lastMessage: {
//       content: "...",
//       sentAt: new Date("2026-08-05 10:00"),
//       editedAt: null
//     }
//   },
//   {
//     chat: {name: "yo_mama", profile_name: "Yo Mama"},
//     lastMessage: {
//       content: "Fuck the police!",
//       sentAt: new Date("2026-08-04 10:00"),
//       editedAt: null
//     }
//   },
//   {
//     chat: {name: "jun", profile_name: "Jun"},
//     lastMessage: {
//       content: "I am ironman",
//       sentAt: new Date("2026-03-05 10:00"),
//       editedAt: null
//     }
//   },
// ]

type Props = {}

const Conversations = (props: Props) => {
  const {selectedChat} = useContext(SelectedChatContext);

  const {data: contacts, error} = useSuspenseQuery({
    queryKey: ["user", "friends"],
    queryFn: () => getUserContacts(),
    staleTime: Infinity
  })

  useQueries({
    queries: contacts ? contacts.map(contact => ({
      queryKey: ["conversations", contact.name],
      queryFn: () => getMessagesFromChat("conversation", contact.name),
      staleTime: Infinity
    })) : []
  });

  const chats = contacts.map(contact => ({
    chat: contact,
    lastMessage: {
      contact: contact.name,
      message: {
        content: "test",
        sentAt: new Date("2026-03-05 10:00"),
        editedAt: null,
        sender: { name: contact.name }
      }
    }
  }))

  return (
    <>
      <ErrorBoundary fallback={<p>Something went wrong when loading user's contacts: <br/>{error ? error.stack : ""}</p>}>
        <ChatList kind="conversation" chats={chats}/>
      </ErrorBoundary>
      {selectedChat ? 
        <Chat kind="conversation"/> :
        <div id="chat" className="flex flex-col flex-1">
          No chats selected.
        </div>
      }
    </>
  )
}

export default Conversations