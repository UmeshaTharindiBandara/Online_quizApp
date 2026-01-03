import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User, BookOpen } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/dashboard" className="navbar-brand">
            <BookOpen size={32} color="var(--accent-color)" />
            QuizMaster
          </Link>

          <div className="navbar-nav">
            <div className="navbar-user" style={{ gap: "25px" }}>
              <Link to="/dashboard" className="navbar-text">
                Dashboard
              </Link>
              <Link to="/quizzes" className="navbar-text">
                Quizzes
              </Link>
              
              <span><User size={20} /> Hi {user.name}</span>
              <span className="badge">
                {user.role === "admin" ? "Admin" : "Student"}
              </span>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
