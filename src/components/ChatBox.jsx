import { useContext } from "react";
import { ThemeContext } from "../contexts/AppContexts";

const ChatBox = () => {
    // Theme
    const { light } = useContext(ThemeContext);

    return (
        <section
            className={`container mx-auto w-[90%] h-[75vh] sm:w-[90%] md:w-[80%] lg:w-[70%] p-4 sm:p-6 md:p-8 rounded-xl shadow-md transition-all ${light ? "bg-neutral-50" : "bg-gray-800"}`}
        >
            <p className={`${light ? "text-black" : "text-white"} text-lg font-semibold`}>
                ChatON
            </p>
        </section>
    );
};

export default ChatBox;
