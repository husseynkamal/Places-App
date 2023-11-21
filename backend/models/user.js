const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minLength: 6, trim: true },
  resetToken: String,
  resetTokenExpiration: Date,
  image: { type: String, required: true },
  places: [{ type: Schema.ObjectId, required: true, ref: "Place" }],
});

userSchema.plugin(uniqueValidator);

const User = mongoose.model("User", userSchema);

module.exports = User;
