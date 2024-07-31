// Hooks
import { createAsyncThunk } from "@reduxjs/toolkit";

// Actions
import { userActions } from "../userSlice";
import { LogoutUser } from "./authActions";

// Utils
import axios from '../../../utils/axios';


interface customData {
    accessToken: string,
    receiverUserId: string
}


export const AddFriend = createAsyncThunk("user/add-friend", async (data: customData, { rejectWithValue, dispatch }) => {
    const { accessToken, receiverUserId } = data;
    try {
        const res = await axios.post("/user/addFriend", {
            receiverUserId
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ accessToken }`
            }
        });
        console.log(res.data);
        const { friends } = res.data;
        dispatch(userActions.changeFriendsList(friends));
    } catch (error: any) {
        if (error.response.status === 403 || error.response.status === 401) {
            dispatch(LogoutUser(accessToken));
        }
    }
});

export const DeleteFriend = createAsyncThunk("user/delete-friend", async (data: customData, { rejectWithValue, dispatch }) => {
    const { accessToken, receiverUserId } = data;
    try {
        const res = await axios.post("/user/deleteFriend", {
            receiverUserId
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ accessToken }`
            }
        });
        console.log(res.data);
        const { friends } = res.data;
        dispatch(userActions.changeFriendsList(friends));
    } catch (error: any) {
        if (error.response.status === 403 || error.response.status === 401) {
            dispatch(LogoutUser(accessToken));
        }
    }
});

export const GetFriendsList = createAsyncThunk("user/get-friends-list", async (accessToken: string, { rejectWithValue, dispatch }) => {
    try {
        const res = await axios.get("/user/getFriends", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ accessToken }`
            }
        });
        console.log(res.data);
        let { friends, usersList } = res.data;
        dispatch(userActions.changeFriendsList(friends));
        dispatch(userActions.changeAllUsersList(usersList));
    } catch (error: any) {
        if (error.response.status === 403 || error.response.status === 401) {
            dispatch(LogoutUser(accessToken));
        }
    }
});

export const GetUsersList = createAsyncThunk("user/get-users-list", async (accessToken: string, { rejectWithValue, dispatch }) => {
    try {
        const res = await axios.get("/user/getUsersList", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ accessToken }`
            }
        });
        console.log(res.data);
        const { friends, usersList } = res.data;
        dispatch(userActions.changeFriendsList(friends));
        dispatch(userActions.changeAllUsersList(usersList));
    } catch (error: any) {
        if (error.response.status === 403 || error.response.status === 401) {
            dispatch(LogoutUser(accessToken));
        }
    }
});