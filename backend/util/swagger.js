const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "YourPlaces API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        Authorization: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          value: "Bearer <JWT token here>",
        },
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  explorer: true,
  apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);

module.exports = {
  options,
  specs,
};
