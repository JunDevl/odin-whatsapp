import Chat from "../../components/Chat/Chat";
import ChatList from "../../components/ChatList/ChatList";

const boilerplateMessages = [
  {
    sentAt: new Date("2026-08-05 8:00"),
    sender: "John Doe",
    text: "Yo!",
  },
  {
    sentAt: new Date("2026-08-05 9:00"),
    sender: "John Doe",
    text: "You aight?",
  },
  {
    sentAt: new Date("2026-08-05 10:00"),
    sender: "John Doe",
    text: "...",
  },
]

const boilerplateConvos = [
  {
    name: "John Doe",
    lastMessage: "...",
    sentAt: new Date("2026-08-05 10:00")
  },
  {
    name: "Yo Mama",
    lastMessage: "Fuck the police!",
    sentAt: new Date("2026-08-04 10:00")
  },
  {
    name: "Jun",
    lastMessage: "I am ironman",
    sentAt: new Date("2026-03-05 10:00")
  },
]

type Props = {}

const Conversations = (props: Props) => {
  return (
    <>
      <ChatList kind="conversation" chats={boilerplateConvos}/>
      <Chat kind="conversation" messages={boilerplateMessages}/>
    </>
  )
}

export default Conversations