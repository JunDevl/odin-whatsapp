import Chat from "../../components/Chat/Chat";

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

type Props = {}

const Conversations = (props: Props) => {
  return (
    <Chat messages={boilerplateMessages}/>
  )
}

export default Conversations