import { Link } from "react-router";
import "./menu.css"
import { useEffect } from "react";

type Props = {}

const Menu = (props: Props) => {
  return (
    <nav id="menu" className="p-0.5 overflow-hidden">
      <ul className="flex flex-col gap-2 [&>li>a]:py-3 *:hover:bg-gray-700">
        <li>
          <Link to={"priv"}>Conversations</Link>
        </li>
        <li>
          <Link to={"group"}>Groups</Link>
        </li>
        <li>
          <Link to={"profile"}>Profile</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Menu