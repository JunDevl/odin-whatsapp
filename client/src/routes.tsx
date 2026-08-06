import { Navigate, type RouteObject } from "react-router";
import App from "./App";
import PageNotFound from "./pages/PageNotFound/PageNotFound";
import Conversations from "./pages/Conversations/Conversations";
import Groups from "./pages/Groups/Groups";
import Profile from "./pages/Profile/Profile";

const jwt = localStorage.getItem("jwt");

const routes: RouteObject[] = [
  {
    index: true,
    element: <Navigate to={jwt ? `/chat` : `/auth`} replace/>
  },
  {
    path: "/chat",
    element: <App/>,
    children: [
      {
        path: "/priv",
        element: <Conversations/>
      },
      {
        path: "/group",
        element: <Groups/>
      }
    ]
  },
  {
    path: "/profile",
    element: <Profile/>
  },
  {
    path: "*",
    element: <PageNotFound/>
  }
]

export default routes;