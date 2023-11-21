import React, { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useScreen } from "../../hooks/use-screen";

import MainHeader from "./MainHeader";
import NavLinks from "./NavLinks";
import SideDrawer from "./SideDrawer";
import Backdrop from "../UIElements/Backdrop";
import Logo from "../../assets/Logo.png";
import "./MainNavigation.css";

const MainNavigation = () => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const { screen } = useScreen();

  const openDrawerHandler = () => {
    document.body.style.overflow = "hidden";
    setDrawerIsOpen(true);
  };

  const closeDrawerHandler = () => {
    document.body.style.overflow = "initial";
    setDrawerIsOpen(false);
  };

  useEffect(() => {
    if (screen >= 768 && drawerIsOpen) {
      document.body.style.overflow = "initial";
      setDrawerIsOpen(false);
    }
  }, [screen, drawerIsOpen]);

  return (
    <Fragment>
      {drawerIsOpen && <Backdrop onClick={closeDrawerHandler} />}
      <SideDrawer show={drawerIsOpen}>
        <nav className="main-navigation__drawer-nav">
          <NavLinks onClose={closeDrawerHandler} />
        </nav>
      </SideDrawer>
      <MainHeader>
        <button
          className="main-navigation__menu-btn"
          onClick={openDrawerHandler}>
          <span />
          <span />
          <span />
        </button>
        <h1 className="main-navigation__title">
          <Link to="/">
            <img src={Logo} alt="YourPlaces Logo" />
          </Link>
        </h1>
        <nav className="main-navigation__header-nav">
          <NavLinks />
        </nav>
      </MainHeader>
    </Fragment>
  );
};

export default MainNavigation;
