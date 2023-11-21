import React from "react";

import Modal from "./Modal";
import Button from "../FormElements/Button";

import "./ErrorModel.css";

const ErrorModal = (props) => {
  return (
    <Modal
      onCancel={props.onClear}
      header="An Error Occurred!"
      headerClass="error-model__header"
      show={!!props.error}
      footer={<Button onClick={props.onClear}>Okay</Button>}>
      <p>{props.error}</p>
    </Modal>
  );
};

export default ErrorModal;
