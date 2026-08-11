import { useState } from "react";
import { createUser, loginUser } from "../../actions";
import { handleError, PromiseError } from "@packages/utils";
import { useNavigate } from "react-router";

type Props = {}

const Auth = (props: Props) => {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const navigate = useNavigate();

  const handleAuth = async (data: FormData) => {
    const response = await handleError(authMode == "login" ? loginUser(data) : createUser(data));

    if (response instanceof PromiseError) throw new Error(response.error);

    navigate("/chat/priv");
  }

  return (
    <div id="auth" className="self-center flex flex-col p-4">
      <h2>Welcome to Odin-Whatsapp!</h2>

      <h3>{authMode === "login" ? "Log-in!" : "Sign-up!"}</h3>

      <form 
        action={handleAuth}
        className="p-2 gap-2 border border-white rounded-md grid grid-cols-2"
        onSubmit={e => e.preventDefault()}
      >
        {authMode === "login" ? 
          <>
            <label htmlFor="email">Email:</label>
            <input type="email" name="email" id="email" />

            <label htmlFor="password">Password:</label>
            <input type="password" name="password" id="password" />
          </> :
          <>
            <label htmlFor="name">Name:</label>
            <input type="name" name="name" id="name" />

            <label htmlFor="profile_name">Profile Name:</label>
            <input type="profile_name" name="profile_name" id="profile_name" />

            <label htmlFor="email">Email:</label>
            <input type="email" name="email" id="email" />

            <label htmlFor="password">Password:</label>
            <input type="password" name="password" id="password" />
          </>
        }

        <div id="buttons" className="col-span-2">
          <button type="submit" className="bg-sky-700">{authMode === "login" ? "Log-in" : "Sign-up"}</button>
        </div>

        <p id="change-auth" className="text-center col-span-2">
          {authMode === "login" ? "Doesn't have an account?" : "Already has an account?"} 
          <a 
            className="cursor-pointer"
            onClick={() => setAuthMode(mode => mode === "login" ? "signup" : "login")}
          >
            {authMode === "login" ? " Sign-up!" : " Log-in!"}
          </a>
        </p>
      </form>
    </div>
  )
}

export default Auth