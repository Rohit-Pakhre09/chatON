import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

// Update user profile in Firestore
export const updateUserProfile = createAsyncThunk(
    "user/updateUserProfile",
    async ({ userId, displayName, photoURL }, { rejectWithValue }) => {
        try {
            const userDoc = doc(db, "users", userId);
            await updateDoc(userDoc, {
                displayName,
                photoURL,
            });
            return { userId, displayName, photoURL };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Fetch all users from Firestore
export const fetchUsers = createAsyncThunk("user/fetchUsers", async (_, { rejectWithValue }) => {
    try {
        const usersCol = collection(db, "users");
        const snapshot = await getDocs(usersCol);
        const now = Date.now();
        const users = snapshot.docs.map((doc) => {
            const data = doc.data();
            const lastSeenDate = data.lastSeen?.toDate ? data.lastSeen.toDate() : (data.lastSeen ? new Date(data.lastSeen) : null);
            let isOnline = false;
            if (lastSeenDate) {
                isOnline = (now - lastSeenDate.getTime()) < 2 * 60 * 1000;
            }
            return {
                id: doc.id,
                ...data,
                lastSeen: lastSeenDate ? lastSeenDate.toISOString() : null,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || null,
                isOnline,
            };
        });
        return users;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// Logout user
export const logoutUser = createAsyncThunk("user/logoutUser", async (_, { rejectWithValue }) => {
    try {
        // Optionally update user status before signing out
        if (auth.currentUser) {
            const userStatusDoc = doc(db, "userStatus", auth.currentUser.uid);
            await updateDoc(userStatusDoc, {
                online: false,
                lastSeen: new Date(),
            }).catch((error) => {
                console.warn("Failed to update user status:", error.message);
            });
        }
        await signOut(auth);
        return null;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

const userSlice = createSlice({
    name: "user",
    initialState: {
        users: [],
        status: "idle",
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                const { userId, displayName, photoURL } = action.payload;
                const user = state.users.find((u) => u.id === userId);
                if (user) {
                    user.displayName = displayName;
                    user.photoURL = photoURL;
                }
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.users = [];
                state.status = "idle";
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export default userSlice.reducer;