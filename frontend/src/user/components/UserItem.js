import React from "react";
import { Link } from "react-router-dom";

import Avatar from "../../shared/components/UIElements/Avatar";
import Card from "../../shared/components/UIElements/Card";
import "./UserItem.css";

const UserItem = ({ id, image, name, placeCount }) => {
  const isSinglePlace = placeCount === 1 ? "Place" : "Places";

  return (
    <li className="user-item">
      <Card className="user-item__content">
        <Link to={`/${id}/places`}>
          <div className="user-item__image">
            <Avatar
              image={`${process.env.REACT_APP_ASSET_URL}/${image}`}
              alt={name}
            />
          </div>
          <div className="user-item__info">
            <h2>{name}</h2>
            <h3>
              {placeCount} {isSinglePlace}
            </h3>
          </div>
        </Link>
      </Card>
    </li>
  );
};

export default UserItem;
