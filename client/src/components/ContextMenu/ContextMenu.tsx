import type { ComponentProps, JSX, ReactElement, ReactNode, RefObject, SVGProps } from "react";
import "./contextmenu.css";
import type React from "react";
import { cn } from "../../utils";

type MenuItemProps = {
  name?: string
  children?: ReactNode;
} & ComponentProps<"button">

export const MenuItem = ({name, children, className, ...props}: MenuItemProps) => {
  return <li>
    <button className={cn(name, className)} {...props}>
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
      <ul className="detail overflow-hidden p-1 flex *:flex flex-col items-stretch [&>li>button]:flex [&>li>button]:flex-1 [&>li>button]:items-center [&>li>button]:gap-2.5 [&>li>button]:cursor-pointer [&>li>button>svg]:w-5 [&>li>button>p]:flex-1 [&>li>button>p]:text-left">
        {children}
      </ul>
    </div>
  )
}