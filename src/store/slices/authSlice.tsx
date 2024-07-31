// Hooks
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Actions
import { RegisterUser, LoginUser, LogoutUser } from './actions/authActions';


interface initState {
    isLoading: boolean,
    error: boolean,
    isLoggedIn: boolean
};


// Initial State
const initialLoginState: initState = {
    isLoading: false,
    error: false,
    isLoggedIn: false
};

const authSlice = createSlice({
    name: "auth",
    initialState: initialLoginState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(RegisterUser.pending, (state, action) => {
                state.isLoading = true;
                state.error = false;
                state.isLoggedIn = false;
            })
            .addCase(RegisterUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = false;
                state.isLoggedIn = false;
            })
            .addCase(RegisterUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = true;
                state.isLoggedIn = false;
            })
            .addCase(LoginUser.pending, (state, action) => {
                state.isLoading = true;
                state.error = false;
                state.isLoggedIn = false;
            })
            .addCase(LoginUser.fulfilled, (state, action: any) => {
                state.isLoading = false;
                state.error = false;
                state.isLoggedIn = true;
                // if (action.payload.user) {
                //     state.isLoggedIn = true;
                // } else {
                //     state.isLoggedIn = false;
                // }
            })
            .addCase(LoginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = true;
                state.isLoggedIn = false;
            })
            .addCase(LogoutUser.pending, (state, action) => {
                state.isLoading = true;
                state.error = false;
            })
            .addCase(LogoutUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = false;
                state.isLoggedIn = false;
            })
            .addCase(LogoutUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = true;
            });
    }
});


export const authActions = authSlice.actions;

export default authSlice.reducer;