import Message from "../Message/Message";
import MessageInput from "../MessageInput/MessageInput";
import { SelectedChatContext, type MessageResponse } from "../../utils";
import { Suspense, useContext, useEffect, useRef } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getLoggedUser, getMessagesFromChat } from "../../actions";
import { ErrorBoundary } from "react-error-boundary";
import ChatDetailModal from "../ChatDetailModal/ChatDetailModal";
import type { EntityKind } from "@packages/utils";


type Props = {}

const Chat = (props: Props) => {
  const {data: user} = useSuspenseQuery({
    queryKey: ["user"],
    queryFn: () => getLoggedUser()
  })

  const details = useRef<HTMLDialogElement>(null);
  const messagesList = useRef<HTMLDivElement>(null);

  const {selectedChat} = useContext(SelectedChatContext);
  const kind = "user" in selectedChat! ? "user" : "group";
  const isUserSelected = selectedChat && "user" in selectedChat!;

  const {data: messages, error} = useSuspenseQuery({
    queryKey: [`${kind}_chats`, isUserSelected ? selectedChat.user.name : selectedChat?.group.id],
    queryFn: () => getMessagesFromChat(kind, isUserSelected ? selectedChat.user.name : selectedChat?.group.id!),
    staleTime: Infinity
  })

  useEffect(() => {
    const list = messagesList.current!;

    list.scrollTop = list.scrollHeight;
  }, [])

  useEffect(() => {
    const list = messagesList.current!;

    const messageBlockCountThreshold = 2; // how many messages up high should trigger scrolling on new messages

    const messageBlockHeight = 35.1; // estimate in pixels of the height of message blocks

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
      <ChatDetailModal ref={details}/>
      <header id={`current-${kind}-details`} className="border-b-2 flex p-3">
        <div className="details flex-1 cursor-pointer" onClick={() => details.current!.showModal()}>
          {isUserSelected ? selectedChat.user.name : selectedChat!.group.name}
        </div>
        <div className="search search-message h-8">
          <input type="text" name="searchMessage" id="search-message" placeholder="Search Messages"/>
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 24 24">
              <path d="M 10 2 C 5.5965257 2 2 5.5965291 2 10 C 2 14.403471 5.5965257 18 10 18 C 11.752132 18 13.370523 17.422074 14.691406 16.458984 L 19.845703 21.613281 A 1.250125 1.250125 0 1 0 21.613281 19.845703 L 16.458984 14.691406 C 17.422074 13.370523 18 11.75213 18 10 C 18 5.5965291 14.403474 2 10 2 z M 10 4.5 C 13.052375 4.5 15.5 6.947627 15.5 10 C 15.5 13.052373 13.052375 15.5 10 15.5 C 6.9476251 15.5 4.5 13.052373 4.5 10 C 4.5 6.947627 6.9476251 4.5 10 4.5 z"/>
            </svg>
          </button>
        </div>
      </header>
      <main className="overflow-hidden overflow-y-auto flex-1" ref={messagesList}>
        <ul 
          id={`current-${kind}-messages`} 
          className="flex flex-col gap-1 p-1" 
        >
          <ErrorBoundary fallback={<p>An error ocurred: <br/>{error ? error.stack : ""}</p>}>
            <Suspense fallback={<p>Loading messages ...</p>}>
              {messages.messages.map(({message}, i) => 
                <Message user={user!} message={message} key={i} index={i}/>
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