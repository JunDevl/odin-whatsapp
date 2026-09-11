import { Outlet } from "react-router";
import Menu from "./components/Menu/Menu";
import { ContactsContext, GroupsContext, SelectedChatContext, type Contact, type MessageResponse, type SelectedChat } from "./utils";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getUserContacts, getUserGroups, socket } from "./actions";
import type { Status } from "@packages/utils";
import { ErrorBoundary } from "react-error-boundary";

const App = () => {
  const queryClient = useQueryClient();

  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);
  const selectedChatState = {selectedChat, setSelectedChat};

  const groups = useSuspenseQuery({
    queryKey: ["user", "groups"],
    queryFn: () => getUserGroups(),
    staleTime: Infinity
  });

  const contacts = useSuspenseQuery({
    queryKey: ["user", "friends"],
    queryFn: () => getUserContacts(),
    staleTime: Infinity
  });

  useEffect(() => {
    if (contacts.error) return;

    console.log("ok");

    const {data} = contacts;

    data.forEach(({friendUser}, i) => {
      socket.on(`status:${friendUser.name}`, (status: Status) => {
        return queryClient.setQueryData(
          ["user", "friends"], 
          (prevFriends: {friendUser: Contact, status: Status}[]) => {
            const updatedFriend = {...prevFriends[i]};

            updatedFriend.status = status;

            const newFriends = [...prevFriends];

            newFriends[i] = updatedFriend;

            return newFriends;
          }
        )
      })
    })

    return () => data.forEach(({friendUser}) => socket.off(`status:${friendUser.name}`));
  }, [contacts])

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
      socket.off("recieveMessage");
      socket.off("editMessage");
      socket.off("deleteMessage");
    };
  }, [selectedChat])

  return (
    <SelectedChatContext value={selectedChatState}>
      <Menu/>
      <p>{contacts.data[0]!.status}</p>
      <div className="flex flex-1 gap-2 bg-dark-500 *:rounded-2xl py-1" id="page">
        <ErrorBoundary fallback={<p>An error ocurred within the contacts and groups context.</p>}>
          <ContactsContext value={contacts.data}>
            <GroupsContext value={groups.data}>
              <Outlet/>
            </GroupsContext>
          </ContactsContext>
        </ErrorBoundary>
      </div>
    </SelectedChatContext>
  )
}

export default App
