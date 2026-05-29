import {createContext, useState} from "react";

export const ThemeContext = createContext();

export default function ThemeContextProvider({ children }) {

    const [theme, setTheme] = useState('light');

    function toggleTheme() {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}