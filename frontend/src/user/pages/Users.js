import React, { Fragment, useEffect, useState } from "react";
import { useHttpClient } from "../../shared/hooks/use-http";

import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import UsersList from "../components/UsersList";

const Users = () => {
  const [users, setUsers] = useState();
  const { error, isLoading, sendRequest, clearError } = useHttpClient();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users`
        );
        setUsers(responseData.users);
      } catch (err) {}
    };

    fetchUsers();
  }, [sendRequest]);

  return (
    <Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner asOverlay />
        </div>
      )}
      {!isLoading && users && <UsersList users={users} />}
    </Fragment>
  );
};

export default Users;
