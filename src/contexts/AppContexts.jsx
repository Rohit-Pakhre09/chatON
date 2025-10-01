import { createContext, useState } from "react";

export const ThemeContext = createContext(null);

const AppContexts = ({ children }) => {
    const [light, setLight] = useState(() => {
        const saved = localStorage.getItem("chatON-lightTheme");
        return saved ? JSON.parse(saved) : true;
    });

    const handleTheme = () => {
        setLight((theme) => {
            const newTheme = !theme;
            localStorage.setItem("chatON-lightTheme", JSON.stringify(newTheme));
            return newTheme;
        });
    };

    return (
        <ThemeContext.Provider value={{ light, handleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default AppContexts;
