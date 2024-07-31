// Hooks
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Actions
// import { GetFriends } from './actions/userActions';

// Utils
import axios from '../../utils/axios';


interface initState {
    isLoading: boolean,
    error: boolean,
    _id: string | undefined,
    firstName: string | undefined,
    lastName: string | undefined,
    email: string,
    onlineStatus: string | undefined,
    friends: Array<any> | [],
    allUsers: Array<any> | [],
    accessToken: string,
};


const initialUserState: initState = {
    isLoading: false,
    error: false,
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
    onlineStatus: "none",
    friends: [],
    allUsers: [],
    accessToken: "",
};


const userSlice = createSlice({
    name: "user",
    initialState: initialUserState,
    reducers: {
        changeUserState(state, action) {
            const { _id, firstName, lastName, email, friends, allUsers, accessToken } = action.payload;
            state._id = _id;
            state.firstName = firstName;
            state.lastName = lastName;
            state.email = email;
            state.friends = friends;
            state.allUsers = allUsers;
            state.accessToken = accessToken;
        },
        changeFriendsList(state, action) {
            console.log(action.payload);
            state.friends = action.payload;
        },
        changeAllUsersList(state, action) {
            state.allUsers = action.payload;
        }
    }
});


export const userActions = userSlice.actions;

export default userSlice.reducer;