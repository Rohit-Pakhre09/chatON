import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { db, auth } from "../firebase";
import { collection, doc, setDoc, deleteDoc, updateDoc, query, orderBy, getDocs, serverTimestamp } from "firebase/firestore";

// Send a message
export const sendMessage = createAsyncThunk(
    "chat/sendMessage",
    async ({ chatId, text, otherUserId }, { rejectWithValue }) => {
        try {
            const msgRef = doc(collection(db, "chats", chatId, "messages"));
            const messageId = msgRef.id; // Use Firestore-generated ID
            const message = {
                text,
                senderId: auth.currentUser.uid,
                createdAt: serverTimestamp(),
            };
            await setDoc(msgRef, message);

            const chatRef = doc(db, "chats", chatId);
            await setDoc(
                chatRef,
                {
                    participants: [auth.currentUser.uid, otherUserId],
                    lastMessage: text,
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            return { chatId, messageId, message };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Delete a message
export const deleteMessage = createAsyncThunk(
    "chat/deleteMessage",
    async ({ chatId, messageId }, { rejectWithValue }) => {
        try {
            const msgRef = doc(db, "chats", chatId, "messages", messageId);
            await deleteDoc(msgRef);
            return { chatId, messageId };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Edit a message
export const editMessage = createAsyncThunk(
    "chat/editMessage",
    async ({ chatId, messageId, newText }, { rejectWithValue }) => {
        try {
            const msgRef = doc(db, "chats", chatId, "messages", messageId);
            await setDoc(msgRef, { text: newText, edited: true }, { merge: true });
            return { chatId, messageId, newText };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        messages: {}, // { chatId: [messages] }
        status: "idle",
        error: null,
    },
    reducers: {
        setMessages: (state, action) => {
            const { chatId, messages } = action.payload;
            // Serialize createdAt if it's a Firestore Timestamp
            state.messages[chatId] = messages.map(msg => ({
                ...msg,
                createdAt: msg.createdAt?.toDate ? msg.createdAt.toDate().toISOString() : msg.createdAt || null,
            }));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendMessage.pending, (state) => {
                state.status = "loading";
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.status = "succeeded";
                // Do not add message here; onSnapshot will handle it
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(deleteMessage.fulfilled, (state, action) => {
                const { chatId, messageId } = action.payload;
                if (state.messages[chatId]) {
                    state.messages[chatId] = state.messages[chatId].filter((m) => m.id !== messageId);
                }
            })
            .addCase(deleteMessage.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(editMessage.fulfilled, (state, action) => {
                const { chatId, messageId, newText } = action.payload;
                if (state.messages[chatId]) {
                    state.messages[chatId] = state.messages[chatId].map((m) =>
                        m.id === messageId ? { ...m, text: newText, edited: true } : m
                    );
                }
            })
            .addCase(editMessage.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { setMessages } = chatSlice.actions;

// Memoized selector for messages per chat
export const selectMessagesForChat = createSelector(
    [(state) => state.chat.messages, (_, chatId) => chatId],
    (messages, chatId) => messages[chatId] || []
);

export default chatSlice.reducer;