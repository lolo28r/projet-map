import { BrowserRouter as Router, Link, useNavigate } from "react-router-dom";
import AppRoutes from "./routes/appRoutes.jsx";
import "./App.css";
import { UserProvider, UserContext } from "./context/userContext.jsx";
import { useContext } from "react";

function Navbar() {
  const { token, setToken, setUserId } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setToken(null);
    setUserId(null);
    navigate("/login");
  };

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/">Accueil</Link>
        <Link to="/ranking">Classement</Link>

      </div>

      <div className="nav-right">
        {!token ? (
          <>
            <Link to="/register">Inscription</Link>
            <Link to="/login">Connexion</Link>
          </>
        ) : (
          <>
            <Link to="/profile">Mon compte</Link>

            <button className="logout-btn" onClick={handleLogout}>
              Déconnexion
            </button>
          </>
        )}
      </div>
    </nav>

  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}

export default App;
