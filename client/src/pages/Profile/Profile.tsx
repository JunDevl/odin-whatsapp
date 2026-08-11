import { useSuspenseQuery } from "@tanstack/react-query";
import { getLoggedUser } from "../../actions";

type Props = {}

const Profile = (props: Props) => {
  const { data: user } = useSuspenseQuery({
    queryKey: ["user"],
    queryFn: () => getLoggedUser()
  })

  return (
    <div id="profile" className="flex-1 flex flex-col p-3 *:flex *:gap-3">
      <div id="user-name">
        <label>Name:</label>
        <p>{user!.name}</p>
      </div>
      <div id="profile-name">
        <label>Profile Name:</label>
        <p>{user!.profile_name}</p>
      </div>
      <div id="email">
        <label>E-mail:</label>
        <p>{user!.email}</p>
      </div>
      <div id="password">
        <label>Password:</label>
        <p></p>
      </div>
    </div>
  )
}

export default Profile