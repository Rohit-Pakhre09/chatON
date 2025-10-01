import { useState } from "react";
import { auth } from "../firebase";
import UserList from "./UserList";
import ChatSection from "./ChatSection";

const ChatBox = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const currentUser = auth.currentUser;

    return (
        <div className="flex h-screen w-full transition-all duration-500 ease-in-out bg-white dark:bg-neutral-200">
            {/* Desktop layout */}
            <div className="hidden md:flex w-full">
                <div className="w-1/3 border-r h-full">
                    <UserList
                        currentUser={currentUser}
                        setSelectedUser={setSelectedUser}
                        selectedUser={selectedUser}
                    />
                </div>
                <div className="flex-1 h-full">
                    <ChatSection
                        otherUser={selectedUser}
                        onBack={() => setSelectedUser(null)}
                    />
                </div>
            </div>

            {/* Mobile layout: UserList, ChatSection, Profile section */}
            <div className="flex flex-col md:hidden w-full h-full">
                {/* UserList */}
                <div className="flex-1 overflow-y-auto">
                    <UserList
                        currentUser={currentUser}
                        setSelectedUser={setSelectedUser}
                        selectedUser={selectedUser}
                    />
                </div>
                {/* ChatSection */}
                {selectedUser && (
                    <div className="flex-1 overflow-y-auto">
                        <ChatSection
                            otherUser={selectedUser}
                            onBack={() => setSelectedUser(null)}
                        />
                    </div>
                )}
                {/* Profile section */}
                <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-200">
                    <img
                        src={currentUser?.photoURL || require('../assets/avatar.png')}
                        className="w-8 h-8 rounded-full object-cover"
                        alt={currentUser?.displayName || 'User'}
                    />
                    <h2 className="font-semibold text-sm truncate">
                        {currentUser?.displayName || 'User'}
                    </h2>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
