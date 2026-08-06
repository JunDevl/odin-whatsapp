import { Outlet } from "react-router";
import ChatList from "../../../components/ChatList/ChatList";

const boilerplateChats = [
  {
    name: "John Deere",
    lastMessage: "Come visit me!",
    sentAt: Date
  },
  {
    name: "Yo Mama",
    lastMessage: "I ate that bitch!",
    sentAt: Date
  },
  {
    name: "Jun",
    lastMessage: "they say a horse can't walk with two legs.",
    sentAt: Date
  },
]

type Props = {}

const Conversations = (props: Props) => {
  return (
    <>
      <ChatList chats={boilerplateChats}/>
      <Outlet/>
    </>
  )
}

export default Conversations