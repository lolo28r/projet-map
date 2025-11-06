import { BrowserRouter as Router, Link } from 'react-router-dom';
import AppRoutes from './routes/appRoutes.jsx';
import './App.css';


function App() {
  return (
    <Router>
      <nav className='nav'>
        <Link to="/">Accueil</Link>
        <Link to="/register">Inscription</Link>
        <Link to="/login">Connexion</Link>
        <Link to="/profile">Profil</Link>
      </nav>
      <AppRoutes />
    </Router>
  );
}

export default App;
