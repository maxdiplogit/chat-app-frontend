// Hooks
import { useAppSelector } from './hooks/reduxActions';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Auth/Register/Register';
import Login from './components/Auth/Login/Login';
import Home from './components/Home';
import ChatDashboard from './components/ChatDashboard/ChatDashboard';

// Styles
import './App.css';


const App = () => {
	const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
	console.log(isLoggedIn);
	return (
		<div className="app">
			<Routes>
				<Route path='/' element={ <Home /> } />
				<Route path='/login' element={ isLoggedIn ? <Navigate to={'/dashboard'} /> : <Login /> } />
				<Route path='/register' element={ isLoggedIn ? <Navigate to={'/dashboard'} /> : <Register /> } />
				<Route path='/dashboard' element= { isLoggedIn ? <ChatDashboard /> : <Navigate to={'/login'} /> } />
			</Routes>
		</div>
	);
};


export default App;
