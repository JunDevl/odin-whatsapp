import { Outlet } from "react-router";
import Menu from "./components/Menu/Menu";

const App = () => {

  return (
    <div>
      <Menu/>
      <Outlet/>
    </div>
  )
}

export default App
