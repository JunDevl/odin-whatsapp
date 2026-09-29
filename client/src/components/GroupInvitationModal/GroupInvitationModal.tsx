import { Suspense, type ComponentProps, type RefObject } from "react";
import { cn, type GroupResponse } from "../../utils";
import { useNavigate } from "react-router";

type Props = {
  group: GroupResponse | undefined,
  error: Error | null,
  status: "error" | "success" | "pending",
  ref: RefObject<HTMLDialogElement | null>
} & Omit<ComponentProps<"dialog">, "ref">

const GroupInvitationModal = ({status, group, error, className, ...props}: Props) => {
  const navigate = useNavigate();
  const modal = props.ref;

  return (
    <dialog {...props} className={cn("modal", className)}>
      {status === "pending" && 
        <p>Loading group...</p>
      }
      {error ? 
        <p>
          Something went wrong.

          {error.stack}
        </p> : 
        <>
          <h3>
            You've been invited to <span>{group!.name}!</span>
            <br />
            Want to join in?
          </h3>

          <div className="buttons flex justify-center">
            <button 
              onClick={() => {
                // Insert user to group's member table as with the "member" role
              }}
              className="bg-primary-500 hover:bg-primary-600 active:bg-primary-400"
            >
              Join
            </button>
            <button 
              onClick={() => {
                modal.current!.close();
                navigate("/chat/group");
              }}
            >
              Cancel
            </button>
          </div>
        </>
      }
    </dialog>
  )
}

export default GroupInvitationModal