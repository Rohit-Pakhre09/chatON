import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    sendMessage,
    deleteMessage,
    setMessages,
    selectMessagesForChat,
    editMessage,
} from "../modules/chatSlice";
import { auth, db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Send, ArrowLeft, Smile, Pencil, Trash2 } from "lucide-react";
import fallbackAvatar from "../assets/avatar.png";

function makeChatId(uid1, uid2) {
    return [uid1, uid2].sort().join("_");
}

function ChatSection({ otherUser, onBack }) {
    const dispatch = useDispatch();
    const [input, setInput] = useState("");
    const chatId = makeChatId(auth.currentUser.uid, otherUser.id);
    const messages = useSelector((state) => selectMessagesForChat(state, chatId));
    const unsubscribeRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState(null);
    const [editText, setEditText] = useState("");
    const messagesEndRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Listen to messages
    useEffect(() => {
        if (!auth.currentUser) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("createdAt", "asc")
        );

        unsubscribeRef.current = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map((d) => {
                const data = d.data();
                return {
                    id: d.id,
                    ...data,
                    createdAt: data.createdAt?.toDate
                        ? data.createdAt.toDate().toISOString()
                        : data.createdAt || null,
                };
            });
            dispatch(setMessages({ chatId, messages: msgs }));
            setLoading(false);
        }, (error) => {
            console.error("Snapshot error:", error);
            setLoading(false);
        });

        return () => {
            unsubscribeRef.current && unsubscribeRef.current();
        };
    }, [chatId, dispatch]);

    // Send message
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !auth.currentUser) return;
        try {
            await dispatch(
                sendMessage({ chatId, text: input, otherUserId: otherUser.id })
            ).unwrap();
            setInput("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    // Delete message
    const handleDelete = async (id) => {
        try {
            await dispatch(deleteMessage({ chatId, messageId: id })).unwrap();
        } catch (error) {
            console.error("Failed to delete message:", error);
        }
    };

    // Edit message
    const handleEdit = (msg) => {
        setEditId(msg.id);
        setEditText(msg.text);
    };

    const handleEditSave = async () => {
        if (editId && editText.trim()) {
            try {
                await dispatch(editMessage({ chatId, messageId: editId, newText: editText })).unwrap();
                setEditId(null);
                setEditText("");
            } catch (error) {
                console.error("Failed to edit message:", error);
            }
        }
    };

    // Emoji picker logic
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiList = ["😀", "😂", "😍", "👍", "🙏", "🎉", "😎", "🥳", "😢", "🔥"];

    const handleEmojiClick = (emoji) => {
        setInput((prev) => prev + emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-300 dark:border-gray-700">
                {onBack && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="mr-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                        aria-label="Go back"
                    >
                        <ArrowLeft size={22} className="text-blue-500" />
                    </button>
                )}
                <img
                    src={otherUser.photoURL || fallbackAvatar}
                    className="w-10 h-10 rounded-full object-cover"
                    alt={otherUser.displayName || "User"}
                />
                <h2 className="font-semibold">
                    {otherUser.displayName || "User"}
                </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <span className="inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col items-end ${msg.senderId === auth.currentUser.uid ? "" : "items-start"}`}
                            >
                                <div
                                    className={`group max-w-[75%] px-4 py-2 rounded-lg text-sm shadow ${msg.senderId === auth.currentUser.uid
                                        ? "bg-blue-500 text-white rounded-br-none"
                                        : "bg-gray-200 text-black dark:bg-gray-700 dark:text-white rounded-bl-none"
                                        }`}
                                >
                                    {editId === msg.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                className="flex-1 px-2 py-1 rounded border border-gray-300 text-black"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleEditSave}
                                                className="px-2 py-1 bg-blue-800 text-white rounded cursor-pointer"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditId(null);
                                                    setEditText("");
                                                }}
                                                className="px-2 py-1 bg-red-500 text-white rounded cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <p>{msg.text}</p>
                                            <span className="block text-[10px] opacity-70 mt-1">
                                                {(() => {
                                                    const date = new Date(msg.createdAt);
                                                    return isNaN(date.getTime())
                                                        ? ""
                                                        : date.toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        });
                                                })()}
                                            </span>
                                        </>
                                    )}
                                </div>
                                {msg.senderId === auth.currentUser.uid && (
                                    <div className="flex gap-2 justify-end mt-1">
                                        <button
                                            onClick={() => handleEdit(msg)}
                                            className="p-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                                            title="Edit"
                                        >
                                            <Pencil size={18} className="text-gray-400 cursor-pointer" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(msg.id)}
                                            className="p-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} className="text-gray-400 cursor-pointer" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <form
                onSubmit={handleSend}
                className="flex items-center px-4 py-3 border-t border-gray-300 dark:border-gray-700"
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-200 text-gray-900 dark:text-neutral-900 transition-all duration-300"
                />
                <div className="relative">
                    <button
                        type="button"
                        className="ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-500"
                        title="Add emoji"
                        onClick={() => setShowEmojiPicker((v) => !v)}
                    >
                        <Smile size={20} className="cursor-pointer" />
                    </button>
                    {showEmojiPicker && (
                        <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg p-2 flex flex-wrap gap-2 z-10">
                            {emojiList.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    className="text-2xl p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                    onClick={() => handleEmojiClick(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    className="ml-2 p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300"
                >
                    <Send size={20} className="cursor-pointer" />
                </button>
            </form>
        </div>
    );
}

export default ChatSection;