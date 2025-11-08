import { BrowserRouter as Router, Link } from 'react-router-dom';
import AppRoutes from './routes/appRoutes.jsx';
import './App.css';
import { UserProvider } from './context/userContext.jsx';

function App() {
  return (
    <UserProvider>
      <Router>
        <nav className='nav'>
          <Link to="/">Accueil</Link>
          <Link to="/register">Inscription</Link>
          <Link to="/login">Connexion</Link>
          <Link to="/profile">Profil</Link>
        </nav>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}

export default App;
