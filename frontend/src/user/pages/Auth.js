import React, { Fragment, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "../../shared/hooks/use-form";
import { useHttpClient } from "../../shared/hooks/use-http";

import { Input } from "../../shared/components/FormElements/Input";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";
import Modal from "../../shared/components/UIElements/Modal";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators.js";
import AuthContext from "../../shared/context/auth-context";

import "./Auth.css";

const Auth = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState("");
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: { value: "", isValid: false },
      password: { value: "", isValid: false },
    },
    false
  );

  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          image: undefined,
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: { value: "", isValid: false },
          image: { value: null, isValid: false },
        },
        false
      );
    }
    setIsLoginMode((prevMode) => !prevMode);
  };

  const switchResetModeHandler = () => {
    if (isResetMode) {
      setFormData(
        {
          ...formState.inputs,
          password: { value: "", isValid: false },
        },
        false
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          password: undefined,
        },
        formState.inputs.email.isValid
      );
    }
    setIsResetMode((prevMode) => !prevMode);
  };

  const closeModalHandler = () => setEmail("");

  const authSubmitHandler = async (event) => {
    event.preventDefault();

    if (isLoginMode && !isResetMode) {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/login`,
          "POST",
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
          { "Content-Type": "application/json" }
        );

        login(responseData.userId, responseData.token);
        navigate("/", { replace: true });
      } catch (err) {}
    } else if (!isLoginMode) {
      try {
        const formData = new FormData();
        formData.append("name", formState.inputs.name.value);
        formData.append("email", formState.inputs.email.value);
        formData.append("password", formState.inputs.password.value);
        formData.append("image", formState.inputs.image.value);
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/signup`,
          "POST",
          formData
        );

        login(responseData.userId, responseData.token);
        navigate("/", { replace: true });
      } catch (err) {}
    } else {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users/reset`,
          "PUT",
          JSON.stringify({ email: formState.inputs.email.value }),
          { "Content-Type": "application/json" }
        );

        setEmail(
          `We sent an email to ${responseData.email} with a link to reset your password.`
        );
      } catch (err) {}
    }
  };

  return (
    <Fragment>
      <Modal
        show={!!email}
        onCancel={closeModalHandler}
        header="Done"
        headerClass="authentication-item__header"
        footerClass="authentication-item__modal-actions"
        footer={<Button onClick={closeModalHandler}>CLOSE</Button>}>
        <p>{email}</p>
      </Modal>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        {!isResetMode && <h2>{isLoginMode ? "Login" : "Signup"} Required</h2>}
        {isResetMode && <h2>Reset Password</h2>}
        <hr />
        <form onSubmit={authSubmitHandler}>
          {!isLoginMode && (
            <Input
              element="input"
              id="name"
              label="Your Name"
              type="text"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a name."
              onInput={inputHandler}
              placeholder="Enter your name"
            />
          )}
          {!isLoginMode && (
            <ImageUpload center id="image" onInput={inputHandler} />
          )}
          <Input
            element="input"
            id="email"
            label="E-mail"
            type="email"
            validators={[VALIDATOR_EMAIL()]}
            errorText="Please enter a valid email address."
            placeholder="Enter your e-mail"
            onInput={inputHandler}
          />
          {!isResetMode && (
            <Input
              element="input"
              id="password"
              label="Password"
              type="password"
              validators={[VALIDATOR_MINLENGTH(6)]}
              errorText="Your password should be at least 6 charcters."
              placeholder="Enter your password"
              onInput={inputHandler}
            />
          )}
          <Button type="submit" disabled={!formState.isValid}>
            {isLoginMode && !isResetMode
              ? "LOGIN"
              : !isLoginMode
              ? "SIGNUP"
              : isResetMode
              ? "RESET"
              : ""}
          </Button>
          {isLoginMode && !isResetMode && (
            <div className="reset-password__container">
              <Button type="button" onClick={switchResetModeHandler}>
                Forgot Password?
              </Button>
            </div>
          )}
        </form>
        {!isResetMode && (
          <Button inverse onClick={switchModeHandler}>
            SWITCH TO {isLoginMode ? "SIGNUP" : "LOGIN"}
          </Button>
        )}
        {isResetMode && (
          <Button inverse onClick={switchResetModeHandler}>
            RETURN TO LOGIN
          </Button>
        )}
      </Card>
    </Fragment>
  );
};

export default Auth;
