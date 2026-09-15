import type { ComponentProps, JSX, ReactElement, ReactNode, RefObject } from "react";
import "./contextmenu.css";

type MenuItemProps = {
  name: string
  children: ReactNode
} & Omit<ComponentProps<"button">, "className">

const MenuItem = ({name, children, ...props}: MenuItemProps) => {
  return <li>
    <button className={name} {...props}>
      {children}
      <p className="info">{`${name[0].toUpperCase()}${name.slice(1)}`}</p>
    </button>
  </li>
}

type ContextMenuProps = {
  ref: RefObject<HTMLDivElement | null>
  children: ReactElement<MenuItemProps> | ReactElement<MenuItemProps>[]
} & Omit<ComponentProps<"div">, "className" | "ref">

const ContextMenu = ({children, ...props}: ContextMenuProps) => {
  return (
    <div 
      {...props}
      className="message-menu bg-dark-500 z-10 rounded-2xl border border-dark-200 text-sm"
      popover="auto"
    >
      <ul className="detail overflow-hidden p-1 flex *:flex *:h-8 flex-col items-stretch [&>li>button]:bg-dark-500 [&>li>button]:flex [&>li>button]:flex-1 [&>li>button]:items-center [&>li>button]:gap-2 [&>li>button:not(.trash)]:hover:bg-dark-600 [&>li>button]:cursor-pointer [&>li>button>svg]:w-5 [&>li>button>p]:flex-1 [&>li>button>p]:text-left">
        {children}
      </ul>
    </div>
  )
}

export default ContextMenu