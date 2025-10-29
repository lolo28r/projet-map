import { BrowserRouter as Router, Link } from 'react-router-dom';
import AppRoutes from './routes/appRoutes.jsx';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/login">Connexion</Link>
        <Link to="/register">Inscription</Link>
        <Link to="/logout">Deconnexion</Link>
        <Link to="/profile">Profil</Link>
      </nav>
      <AppRoutes />
    </Router>
  );
}

export default App;
