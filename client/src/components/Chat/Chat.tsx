import Message from "../Message/Message";
import MessageInput from "../MessageInput/MessageInput";
import { SelectedChatContext } from "../../utils";
import { Suspense, useContext, useRef } from "react";
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

  const {selectedChat} = useContext(SelectedChatContext);

  const {data: messages, error} = useSuspenseQuery({
    queryKey: [`${kind}_chats`, "name" in selectedChat! ? selectedChat.name : selectedChat?.id!],
    queryFn: () => getMessagesFromChat(kind, "name" in selectedChat! ? selectedChat.name : selectedChat?.id!),
    staleTime: Infinity
  })

  return (
    <div id="chat" className="flex flex-col flex-1 overflow-hidden">
      <ChatDetailModal kind={kind} ref={details}/>
      <header id={`current-${kind}-details`} className="border-b-2 flex p-3">
        <div className="details flex-1 cursor-pointer" onClick={() => details.current!.showModal()}>
          {"name" in selectedChat! ? selectedChat.name : selectedChat!.id!}
        </div>
        <div className="search search-message">
          <input type="text" name="searchMessage" id="search-message" placeholder="Search Messages"/>
          <button>s</button>
        </div>
      </header>
      <main className="overflow-hidden overflow-y-auto">
        <ul id={`current-${kind}-messages`} className="flex flex-col items-start gap-1 p-1 px-10">
          <ErrorBoundary fallback={<p>An error ocurred: <br/>{error ? error.stack : ""}</p>}>
            <Suspense fallback={<p>Loading messages ...</p>}>
              {messages.messages.map((message, i) => 
                <Message user={user!} message={message} key={i}/>
              )}
            </Suspense>
          </ErrorBoundary>
        </ul>
      </main>
      <MessageInput/>
    </div>
  )
}

export default Chat