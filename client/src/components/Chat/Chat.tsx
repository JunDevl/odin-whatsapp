import Message from "../Message/Message";
import type { ChatKind } from "../../utils";
import MessageInput from "../MessageInput/MessageInput";
import { SelectedChatContext } from "../../utils";
import { Suspense, useContext, useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getMessagesFromChat } from "../../actions";
import { ErrorBoundary } from "react-error-boundary";


type Props = {
  kind: ChatKind
}

const Chat = ({ kind }: Props) => {
  const {selectedChat} = useContext(SelectedChatContext);

  const {data: messages, error} = useSuspenseQuery({
    queryKey: [`${kind}s`, selectedChat!.name],
    queryFn: () => getMessagesFromChat(kind, selectedChat!.name),
    staleTime: Infinity
  })

  return (
    <div id="chat" className="flex flex-col flex-1">
      <aside id={`current-${kind}-details`} className="border-b-2 flex p-3">
        <div className="details flex-1">
          Details
        </div>
        <div className="search-message flex">
          <input type="text" name="searchMessage" id="search-message" placeholder="Search Messages"/>
          <button>s</button>
        </div>
      </aside>
      <main className="overflow-hidden overflow-y-auto">
        <ul id={`current-${kind}-messages`} className="flex flex-col items-start gap-2 p-3">
          <ErrorBoundary fallback={<p>An error ocurred: <br/>{error ? error.stack : ""}</p>}>
            <Suspense fallback={<p>Loading messages ...</p>}>
              {messages.messages.map((message, i) => 
                <Message message={message} key={i}/>
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