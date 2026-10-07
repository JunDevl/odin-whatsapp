import { Outlet } from "react-router";
import Menu from "./components/Menu/Menu";
import { ContactsContext, GroupsContext, SelectedChatContext, type Contact, type GroupMemberResponse, type MessageResponse, type SelectedChatID } from "./utils";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getUserContacts, getUserGroups, socket } from "./actions";
import type { Status } from "@packages/utils";
import { ErrorBoundary } from "react-error-boundary";

const App = () => {
  const queryClient = useQueryClient();

  const [selectedChatID, setSelectedChatID] = useState<SelectedChatID | null>(null);
  const selectedChatState = {selectedChatID, setSelectedChatID};

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

  type RecieverChat = {id: string} | {name: string};

  const addMessageToChat = (newMessage: MessageResponse, reciever: RecieverChat) => {
    const isRecieverContact = "name" in reciever;

    queryClient.setQueryData(
      ["user_chats", isRecieverContact ? reciever.name : reciever.id],
      (prevMessages: {messages: MessageResponse[]} & ({contact: string} | {group: string})) => ({
        contact: "contact" in prevMessages ? prevMessages.contact : prevMessages.group,
        messages: [...prevMessages.messages, newMessage]
      })
    )
  }

  const updateChatMessage = (updatedMessage: MessageResponse, reciever: RecieverChat) => {
    const isRecieverContact = "name" in reciever;

    return queryClient.setQueryData(
      ["user_chats", isRecieverContact ? reciever.name : reciever.id],
      (prevMessages: {contact: string, messages: MessageResponse[]}) => {
        const messageIndex = prevMessages.messages.findIndex(message => message.id === updatedMessage.id);

        const newMessages = {...prevMessages};

        newMessages.messages[messageIndex] = updatedMessage;

        return newMessages;
      }
    )
  }

  const removeChatMessage = (messageID: string, reciever: RecieverChat) => {
    const isRecieverContact = "name" in reciever;

    return queryClient.setQueryData(
      ["user_chats", isRecieverContact ? reciever.name : reciever.id],
      (prevMessages: {contact: string, messages: MessageResponse[]}) => {
        const messageIndex = prevMessages.messages.findIndex(message => message.id === messageID);

        const newMessages = {...prevMessages};

        newMessages.messages.splice(messageIndex, 1);

        return newMessages;
      }
    )
  }

  const messageEvents = {
    recieveMessage: "recieveMessage",
    editMessage: "editMessage",
    deleteMessage: "deleteMessage"
  }

  const messageEventsSocketInit = () => {
    socket.on(
      messageEvents.recieveMessage, 
      (
        message: { message: MessageResponse }, 
        reciever: RecieverChat
      ) => addMessageToChat(message.message, reciever)
    )

    socket.on(
      messageEvents.editMessage, 
      (
        message: { message: MessageResponse }, 
        reciever: RecieverChat
      ) => updateChatMessage(message.message, reciever)
    )

    socket.on(
      messageEvents.deleteMessage, 
      (
        message: { message: MessageResponse }, 
        reciever: RecieverChat
      ) => removeChatMessage(message.message.id, reciever)
    )
  }

  useEffect(() => {
    if (contacts.error) return;

    const {data} = contacts;

    data.forEach(({friendUser}, i) => {
      socket.on(`status:${friendUser.name}`, (status: Status) => {
        return queryClient.setQueryData(
          ["user", "friends"], 
          (prevFriends: {friendUser: Contact, status: Status}[]) => {
            const newFriends = [...prevFriends];

            newFriends[i].status = status;

            return newFriends;
          }
        )
      })
    })

    messageEventsSocketInit();

    return () => {
      data.forEach(({friendUser}) => socket.off(`status:${friendUser.name}`));
      Object.keys(messageEvents).forEach(messageEvent => socket.off(messageEvent));
    };
  }, [contacts])

  useEffect(() => {
    if (groups.error) return;

    // const {data} = groups;

    // //TODO: implement this in the server-side as well

    // data.forEach(({group}, i) => {
    //   socket.on(
    //     `group:${group.id}:memberStatus`, 
    //     (status: Status, memberName: string) => queryClient.setQueryData(
    //       ["group_members", group.id], 
    //       (prevMembers: GroupMemberResponse[]) => {
    //         const newMembers = [...prevMembers];

    //         const memberIndex = newMembers.findIndex(member => member.user.name === memberName);

    //         newMembers[memberIndex].status = status;

    //         return newMembers;
    //       }
    //     )
    //   )

    //   socket.on(
    //     `group:${group.id}:memberJoined`, 
    //     (status: Status, newMember: Contact) => queryClient.setQueryData(
    //       ["group_members", group.id], 
    //       (prevMembers: GroupMemberResponse[]) => [
    //         ...prevMembers, {status, user: newMember}
    //       ]
    //     )
    //   )
    // })

    messageEventsSocketInit();

    return () => {
      // data.forEach(({group}) => {
      //   socket.off(`group:${group.id}:memberStatus`);
      //   socket.off(`group:${group.id}:memberJoined`);
      // });
      Object.keys(messageEvents).forEach(messageEvent => socket.off(messageEvent));
    };
  }, [groups])

  return (
    <SelectedChatContext value={selectedChatState}>
      <Menu/>
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
