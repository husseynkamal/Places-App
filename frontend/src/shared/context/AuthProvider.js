import React, { useCallback, useState } from "react";

import AuthContext from "./auth-context";

const AuthProvider = (props) => {
  const [token, setToken] = useState(null);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [userId, setUserId] = useState(null);

  const login = useCallback((uid, token, expirationDate) => {
    setToken(token);
    setUserId(uid);
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationDate(tokenExpirationDate);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        token: token,
        expiration: tokenExpirationDate.toISOString(),
      })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setTokenExpirationDate(null);
    localStorage.clear("userData");
  }, []);

  const authContext = {
    isLoggedIn: !!token,
    token,
    userId,
    tokenExpirationDate,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
