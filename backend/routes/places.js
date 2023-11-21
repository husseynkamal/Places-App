const { Router } = require("express");
const { body, param } = require("express-validator");

const router = Router();

const placesController = require("../controllers/places");
const fileUpload = require("../middlewares/file-upload");
const checkAuth = require("../middlewares/check-auth");

/**
 * @swagger
 * components:
 *  schemas:
 *   Place:
 *    type: object
 *    required:
 *     - title
 *     - description
 *     - image
 *     - address
 *     - location
 *     - creator
 *    properties:
 *     _id:
 *      type: string
 *      description: Originally it's an auto-generated objectId.
 *     id:
 *      type: string
 *      description: stringed _id.
 *     title:
 *      type: string
 *      description: Place's title.
 *     description:
 *      type: string
 *      description: Place's description.
 *     image:
 *      type: string
 *      description: Place's image.
 *     address:
 *      type: string
 *      description: Place's address.
 *     location:
 *      type: object
 *      description: Place's location.
 *      properties:
 *       lat:
 *        type: number
 *       lng:
 *        type: number
 *     creator:
 *      type: string
 *      description: Originally it's an ObjectId refer to the creator of the place.
 */

/**
 * @swagger
 * tags:
 *  name: Place
 *  description: Place managing API
 */

/**
 * @swagger
 * /api/places/user/{userId}:
 *  get:
 *   summary: Get user's places
 *   tags: [Place]
 *   parameters:
 *    - in: path
 *      name: userId
 *      schema:
 *       type: string
 *      required: true
 *      description: The user id
 *   responses:
 *    200:
 *     description: OK.
 *    500:
 *     description: Server error.
 */

router.get(
  "/user/:userId",
  param("userId").isMongoId(),
  placesController.getPlaces
);

/**
 * @swagger
 * /api/places/{placeId}:
 *  get:
 *   summary: Get place
 *   tags: [Place]
 *   parameters:
 *    - in: path
 *      name: placeId
 *      schema:
 *       type: string
 *      required: true
 *      description: The place id
 *   responses:
 *    200:
 *     description: OK.
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Place'
 *    404:
 *     description: Not found this place.
 *    500:
 *     description: Server error.
 */

router.get(
  "/:placeId",
  param("placeId").isMongoId(),
  placesController.getPlace
);

/**
 * @swagger
 * /api/places:
 *  post:
 *   summary: Create place
 *   security:
 *    - Authorization: []
 *   tags: [Place]
 *   requestBody:
 *    required: true
 *    content:
 *     multipart/form-data:
 *      schema:
 *       type: object
 *       required:
 *        - title
 *        - description
 *        - image
 *        - address
 *       properties:
 *        title:
 *         type: string
 *        description:
 *         type: string
 *         minLength: 5
 *        image:
 *         type: file
 *        address:
 *         type: string
 *   responses:
 *    201:
 *     description: Place created successfully.
 *    403:
 *     description: Unauthenticated.
 *    404:
 *     description: Not found user for provided id.
 *    422:
 *     description: Validation error.
 *    500:
 *     description: Server error.
 */

router.post(
  "/",
  checkAuth,
  fileUpload.single("image"),
  [
    body("title")
      .notEmpty()
      .isString()
      .trim()
      .withMessage("Title must NOT be empty."),
    body("description")
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 charcters."),
    body("address").not().isEmpty().withMessage("Address must NOT be empty."),
  ],
  placesController.createPlace
);

/**
 * @swagger
 * /api/places/{placeId}:
 *  patch:
 *   summary: Update place
 *   security:
 *    - Authorization: []
 *   tags: [Place]
 *   parameters:
 *    - in: path
 *      name: placeId
 *      schema:
 *       type: string
 *      required: true
 *      description: The place id
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       required:
 *        - title
 *        - description
 *       properties:
 *        title:
 *         type: string
 *        description:
 *         type: string
 *         minLength: 5
 *   responses:
 *    201:
 *     description: Place updated successfully.
 *    401:
 *     description: Unauthorized.
 *    403:
 *     description: Unauthenticated.
 *    404:
 *     description: Not found this place.
 *    422:
 *     description: Validation error.
 *    500:
 *     description: Server error.
 */

router.patch(
  "/:placeId",
  checkAuth,
  [
    param("placeId").isMongoId(),
    body("title")
      .notEmpty()
      .isString()
      .trim()
      .withMessage("Title must NOT be empty."),
    body("description")
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 charcters."),
  ],
  placesController.updatePlace
);

/**
 * @swagger
 * /api/places/{placeId}:
 *  delete:
 *   summary: Delete place
 *   security:
 *    - Authorization: []
 *   tags: [Place]
 *   parameters:
 *    - in: path
 *      name: placeId
 *      schema:
 *       type: string
 *      required: true
 *      description: The place id
 *   responses:
 *    200:
 *     description: Place deleted successfully.
 *    401:
 *     description: Unauthorized.
 *    403:
 *     description: Unauthenticated.
 *    404:
 *     description: Not found this place.
 *    500:
 *     description: Server error.
 */

router.delete(
  "/:placeId",
  checkAuth,
  param("placeId").isMongoId(),
  placesController.deletePlace
);

module.exports = router;
