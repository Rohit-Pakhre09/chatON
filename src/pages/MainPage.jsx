import { useState, useContext } from "react";
import UserList from "../components/UserList";
import ChatSection from "../components/ChatSection";
import { ThemeContext } from "../contexts/AppContexts";

export default function MainPage() {
    const { light } = useContext(ThemeContext);
    const [selectedUser, setSelectedUser] = useState(null);

    return (
        <div
            className={`flex flex-col md:flex-row h-screen w-full transition-all duration-500 ease-in-out ${light ? "bg-neutral-200 text-black" : "bg-black/95 text-white"
                }`}
        >
            {/* User List */}
            <div className="md:w-1/4 w-full border-r border-gray-300 dark:border-gray-700">
                <UserList onSelectUser={setSelectedUser} />
            </div>

            {/* Chat Section */}
            <div className="flex-1 w-full h-full">
                {selectedUser ? (
                    <ChatSection otherUser={selectedUser} onBack={() => setSelectedUser(null)} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        Select a user to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}
