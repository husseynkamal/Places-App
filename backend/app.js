const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
require("dotenv").config();

const app = express();

const placesRoutes = require("./routes/places");
const usersRoutes = require("./routes/users");

const HttpError = require("./models/http-error");
const errorHandler = require("./middlewares/error-handler");

const { specs, options } = require("./util/swagger");

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requseted-With, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );

  next();
});

app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, options));
app.use("/api/users", usersRoutes);
app.use("/api/places", placesRoutes);

app.use((req, res, next) => {
  throw new HttpError("Could not find this route.", 404);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@yourplaces.mbukb5k.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => app.listen(PORT, () => console.log("RUNNING!")))
  .catch((err) => console.log(err));

