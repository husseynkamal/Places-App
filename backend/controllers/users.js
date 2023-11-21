const { validationResult } = require("express-validator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const generateToken = require("../util/generate-token");
const sendMail = require("../util/send-mail");

exports.getUsers = async (req, res, next) => {
  const pipeLines = [
    { $match: {} },
    { $addFields: { id: "$_id", numberOfPlaces: { $size: "$places" } } },
    { $project: { _id: 0 } },
  ];

  let users;
  try {
    users = await User.aggregate(pipeLines);
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(200).json({ users: users });
};

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signnig up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead.",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Signnig up failed, please try again later.",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name: name,
    email: email,
    password: hashedPassword,
    image: req.file.path,
  });
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signnig up failed, please try again.", 500);
    return next(error);
  }

  let token;
  try {
    token = generateToken(createdUser);
  } catch (err) {
    const error = new HttpError("Signnig up failed, please try again.", 500);
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token });
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Logging failed, please try again.", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let passwordIsValid = false;
  try {
    passwordIsValid = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );
    return next(error);
  }

  if (!passwordIsValid) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  const { resetToken, resetTokenExpiration } = existingUser;
  if (resetToken && resetTokenExpiration) {
    existingUser.resetToken = undefined;
    existingUser.resetTokenExpiration = undefined;

    try {
      await existingUser.save();
    } catch (err) {
      const error = new HttpError(
        "Could not log you in, please check your credentials and try again.",
        500
      );
      return next(error);
    }
  }

  let token;
  try {
    token = generateToken(existingUser);
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again.", 500);
    return next(error);
  }

  res
    .status(200)
    .json({ userId: existingUser.id, email: existingUser.email, token });
};

exports.restPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { email } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Something went wrong, please try again.", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Could not find user for provided email.", 404);
    return next(error);
  }

  let buffer;
  try {
    buffer = crypto.randomBytes(32);
  } catch (err) {
    const error = new HttpError("Something went wrong, please try again.", 500);
    return next(error);
  }
  const token = buffer.toString("hex");

  existingUser.resetToken = token;
  existingUser.resetTokenExpiration = Date.now() + 3600000;

  try {
    await existingUser.save();
  } catch (err) {
    const error = new HttpError("Something went wrong, please try again.", 500);
    return next(error);
  }

  try {
    await sendMail(existingUser.email, existingUser.name, token);
  } catch (err) {
    const error = new HttpError("Something went wrong, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ email: existingUser.email, passwordToken: token });
};

exports.getNewPassword = async (req, res, next) => {
  const { passwordToken } = req.params;

  let existingUser;
  try {
    existingUser = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
    });
  } catch (err) {
    const error = new HttpError("Something went wrong, please try again.", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not reset your password.",
      403
    );
    return next(error);
  }

  res.status(200).json({ userId: existingUser.id });
};

exports.setNewPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { userId, newPassword, passwordToken } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({
      _id: userId,
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
    });
  } catch (err) {
    const error = new HttpError(
      "Reset password failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not reset your password.",
      403
    );
    return next(error);
  }

  let passwordIsNew = false;
  try {
    passwordIsNew = await bcrypt.compare(newPassword, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );
    return next(error);
  }

  if (passwordIsNew) {
    const error = new HttpError(
      "You choose the same password, please pick another one.",
      403
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(newPassword, 12);
  } catch (err) {
    const error = new HttpError(
      "Reset password failed, please try again later.",
      500
    );
    return next(error);
  }

  existingUser.password = hashedPassword;
  existingUser.resetToken = undefined;
  existingUser.resetTokenExpiration = undefined;

  try {
    await existingUser.save();
  } catch (err) {
    const error = new HttpError(
      "Reset password failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(201).json({ message: "Password updated." });
};
