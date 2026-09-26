import type { ComponentProps, ReactElement, ReactNode, RefObject } from "react";
import "./contextmenu.css";
import { cn } from "../../utils";

type MenuItemProps = {
  name?: string
  children?: ReactNode;
} & ComponentProps<"button">

export const MenuItem = ({name, children, className, ...props}: MenuItemProps) => {
  return <li>
    <button 
      className={cn(`flex flex-1 items-center gap-2.5 cursor-pointer [&>svg]:size-5 [&>p]:flex-1 [&>p]:text-left`, 
        name, 
        className
      )} {...props}>
      {children}
      {name && <p className="info">{`${name[0].toUpperCase()}${name.slice(1)}`}</p>}
    </button>
  </li>
}

type ContextMenuProps = {
  ref: RefObject<HTMLDivElement | null>
  children: ReactElement<MenuItemProps> | (false | ReactElement<MenuItemProps>)[]
} & Omit<ComponentProps<"div">, "ref">

export const ContextMenu = ({children, className, ...props}: ContextMenuProps) => {
  return (
    <div 
      {...props}
      className={cn("bg-dark-500 z-10 rounded-2xl border border-dark-200 text-sm", className)}
      popover="auto"
    >
      <ul className="detail overflow-hidden p-1 flex *:flex flex-col">
        {children}
      </ul>
    </div>
  )
}