import { useState } from "react";
import { createContext } from "react";

export const ThemeContext = createContext(null)

const AppContext = ({ children }) => {
    const [light, setLight] = useState(() => {
        const saved = localStorage.getItem("chatON-lightTheme");
        return saved ? JSON.parse(saved) : true;
    });

    // Change theme
    const handleTheme = () => {
        setLight((theme) => {
            const newTheme = !theme;
            localStorage.setItem("chatON-lightTheme", JSON.stringify(newTheme));
            return newTheme;
        })
    }

    return (
        <ThemeContext.Provider value={{ light, handleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export default AppContext