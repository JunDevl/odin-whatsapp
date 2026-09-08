import type { EntityKind } from "@packages/utils";

type Props = {
  kind: EntityKind
}

const UnselectedChat = ({kind}: Props) => {
  return (
    <div id="chat" className="unselected flex-1 flex items-center justify-center">
      <h2>No chats selected.</h2>
    </div>
  )
}

export default UnselectedChat