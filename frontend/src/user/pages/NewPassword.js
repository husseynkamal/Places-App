import React, { Fragment, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useHttpClient } from "../../shared/hooks/use-http";
import { useForm } from "../../shared/hooks/use-form";

import { Input } from "../../shared/components/FormElements/Input";
import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import { VALIDATOR_MINLENGTH } from "../../shared/util/validators.js";

import "./Auth.css";

let HTTP_METHOD = "GET";

const NewPassword = () => {
  const navigate = useNavigate();
  const { passwordToken } = useParams();
  const [userId, setUserId] = useState("");
  const { error, isLoading, sendRequest, clearError } = useHttpClient();
  const [formState, inputHandler] = useForm(
    { password: { value: "", isValid: false } },
    false
  );

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/reset/${passwordToken}`
        );

        setUserId(responseData.userId);
      } catch (err) {}
    };

    fetchUserId();
  }, [sendRequest, passwordToken]);

  const submitHandler = async (event) => {
    event.preventDefault();

    try {
      HTTP_METHOD = "PATCH";
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/users/password/new`,
        HTTP_METHOD,
        JSON.stringify({
          userId: userId,
          newPassword: formState.inputs.password.value,
          passwordToken: passwordToken,
        }),
        { "Content-Type": "application/json" }
      );

      HTTP_METHOD = "GET";
      navigate("/auth", { replace: true });
    } catch (err) {}
  };

  const isHttpGetError = error && HTTP_METHOD === "GET";
  const isHttpPatchError = error && HTTP_METHOD === "PATCH" ? error : null;

  return (
    <Fragment>
      <ErrorModal error={isHttpPatchError} onClear={clearError} />
      <Card className="authentication">
        {isHttpGetError && (
          <Fragment>
            <h2>Sorry, this page isn't available.</h2>
            <p>
              The link you followed may be broken, or the page may have been
              removed. Go back to <Link to="/auth">login.</Link>
            </p>
          </Fragment>
        )}
        {isLoading && (
          <div className="center">
            <LoadingSpinner asOverlay />
          </div>
        )}
        {!error && (
          <Fragment>
            <h2>Reset Password</h2>
            <hr />
            <form onSubmit={submitHandler}>
              <Input
                element="input"
                id="password"
                label="Password"
                type="password"
                validators={[VALIDATOR_MINLENGTH(6)]}
                errorText="Your password should be at least 6 charcters."
                placeholder="Enter your new password"
                onInput={inputHandler}
              />
              <Button type="submit" disabled={!formState.isValid}>
                RESET PASSWORD
              </Button>
            </form>
          </Fragment>
        )}
      </Card>
    </Fragment>
  );
};

export default NewPassword;
