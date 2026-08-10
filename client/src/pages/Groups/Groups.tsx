import Chat from "../../components/Chat/Chat";
import ChatList from "../../components/ChatList/ChatList";

const boilerplateMessages = [
  {
    sentAt: new Date("2026-08-05 13:00"),
    editedAt: null,
    content: "Hello, group!",
  },
  {
    sentAt: new Date("2026-08-05 14:00"),
    editedAt: null,
    content: "Hi",
  },
  {
    sentAt: new Date("2026-08-05 15:00"),
    editedAt: null,
    content: "?",
  },
]

const boilerplateGroups = [
  {
    chat: {name: "Dumb people", description: null, createdAt: new Date("2025-08-05 15:00")},
    lastMessage: "?",
    sentAt: new Date("2026-08-05 15:00"),
  },
  {
    chat: {name: "College Subjects", description: null, createdAt: new Date("2024-08-05 15:00")},
    lastMessage: "I love CS!",
    sentAt: new Date("2026-08-05 14:00")
  },
  {
    chat: {name: "Family", description: null, createdAt: new Date("2023-08-05 15:00")},
    lastMessage: "We're having a baby...",
    sentAt: new Date("2026-08-05 15:00")
  },
]

type Props = {}

const Groups = (props: Props) => {
  return (
    <>
      <ChatList kind="conversation" chats={boilerplateGroups}/>
      <Chat kind="conversation" messages={boilerplateMessages}/>
    </>
  )
}

export default Groups