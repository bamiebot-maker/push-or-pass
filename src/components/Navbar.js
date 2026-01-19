import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return "active";
    if (path !== "/" && location.pathname.startsWith(path)) return "active";
    return "";
  };
  
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">Push or Pass</span>
        </Link>
        
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive("/")}`}>
            Home
          </Link>
          <Link to="/play" className={`nav-link ${isActive("/play")}`}>
            Play
          </Link>
          <Link to="/vote" className={`nav-link ${isActive("/vote")}`}>
            Vote
          </Link>
          <Link to="/leaderboard" className={`nav-link ${isActive("/leaderboard")}`}>
            Leaderboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
