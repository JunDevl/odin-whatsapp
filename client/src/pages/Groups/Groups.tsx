import Chat from "../../components/Chat/Chat";
import ChatList from "../../components/ChatList/ChatList";

const boilerplateMessages = [
  {
    sentAt: new Date("2026-08-05 13:00"),
    sender: "Yo Mama",
    text: "Hello, group!",
  },
  {
    sentAt: new Date("2026-08-05 14:00"),
    sender: "John Doe",
    text: "Hi",
  },
  {
    sentAt: new Date("2026-08-05 15:00"),
    sender: "Jun",
    text: "?",
  },
]

const boilerplateGroups = [
  {
    name: "Dumb people",
    lastMessage: "?",
    sentAt: new Date("2026-08-05 15:00"),
  },
  {
    name: "College Subjects",
    lastMessage: "I love CS!",
    sentAt: new Date("2026-08-05 14:00")
  },
  {
    name: "Family",
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