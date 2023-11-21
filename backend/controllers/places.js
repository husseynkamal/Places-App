const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Place = require("../models/place");
const User = require("../models/user");

const getCoordsFromAddress = require("../util/location");
const deleteImage = require("../util/delete-image");

exports.getPlaces = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { userId } = req.params;

  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later.",
      500
    );
    return next(error);
  }

  let returnedPlaces;
  if (!places || places.length === 0) {
    returnedPlaces = [];
  } else {
    returnedPlaces = places.map((place) => {
      return { ...place._doc, id: place.id };
    });
  }

  res.status(200).json({ places: returnedPlaces });
};

exports.getPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { placeId } = req.params;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Could not find place for a provided id.", 404);
    return next(error);
  }

  res.status(200).json({ place: { ...place._doc, id: place.id } });
};

exports.createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsFromAddress(address);
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  let existingUser;
  try {
    existingUser = await User.findById(req.userId);
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  const createdPlace = new Place({
    title: title,
    description: description,
    image: req.file.path,
    address: address,
    location: coordinates,
    creator: req.userId,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await createdPlace.save({ session: sess });
    await User.updateOne(
      { _id: req.userId },
      { $push: { places: createdPlace._id } },
      { session: sess }
    );

    await sess.commitTransaction();
    await sess.endSession();
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ place: { ...createdPlace._doc, id: createdPlace.id } });
};

exports.updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { placeId } = req.params;
  const { title, description } = req.body;

  let existingPlace;
  try {
    existingPlace = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not update place.", 500)
    );
  }

  if (!existingPlace) {
    const error = new HttpError("Could not find place for this id.", 404);
    return next(error);
  }

  if (req.userId !== existingPlace.creator.toString()) {
    const error = new HttpError("You are not allowed to edit this place.", 401);
    return next(error);
  }

  existingPlace.title = title;
  existingPlace.description = description;

  try {
    await existingPlace.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }
  res
    .status(201)
    .json({ place: { ...existingPlace._doc, id: existingPlace.id } });
};

exports.deletePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { placeId } = req.params;

  let existingPlace;
  try {
    existingPlace = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  if (!existingPlace) {
    const error = new HttpError("Could not find place for this id.", 404);
    return next(error);
  }

  if (req.userId !== existingPlace.creator.toString()) {
    const error = new HttpError(
      "You are not allowed to delete this place.",
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await Place.deleteOne({ _id: placeId }, { session: sess });
    await User.updateOne(
      { _id: req.userId },
      { $pull: { places: placeId } },
      { session: sess }
    );

    await sess.commitTransaction();
    await sess.endSession();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  deleteImage(existingPlace.image);

  res.status(200).json({ message: "Place deleted." });
};
