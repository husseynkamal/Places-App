import React, { Fragment, Suspense, useContext, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AuthContext from "./shared/context/auth-context";
import MainNavigation from "./shared/components/Navigation/MainNavigation";
import LoadingSpinner from "./shared/components/UIElements/LoadingSpinner";

const Users = React.lazy(() => import("./user/pages/Users"));
const NewPlace = React.lazy(() => import("./places/pages/NewPlace"));
const UserPlaces = React.lazy(() => import("./places/pages/UserPlaces"));
const UpdatePlace = React.lazy(() => import("./places/pages/UpdatePlace"));
const Auth = React.lazy(() => import("./user/pages/Auth"));
const NewPassword = React.lazy(() => import("./user/pages/NewPassword"));

let logoutTimer;

const App = () => {
  const { token, tokenExpirationDate, login, logout } = useContext(AuthContext);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (storedData?.token && new Date(storedData.expiration) > new Date()) {
      login(
        storedData.userId,
        storedData.token,
        new Date(storedData.expiration)
      );
    } else {
      logout();
    }
  }, [login, logout]);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const reminingTime = tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, reminingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  let routes;
  if (token) {
    routes = (
      <Fragment>
        <Route path="/" element={<Users />} />
        <Route path="/:userId/places" element={<UserPlaces />} />
        <Route path="/places/new" element={<NewPlace />} />
        <Route path="/places/:placeId" element={<UpdatePlace />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Fragment>
    );
  } else {
    routes = (
      <Fragment>
        <Route path="/" element={<Users />} />
        <Route path="/:userId/places" element={<UserPlaces />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/password/new/:passwordToken" element={<NewPassword />} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <MainNavigation />
      <main>
        <Suspense
          fallback={
            <div className="center">
              <LoadingSpinner />
            </div>
          }>
          <Routes>{routes}</Routes>
        </Suspense>
      </main>
    </Fragment>
  );
};

export default App;
