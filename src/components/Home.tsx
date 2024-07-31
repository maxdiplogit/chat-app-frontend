// Hooks
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/reduxActions";
import { LogoutUser } from "../store/slices/actions/authActions";
import { useSocket } from "../store/SocketContext";

// Styles
import "./Home.css";


const Home = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { disconnectSocket } = useSocket();

    const isLoggedIn: boolean = useAppSelector((state) => state.auth.isLoggedIn);
    const accessToken: string = useAppSelector((state) => state.user.accessToken);
    const username: string = useAppSelector((state) => state.user.firstName) || "Anonymous";

    const handleLogout = (event: any) => {
        event.preventDefault();
        dispatch(LogoutUser(accessToken));
        disconnectSocket();
        navigate('/login');
    };



    return (
        <div className="home">
            <div className="home-heading">
                { isLoggedIn && <p>Welcome <span>{ username }</span></p> }
                { !isLoggedIn && `You need to Login` }
            </div>
            <div className="home-buttons">
                {!isLoggedIn && <button onClick={() => navigate('/login')}>Login</button> }
                {!isLoggedIn && <button onClick={() => navigate('/register')}>Register</button> }
                { isLoggedIn && <button onClick={() => navigate('/dashboard')}>Dashboard</button> }
                {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
            </div>
        </div>
    )
};


export default Home;