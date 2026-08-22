import { Link } from "react-router";
import "./menu.css"
import { useContext } from "react";
import { SelectedChatContext } from "../../utils";

type Props = {}

const Menu = (props: Props) => {
  const {setSelectedChat} = useContext(SelectedChatContext);

  return (
    <nav id="menu" className="p-0.5 overflow-hidden">
      <ul className="flex flex-col gap-2 [&>li>a]:py-3 *:hover:bg-gray-700">
        <li>
          <Link to={"priv"} onClick={() => setSelectedChat(null)}>Conversations</Link>
        </li>
        <li>
          <Link to={"group"} onClick={() => setSelectedChat(null)}>Groups</Link>
        </li>
        <li>
          <Link to={"profile"} onClick={() => setSelectedChat(null)}>Profile</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Menu