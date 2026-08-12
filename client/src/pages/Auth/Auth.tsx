import { useRef, useState, type SubmitEvent } from "react";
import { createUser, loginUser } from "../../actions";
import { handleError, PromiseError } from "@packages/utils";
import { useNavigate } from "react-router";

type Props = {}

const Auth = (props: Props) => {
  const form = useRef<HTMLFormElement>(null);

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const navigate = useNavigate();

  const handleAuth = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(form.current!);

    const response: any = await handleError(authMode == "login" ? loginUser(data) : createUser(data));

    if (response instanceof PromiseError) throw new Error(response.error);

    navigate("/chat/priv");
  }

  return (
    <div id="auth" className="self-center flex flex-col p-4">
      <h2>Welcome to Odin-Whatsapp!</h2>

      <h3>{authMode === "login" ? "Log-in!" : "Sign-up!"}</h3>

      <form 
        className="p-2 gap-2 border border-white rounded-md grid grid-cols-2"
        onSubmit={handleAuth}
        ref={form}
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
            <input type="text" name="name" id="name" />

            <label htmlFor="profile_name">Profile Name:</label>
            <input type="text" name="profile_name" id="profile_name" />

            <label htmlFor="email">Email:</label>
            <input type="email" name="email" id="email" />

            <label htmlFor="password">Password:</label>
            <input type="password" name="password" id="password" />
          </>
        }

        <div id="buttons" className="col-span-2">
          <button type="submit" className="bg-sky-700 active:bg-sky-800 hover:bg-sky-600">{authMode === "login" ? "Log-in" : "Sign-up"}</button>
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