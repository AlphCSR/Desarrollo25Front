
import ReactDOM from 'react-dom/client'
import { AuthProvider } from "react-oidc-context";
import { keycloakConfig } from './auth/AuthConfig';
import App from './App'
import './index.css'

const onSigninCallback = () => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider {...keycloakConfig} onSigninCallback={onSigninCallback}>
    <App />
  </AuthProvider>,
)