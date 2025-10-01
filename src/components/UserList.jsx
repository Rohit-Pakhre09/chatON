import React, { useEffect, useContext, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/AppContexts";
import { LogOut, Moon, Sun, PencilLine } from "lucide-react";
import chatLogo from "../assets/chatON-logo.png";
import fallbackAvatar from "../assets/avatar.png";
import { fetchUsers, logoutUser, updateUserProfile } from "../modules/userSlice";
import { auth } from "../firebase";
import { updateProfile } from "firebase/auth";

export default function UserList({ onSelectUser, selectedUser }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { light, handleTheme } = useContext(ThemeContext);

    // Get users from Redux store
    const users = useSelector((state) => state.user.users || []);
    const currentUser = users.find((u) => u.id === auth.currentUser?.uid);
    const otherUsers = users.filter((u) => u.id !== auth.currentUser?.uid);

    // Fetch users on mount
    useEffect(() => {
        if (auth.currentUser) {
            dispatch(fetchUsers());
        } else {
            navigate("/signin");
        }
    }, [dispatch, navigate]);

    return (
        <div
            className={`h-full flex flex-col w-full max-w-full ${light ? "bg-neutral-50 text-gray-900" : "bg-gray-800 text-gray-100"} transition-all duration-500`}
        >
            {/* Header */}
            <div
                className={`flex items-center px-2 sm:px-4 py-3 sm:py-4 gap-2 ${light ? "bg-blue-700 text-white" : "bg-gray-900 text-white"} transition-all duration-500 sticky top-0 z-10`}
            >
                <img
                    src={chatLogo}
                    className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
                    alt="logo"
                />
                <h2 className="font-bold text-xl sm:text-2xl md:text-3xl truncate">
                    chatON
                </h2>
            </div>

            {/* Scrollable User List */}
            <div className="flex-1 overflow-y-auto px-2 sm:px-3 min-h-0">
                {otherUsers.map((u) => (
                    <div
                        key={u.id}
                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 cursor-pointer rounded-r-lg ${selectedUser?.id === u.id
                            ? light
                                ? "bg-blue-100 text-gray-900"
                                : "bg-blue-800 text-gray-100"
                            : light
                                ? "hover:bg-gray-200 text-gray-900"
                                : "hover:bg-gray-700 text-gray-100"
                            } transition-all duration-300`}
                        onClick={() => onSelectUser(u)}
                    >
                        <img
                            src={u.photoURL || fallbackAvatar}
                            alt={u.displayName || "User"}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                            onError={(e) => (e.currentTarget.src = fallbackAvatar)}
                        />
                        <span className="font-medium text-base sm:text-lg truncate">
                            {u.displayName || "User"}
                        </span>
                    </div>
                ))}
            </div>

            {/* Current User – pinned at bottom */}
            {currentUser && (
                <CurrentUserProfile
                    currentUser={currentUser}
                    light={light}
                    handleTheme={handleTheme}
                    dispatch={dispatch}
                    navigate={navigate}
                />
            )}
        </div>
    );
}

function CurrentUserProfile({ currentUser, light, handleTheme, dispatch, navigate }) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(currentUser.displayName || "");
    const [photoURL, setPhotoURL] = useState(currentUser.photoURL || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Sync state with currentUser changes
    useEffect(() => {
        setName(currentUser.displayName || "");
        setPhotoURL(currentUser.photoURL || "");
    }, [currentUser]);

    const handleSave = async () => {
        if (!name.trim()) {
            setError("Name cannot be empty");
            return;
        }
        setLoading(true);
        setError("");
        try {
            // Update Firebase Auth profile
            await updateProfile(auth.currentUser, {
                displayName: name.trim(),
                photoURL: photoURL.trim() || null,
            });

            // Update Firestore + Redux
            await dispatch(
                updateUserProfile({
                    userId: currentUser.id,
                    displayName: name.trim(),
                    photoURL: photoURL.trim() || null,
                })
            ).unwrap();

            setEditing(false);
        } catch (err) {
            console.error("Profile update failed:", err);
            setError("Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`flex-shrink-0 flex flex-col gap-2 p-2 sm:p-3 border-t ${light
                ? "bg-neutral-100 border-gray-300 text-gray-900"
                : "bg-gray-900 border-gray-700 text-gray-100"
                } transition-all duration-300 max-w-full`}
        >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {editing ? (
                        <div className="flex flex-col gap-2 w-full">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`px-2 py-1 rounded border ${light
                                    ? "border-gray-300 bg-white text-gray-900"
                                    : "border-gray-600 bg-gray-700 text-gray-100"
                                    } text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                placeholder="Enter name"
                                required
                            />
                            <input
                                type="text"
                                value={photoURL}
                                onChange={(e) => setPhotoURL(e.target.value)}
                                className={`px-2 py-1 rounded border ${light
                                    ? "border-gray-300 bg-white text-gray-900"
                                    : "border-gray-600 bg-gray-700 text-gray-100"
                                    } text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                placeholder="Profile Image URL"
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={handleSave}
                                    className={`px-2 py-1 rounded text-sm ${light
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-blue-500 text-white hover:bg-blue-600"
                                        } transition-colors duration-200 flex-1 cursor-pointer`}
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save"}
                                </button>
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        setName(currentUser.displayName || "");
                                        setPhotoURL(currentUser.photoURL || "");
                                        setError("");
                                    }}
                                    className={`px-2 py-1 rounded text-sm ${light
                                        ? "bg-gray-400 text-white hover:bg-gray-500"
                                        : "bg-gray-600 text-white hover:bg-gray-500"
                                        } transition-colors duration-200 flex-1 cursor-pointer`}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                            {error && (
                                <span className="text-red-500 text-xs mt-1 w-full">
                                    {error}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <img
                                src={currentUser.photoURL || fallbackAvatar}
                                alt={currentUser.displayName || "You"}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                                onError={(e) => (e.currentTarget.src = fallbackAvatar)}
                            />
                            <span className="font-medium text-base sm:text-lg truncate">
                                {currentUser.displayName || "You"}
                            </span>
                            <button
                                onClick={() => setEditing(true)}
                                className={`p-2 rounded-full ${light
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : "bg-blue-400 text-white hover:bg-blue-500"
                                    } transition-colors duration-200 cursor-pointer`}
                                aria-label="Edit profile"
                            >
                                <PencilLine size={18} />
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={handleTheme}
                        className={`p-2 rounded-full ${light
                            ? "bg-white text-blue-600 hover:bg-gray-100"
                            : "bg-gray-700 text-blue-400 hover:bg-gray-600"
                            } transition-colors duration-200 cursor-pointer`}
                        aria-label="Toggle theme"
                    >
                        {light ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <button
                        onClick={async () => {
                            try {
                                await dispatch(logoutUser()).unwrap();
                                navigate("/signin");
                            } catch (err) {
                                console.error("Logout failed:", err);
                                navigate("/signin"); 
                            }
                        }}
                        className={`p-2 rounded-full ${light
                            ? "bg-white text-red-600 hover:bg-gray-100"
                            : "bg-gray-700 text-red-400 hover:bg-gray-600"
                            } transition-colors duration-200 cursor-pointer`}
                        aria-label="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}