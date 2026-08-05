import { Navigate, type RouteObject } from "react-router";
import App from "./App";
import PageNotFound from "./components/PageNotFound/PageNotFound";

const routes: RouteObject[] = [
  {
    index: true,
    element: <Navigate to={'/home'} replace/>
  },
  {
    path: "/home",
    element: <App/>
  },
  {
    path: "*",
    element: <PageNotFound/>
  }
]

export default routes;