const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const placeSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, minLength: 5 },
  image: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  creator: { type: Schema.ObjectId, required: true, ref: "User" },
});

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;
