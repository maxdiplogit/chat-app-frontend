// Hooks
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/index';

// Styles
import './index.css';
import { SocketProvider } from './store/SocketContext';


const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);


root.render(
	<>
		<BrowserRouter>
			<SocketProvider>
				<ReduxProvider store={ store }>
					<PersistGate loading={ null } persistor={ persistor }>
						<App />
					</PersistGate>
				</ReduxProvider>
			</SocketProvider>
		</BrowserRouter>
	</>
);
