import { Outlet } from "react-router";
import Menu from "./components/Menu/Menu";
import { SelectedChatContext, type MessageResponse, type SelectedChat } from "./utils";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "./actions";

const App = () => {
  const queryClient = useQueryClient();

  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);
  const selectedChatState = {selectedChat, setSelectedChat};

  useEffect(() => {
    socket.on("recieveMessage", (message: { message: MessageResponse }, reciever: Record<"name" | "id", string>) => {
      if ("name" in reciever)
        return queryClient.setQueryData(
          ["conversations", message.message.sender.name],
          (prevMessages: {contact: string, messages: MessageResponse[]}) => ({
            contact: prevMessages.contact,
            messages: [...prevMessages.messages, message]
          })
        )
      
      
      //TODO: write code for when it's an incoming group message (reciever obj has an ID.)
    })

    socket.on("editMessage", (message: { message: MessageResponse }, reciever: Record<"name" | "id", string>) => {

    })

    socket.on("deleteMessage", (message: { message: MessageResponse }, reciever: Record<"name" | "id", string>) => {
      
    })

    return () => {
      socket.off("recieveMessage")
    };
  }, [selectedChat])

  return (
    <SelectedChatContext value={selectedChatState}>
      <Menu/>
      <Outlet/>
    </SelectedChatContext>
  )
}

export default App
