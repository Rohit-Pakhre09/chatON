import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "../modules/chatSlice";
import userReducer from "../modules/userSlice";

export const store = configureStore({
    reducer: {
        chat: chatReducer,
        user: userReducer,
    },
});
