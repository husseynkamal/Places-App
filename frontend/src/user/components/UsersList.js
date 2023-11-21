import React from "react";

import UserItem from "./UserItem";
import Card from "../../shared/components/UIElements/Card";
import "./UsersList.css";

const UsersList = ({ users }) => {
  let insertedUsers;
  if (users.length === 0) {
    insertedUsers = (
      <div className="center">
        <Card>
          <h2>No users found.</h2>
        </Card>
      </div>
    );
  } else {
    insertedUsers = users.map((user) => (
      <UserItem
        key={user.id}
        id={user.id}
        image={user.image}
        name={user.name}
        placeCount={user.numberOfPlaces}
      />
    ));
  }

  return <ul className="users-list">{insertedUsers}</ul>;
};

export default UsersList;
