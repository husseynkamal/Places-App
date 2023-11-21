import React, { Fragment, useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { useHttpClient } from "../../shared/hooks/use-http";

import AuthContext from "../../shared/context/auth-context";
import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";
import Modal from "../../shared/components/UIElements/Modal";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import EarthMap from "../../shared/components/UIElements/EarthMap";

import "./PlaceItem.css";

const PlaceItem = (props) => {
  const {
    id,
    image,
    title,
    description,
    address,
    creator,
    coordinates,
    onDelete,
  } = props;

  const location = useLocation();
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { isLoggedIn, userId, token } = useContext(AuthContext);

  const openMapHandler = () => {
    setShowMap(true);
  };

  const closeMapHandler = () => {
    setShowMap(false);
  };

  const showDeleteWarnningHandler = () => {
    setShowConfirmModal(true);
  };

  const cancelDeleteWarnningHandler = () => {
    setShowConfirmModal(false);
  };

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/places/${id}`,
        "DELETE",
        null,
        {
          Authorization: "Bearer " + token,
        }
      );
      onDelete(id);
    } catch (err) {}
  };

  const isInUserPlaces = location.pathname.slice(26) === "places";

  return (
    <Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        header={address}
        smallFont={isInUserPlaces}
        contentClass="place-item__modal-content"
        headerClass="place-item__header"
        footerClass="place-item__modal-actions"
        footer={<Button onClick={closeMapHandler}>CLOSE</Button>}>
        <div className="map-container">
          <EarthMap location={coordinates} />
        </div>
      </Modal>
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteWarnningHandler}
        header="Are you sure?"
        headerClass="place-item__header"
        footerClass="place-item__modal-actions"
        footer={
          <Fragment>
            <Button inverse right onClick={cancelDeleteWarnningHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </Fragment>
        }>
        <p>
          Do you want to proceed and delete this place? Please note it can't be
          undone thereafter.
        </p>
      </Modal>
      <li className="place-item">
        <Card className="place-item__content">
          {isLoading && <LoadingSpinner asOverlay />}
          <div className="place-item__image">
            <img
              src={`${process.env.REACT_APP_ASSET_URL}/${image}`}
              alt={title}
            />
          </div>
          <div className="place-item__info">
            <h2>{title}</h2>
            <h3>{address}</h3>
            <p>{description}</p>
          </div>
          <div className="place-item__actions">
            <Button inverse onClick={openMapHandler}>
              VIEW ON MAP
            </Button>
            {isLoggedIn && creator === userId && (
              <Fragment>
                <Button to={`/places/${id}`}>EDIT</Button>
                <Button danger onClick={showDeleteWarnningHandler}>
                  DELETE
                </Button>
              </Fragment>
            )}
          </div>
        </Card>
      </li>
    </Fragment>
  );
};

export default PlaceItem;
