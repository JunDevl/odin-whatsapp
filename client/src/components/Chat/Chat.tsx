import Message from "../Message/Message";
import MessageInput from "../MessageInput/MessageInput";
import { SelectedChatContext } from "../../utils";
import { Suspense, useContext, useEffect, useRef } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getLoggedUser, getMessagesFromChat } from "../../actions";
import { ErrorBoundary } from "react-error-boundary";
import ChatDetailModal from "../ChatDetail/ChatDetail";
import type { EntityKind } from "@packages/utils";


type Props = {
  kind: EntityKind
}

const Chat = ({ kind }: Props) => {
  const {data: user} = useSuspenseQuery({
    queryKey: ["user"],
    queryFn: () => getLoggedUser()
  })

  const details = useRef<HTMLDialogElement>(null);
  const messagesList = useRef<HTMLDivElement>(null);

  const {selectedChat} = useContext(SelectedChatContext);
  const isUserSelected = selectedChat && "user" in selectedChat!;

  const {data: messages, error} = useSuspenseQuery({
    queryKey: [`${kind}_chats`, isUserSelected ? selectedChat.user.name : selectedChat?.group.id],
    queryFn: () => getMessagesFromChat(kind, isUserSelected ? selectedChat.user.name : selectedChat?.group.id!),
    staleTime: Infinity
  })

  useEffect(() => {
    const list = messagesList.current!;

    const messageBlockCountThreshold = 2 // how many messages up high should trigger scrolling on new messages

    const messageBlockHeight = 35.1 // estimate in pixels of the height of message blocks

    const scrollThreshold = 
      messageBlockHeight + // height of the new incoming message
      (messageBlockHeight * messageBlockCountThreshold)

    if (
      list.scrollHeight - (list.clientHeight + list.scrollTop) <=
      scrollThreshold
    ) {
      list.scrollTo({
        behavior: "smooth",
        top: list.scrollHeight + scrollThreshold,
      });
    }
  }, [messages])

  return (
    <div id="chat" className="flex flex-col flex-1 overflow-hidden">
      <ChatDetailModal kind={kind} ref={details}/>
      <header id={`current-${kind}-details`} className="border-b-2 flex p-3">
        <div className="details flex-1 cursor-pointer" onClick={() => details.current!.showModal()}>
          {isUserSelected ? selectedChat.user.name : selectedChat!.group.name}
        </div>
        <div className="search search-message">
          <input type="text" name="searchMessage" id="search-message" placeholder="Search Messages"/>
          <button>s</button>
        </div>
      </header>
      <main className="overflow-hidden overflow-y-auto flex-1" ref={messagesList}>
        <ul 
          id={`current-${kind}-messages`} 
          className="flex flex-col gap-1 p-1" 
        >
          <ErrorBoundary fallback={<p>An error ocurred: <br/>{error ? error.stack : ""}</p>}>
            <Suspense fallback={<p>Loading messages ...</p>}>
              {messages.messages.map((message, i) => 
                <Message user={user!} message={message} key={i}/>
              )}
            </Suspense>
          </ErrorBoundary>
        </ul>
      </main>
      <MessageInput kind={kind}/>
    </div>
  )
}

export default Chat