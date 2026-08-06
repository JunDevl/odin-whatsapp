import Chat from "../../components/Chat/Chat";

const boilerplateMessages = [
  {
    sentAt: new Date("2026-08-05 13:00"),
    sender: "Yo Mama",
    text: "Yo!",
  },
  {
    sentAt: new Date("2026-08-05 14:00"),
    sender: "John Doe",
    text: "You aight?",
  },
  {
    sentAt: new Date("2026-08-05 15:00"),
    sender: "Jun",
    text: "...",
  },
]

type Props = {}

const Groups = (props: Props) => {
  return (
    <Chat messages={boilerplateMessages}/>
  )
}

export default Groups