import React, { Fragment, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "../../shared/hooks/use-form";
import { useHttpClient } from "../../shared/hooks/use-http";

import AuthContext from "../../shared/context/auth-context";
import { Input } from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators.js";
import "./PlaceForm.css";

const UpdatePlace = () => {
  const placeId = useParams().placeId;
  const [loadedPlace, setLoadedPlace] = useState();
  const { error, isLoading, sendRequest, clearError } = useHttpClient();
  const { userId, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: { value: "", isValid: false },
      description: { value: "", isValid: false },
    },
    false
  );

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`
        );

        setLoadedPlace(responseData.place);
        setFormData(
          {
            title: { value: responseData.title, isValid: true },
            description: { value: responseData.description, isValid: true },
          },
          true
        );
      } catch (err) {}
    };

    fetchPlace();
  }, [placeId, sendRequest, setFormData]);

  const placeUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`,
        "PATCH",
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        }),
        { "Content-Type": "application/json", Authorization: "Bearer " + token }
      );
      navigate(`/${userId}/places`);
    } catch (err) {}
  };

  if (!loadedPlace && error) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find place!</h2>
        </Card>
      </div>
    );
  }

  return (
    <Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlace && (
        <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
          <Input
            id="title"
            label="Title"
            element="input"
            type="text"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid title."
            onInput={inputHandler}
            initialValue={loadedPlace.title}
            initialValid={true}
          />
          <Input
            id="description"
            label="Description"
            element="textarea"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid description (at least 5 characters)."
            onInput={inputHandler}
            initialValue={loadedPlace.description}
            initialValid={true}
          />
          <Button type="submit" disabled={!formState.isValid}>
            UPDATE PLACE
          </Button>
        </form>
      )}
    </Fragment>
  );
};

export default UpdatePlace;
