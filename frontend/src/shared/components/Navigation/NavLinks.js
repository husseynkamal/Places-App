import React, { useContext } from "react";
import { NavLink } from "react-router-dom";

import AuthContext from "../../context/auth-context";
import "./NavLinks.css";

const NavLinks = ({ onClose }) => {
  const { isLoggedIn, logout, userId } = useContext(AuthContext);

  return (
    <ul className="nav-links">
      <li onClick={onClose}>
        <NavLink to="/">ALL USERS</NavLink>
      </li>
      {isLoggedIn && (
        <li onClick={onClose}>
          <NavLink to={`/${userId}/places`}>MY PLACES</NavLink>
        </li>
      )}
      {isLoggedIn && (
        <li onClick={onClose}>
          <NavLink to="/places/new">ADD PLACE</NavLink>
        </li>
      )}
      {!isLoggedIn && (
        <li onClick={onClose}>
          <NavLink to="/auth">AUTHENTICATE</NavLink>
        </li>
      )}
      {isLoggedIn && (
        <li onClick={onClose}>
          <button onClick={logout}>LOGOUT</button>
        </li>
      )}
    </ul>
  );
};

export default NavLinks;
