import React, { Fragment, useContext } from "react";
import { useParams } from "react-router-dom";

import AuthContext from "../../shared/context/auth-context";
import Card from "../../shared/components/UIElements/Card";
import PlaceItem from "./PlaceItem";
import Button from "../../shared/components/FormElements/Button";
import { BiMessageAltError } from "react-icons/bi";
import "./PlaceList.css";

const PlaceList = (props) => {
  const userParamId = useParams().userId;
  const { userId } = useContext(AuthContext);

  const itemsHasLength = props.items.length >= 1;

  let insertedWarning;
  if (userParamId === userId) {
    insertedWarning = (
      <div className="place-list center">
        <Card>
          <h2>No places found. Maybe create one?</h2>
          <Button to="/places/new">Share Place</Button>
        </Card>
      </div>
    );
  } else {
    insertedWarning = (
      <div className="center place-list__warning">
        <BiMessageAltError />
        <h2>User has no places to share.</h2>
      </div>
    );
  }

  const insertedItems = props.items.map((item) => (
    <PlaceItem
      key={item.id}
      id={item.id}
      image={item.image}
      title={item.title}
      description={item.description}
      address={item.address}
      creator={item.creator}
      coordinates={item.location}
      onDelete={props.onDeletePlace}
    />
  ));

  return (
    <Fragment>
      {!itemsHasLength && insertedWarning}
      {itemsHasLength && <ul className="place-list">{insertedItems}</ul>};
    </Fragment>
  );
};

export default PlaceList;
