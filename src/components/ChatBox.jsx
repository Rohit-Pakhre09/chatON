import { useContext } from "react";
import { ThemeContext } from "../contexts/AppContexts";

const ChatBox = () => {
    const { light, handleTheme } = useContext(ThemeContext);
    return (
        <section className={`h-200 w-200 ${light ? "bg-white" : "bg-gray-800"}`}>
            <button className="px=5 py-5 text-center bg-blue-300 rounded-3xl" onClick={handleTheme}>Change Theme</button>
        </section>
    )
}

export default ChatBox