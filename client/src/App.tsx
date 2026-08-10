import { Outlet } from "react-router";
import Menu from "./components/Menu/Menu";

const App = () => {

  return (
    <>
      <Menu/>
      <Outlet/>
    </>
  )
}

export default App
