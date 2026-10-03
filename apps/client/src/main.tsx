import { disableReactDevTools } from '@fvilers/disable-react-devtools';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import './styles.css';

// disable react dev tools
if (process.env.NODE_ENV === 'production') disableReactDevTools();

// Render the app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
}
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals()

// register sw
// registerSW()
