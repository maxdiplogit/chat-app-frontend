// Hooks
import { createAsyncThunk } from "@reduxjs/toolkit";
import { io } from "socket.io-client";

// Utils
import axios from '../../../utils/axios';

// Actions
import { userActions } from "../userSlice";


type RegisterFormData = {
    firstName: string,
    lastName: string,
    email: string,
    password: string
};

type LoginFormData = {
    _id: string,
    firstName: string,
    lastName: string,
    email: string,
    friends: Array<any>,
    allUsers: Array<any>,
    accessToken: string,
};


export const RegisterUser = createAsyncThunk("auth/register", async (formData: RegisterFormData) => {
    const { firstName, lastName, email, password } = formData;
    
    const res = await axios.post("/auth/register", {
        firstName,
        lastName,
        email,
        password,
    });
    console.log(res);
});

export const LoginUser = createAsyncThunk("auth/login", async (formData: LoginFormData, { rejectWithValue, dispatch }) => {
    const { _id, firstName, lastName, email: responseEmail, friends: friendsList, allUsers: allUsersList, accessToken: userAccessToken } = formData;
    dispatch(userActions.changeUserState({
        _id,
        firstName,
        lastName,
        email: responseEmail,
        friends: friendsList,
        allUsers: allUsersList,
        accessToken: userAccessToken,
    }));
});

export const LogoutUser = createAsyncThunk("auth/logout", async (accessToken: string, { rejectWithValue, dispatch }) => {
    try {
        const res = await axios.post("/auth/logout", {}, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ accessToken }`
            }
        });
        dispatch(userActions.changeUserState({
            _id: "",
            firstName: "",
            lastName: "",
            email: "",
            friends: [],
            allUsers: [],
            accessToken: ""
        }));
        console.log(res);
    } catch (error) {
        console.log(error);
        dispatch(userActions.changeUserState({
            _id: "",
            firstName: "",
            lastName: "",
            email: "",
            friends: [],
            allUsers: [],
            accessToken: ""
        }));
    }
});