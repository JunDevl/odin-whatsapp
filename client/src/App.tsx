import { Outlet } from "react-router";
import Menu from "./components/Menu/Menu";
import { SelectedChatContext, type MessageResponse } from "./utils";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "./actions";

const App = () => {
  const queryClient = useQueryClient();

  const [selectedChat, setSelectedChat] = useState<{ kind: "group" | "conversation", name: string } | null>(null);
  const selectedChatState = {selectedChat, setSelectedChat};

  useEffect(() => {
    socket.on("recievedMessage", (message: MessageResponse, reciever: Record<"name" | "id", string>) => {
      if ("name" in reciever) 
        return queryClient.setQueryData(
          [`${selectedChat?.kind}s`, selectedChat?.name],
          (prevMessages: {contact: string, messages: MessageResponse[]}) => ({
            contact: prevMessages.contact,
            messages: [...prevMessages.messages, message]
          })
        )
      
      
      //TODO: write code for when it's an incoming group message (reciever obj has an ID.)
    })

    return () => {socket.off("recievedMessage")};
  }, [selectedChat])

  return (
    <SelectedChatContext value={selectedChatState}>
      <Menu/>
      <Outlet/>
    </SelectedChatContext>
  )
}

export default App
