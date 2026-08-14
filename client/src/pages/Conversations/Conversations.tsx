import { useSuspenseQuery } from "@tanstack/react-query";
import Chat from "../../components/Chat/Chat";
import ChatList from "../../components/ChatList/ChatList";
import { getUserContacts } from "../../actions";
import { Suspense } from "react";

const boilerplateMessages = [
  {
    content: "Yo!",
    sentAt: new Date("2026-08-05 8:00"),
    editedAt: null,
  },
  {
    content: "You aight?",
    sentAt: new Date("2026-08-05 9:00"),
    editedAt: null,
  },
  {
    content: "...",
    sentAt: new Date("2026-08-05 10:00"),
    editedAt: null,
  },
]

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
  const {data: contacts} = useSuspenseQuery({
    queryKey: ["user", "friends"],
    queryFn: () => getUserContacts()
  })

  return (
    <>
      <Suspense fallback={<p>Loading ...</p>}>
        <ChatList kind="conversation" chats={contacts as any}/>
      </Suspense>
      <Suspense fallback={<p>Loading ...</p>}>
        <Chat kind="conversation" messages={boilerplateMessages}/>
      </Suspense>
    </>
  )
}

export default Conversations