import Chat from "../../components/Chat/Chat";
import ChatList from "../../components/ChatList/ChatList";
import { useContext } from "react";
import { ContactsContext, SelectedChatContext } from "../../utils";

type Props = {}

const Conversations = (props: Props) => {
  const contacts = useContext(ContactsContext)!;
  const {selectedChatID} = useContext(SelectedChatContext);

  const selectedContactID = selectedChatID && selectedChatID as {name: string};

  const selectedChat = selectedChatID && contacts.find(({friendUser}) => friendUser.name === selectedContactID?.name);

  return (
    <>
      <ChatList kind="user" chats={contacts} selectedChat={selectedChat}/>
      <Chat kind="user" selectedChat={selectedChat}/> :
    </>
  )
}

export default Conversations