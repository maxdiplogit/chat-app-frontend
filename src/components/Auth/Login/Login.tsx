// Hooks
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxActions";
import { LoginUser } from "../../../store/slices/actions/authActions";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../../store/SocketContext";

// Utils
import axios from "../../../utils/axios";

// Styles
import "./Login.css"


const Login = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { socket, connectSocket, registerUserAsOnline } = useSocket();
    
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    
    const handleFormSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const res = await axios.post("/auth/login", {
            email,
            password
        });
        console.log(res.data);
        const { _id, firstName, lastName, email: responseEmail, friends: friendsList, allUsers: allUsersList, accessToken: userAccessToken } = res.data;
        dispatch(LoginUser({
            _id,
            firstName,
            lastName,
            email: responseEmail,
            friends: friendsList,
            allUsers: allUsersList,
            accessToken: userAccessToken,
        }));
        connectSocket(userAccessToken);
        navigate('/dashboard');
    };

    return (
        <div className="login-form">
            <form onSubmit={handleFormSubmit}>
                <input type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};


export default Login;