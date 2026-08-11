import { Navigate, type RouteObject } from "react-router";
import App from "./App";
import PageNotFound from "./pages/PageNotFound/PageNotFound";
import Conversations from "./pages/Conversations/Conversations";
import Groups from "./pages/Groups/Groups";
import Profile from "./pages/Profile/Profile";
import Auth from "./pages/Auth/Auth";

// import { queryClient } from "./main";
import { getLoggedUser } from "./actions";

const user = await getLoggedUser();

const routes: RouteObject[] = [
  {
    index: true,
    element: <Navigate to={user ? `/chat/priv` : `/auth`} replace/>
  },
  {
    path: "/auth",
    element: <Auth/>
  },
  {
    path: "/chat",
    element: <App/>,
    children: [
      {
        path: "priv",
        element: <Conversations/>
      },
      {
        path: "group",
        element: <Groups/>
      },
      {
        path: "profile",
        element: <Profile/>
      }
    ]
  },
  {
    path: "*",
    element: <PageNotFound/>
  }
]

export default routes;