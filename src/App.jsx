import { useContext } from "react";
import { ThemeContext } from "./contexts/AppContexts";
import AllRoutes from "./router/AllRoutes";

const App = () => {
  const { light } = useContext(ThemeContext);

  return (
    <main className={`min-h-screen flex items-center justify-center ${light ? "bg-neutral-200" : "bg-black/95"} animation`}>
      {/* <MainPage /> */}
      <AllRoutes />
    </main>
  )
}

export default App