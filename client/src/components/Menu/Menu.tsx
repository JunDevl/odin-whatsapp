import { Link } from "react-router";
import { useContext } from "react";
import { SelectedChatContext } from "../../utils";

type Props = {}

const Menu = (props: Props) => {
  const {setSelectedChatID} = useContext(SelectedChatContext);

  return (
    <nav id="menu" className="p-0.5 overflow-hidden">
      <ul className="flex flex-col gap-2 [&>li>a]:p-2 [&>li>a]:block *:rounded-lg *:aspect-square *:w-10 *:hover:bg-dark-300">
        <li>
          <Link to={"priv"} onClick={() => setSelectedChatID(null)} title="Conversations">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 9H17M10 13H17M7 9H7.01M7 13H7.01M21 20L17.6757 18.3378C17.4237 18.2118 17.2977 18.1488 17.1656 18.1044C17.0484 18.065 16.9277 18.0365 16.8052 18.0193C16.6672 18 16.5263 18 16.2446 18H6.2C5.07989 18 4.51984 18 4.09202 17.782C3.71569 17.5903 3.40973 17.2843 3.21799 16.908C3 16.4802 3 15.9201 3 14.8V7.2C3 6.07989 3 5.51984 3.21799 5.09202C3.40973 4.71569 3.71569 4.40973 4.09202 4.21799C4.51984 4 5.0799 4 6.2 4H17.8C18.9201 4 19.4802 4 19.908 4.21799C20.2843 4.40973 20.5903 4.71569 20.782 5.09202C21 5.51984 21 6.0799 21 7.2V20Z" stroke="currentColor" fill="transparent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </li>
        <li>
          <Link to={"group"} onClick={() => setSelectedChatID(null)} title="Groups">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.6311 7.15517C15.9018 7.05482 16.1945 7 16.5001 7C17.8808 7 19.0001 8.11929 19.0001 9.5C19.0001 10.8807 17.8808 12 16.5001 12C16.1945 12 15.9018 11.9452 15.6311 11.8448" stroke="currentColor" fill="transparent" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 19C3.69137 16.6928 5.46998 16 9.5 16C13.53 16 15.3086 16.6928 16 19" stroke="currentColor" fill="transparent" strokeWidth="2" strokeLinecap="round"/>
              <path d="M17 15C19.403 15.095 20.5292 15.6383 21 17" stroke="currentColor" fill="transparent" strokeWidth="2" strokeLinecap="round"/>
              <path d="M13 9.5C13 11.433 11.433 13 9.5 13C7.567 13 6 11.433 6 9.5C6 7.567 7.567 6 9.5 6C11.433 6 13 7.567 13 9.5Z" stroke="currentColor" fill="transparent" strokeWidth="2"/>
            </svg>
          </Link>
        </li>
        <li>
          <Link to={"profile"} onClick={() => setSelectedChatID(null)} title="Profile">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z" stroke="currentColor" fill="transparent" strokeWidth="2"/>
              <path d="M3 21C3.95728 17.9237 6.41998 17 12 17C17.58 17 20.0427 17.9237 21 21" stroke="currentColor" fill="transparent" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Menu