// Hooks
import { useState } from "react";
import { useAppDispatch } from "../../../hooks/reduxActions";
import { useNavigate } from "react-router-dom";

// Actions
import { RegisterUser } from "../../../store/slices/actions/authActions";

// Styles
import "./Register.css"


const Register = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [ firstName, setFirstName ] = useState("");
    const [ lastName, setLastName ] = useState("");
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");

    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        dispatch(RegisterUser({
            firstName,
            lastName,
            email,
            password
        }));
        navigate('/');
    };

    return (
        <div className="register-form">
            <form onSubmit={handleFormSubmit}>
                <input type="text" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} />
                <input type="text" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} />
                <input type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};


export default Register;