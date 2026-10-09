import { Suspense, type ComponentProps, type RefObject } from "react";
import { cn } from "../../utils";
import { useNavigate, useParams } from "react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getInvitingGroup, getUserGroups, joinGroup } from "../../actions";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
  ref: RefObject<HTMLDialogElement | null>
} & Omit<ComponentProps<"dialog">, "ref">

const GroupInvitationModal = ({className, ...props}: Props) => {
  const params = useParams();

  const joinGroupID = params.groupID!;

  const {data: group, error} = useSuspenseQuery({
    queryKey: ["join_group"],
    queryFn: () => getInvitingGroup(joinGroupID)
  })

  const navigate = useNavigate();
  const modal = props.ref;
  const queryClient = useQueryClient();

  return (
    <dialog {...props} className={cn("modal", className)}>
      <ErrorBoundary fallback={
        <p>
          Something went wrong.

          {error && error.stack}
        </p>
      }>
        <Suspense fallback={<p>Loading group...</p>}>
          <h3>
            You've been invited to <span>{group.name}!</span>
            <br />
            Want to join in?
          </h3>

          <div className="buttons flex justify-center">
            <button 
              onClick={async () => {
                const joined = await joinGroup(group.id);

                await queryClient.fetchQuery({
                  queryKey: ["user", "groups"],
                  queryFn: () => getUserGroups()
                })

                navigate("/chat/group");
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
        </Suspense>
      </ErrorBoundary>
    </dialog>
  )
}

export default GroupInvitationModal