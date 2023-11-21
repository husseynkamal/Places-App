const { Router } = require("express");
const { body } = require("express-validator");

const userController = require("../controllers/users");
const fileUpload = require("../middlewares/file-upload");

const router = Router();

/**
 * @swagger
 * components:
 *  schemas:
 *   User:
 *    type: object
 *    required:
 *     - name
 *     - email
 *     - password
 *     - image
 *    properties:
 *     _id:
 *      type: ObjectId
 *      description: Originally it's an auto-generated objectId.
 *     id:
 *      type: string
 *      description: stringed _id.
 *     name:
 *      type: string
 *      description: User's name.
 *     email:
 *      type: string
 *      description: User's email addrsss.
 *     password:
 *      type: string
 *      description: User's password.
 *     image:
 *      type: string
 *      description: User's profile image.
 *     places:
 *      type: array
 *      description: User's created places.
 *      items:
 *       type: string
 *       description: Originally it's an ObjectIds refer to Places schema
 */

/**
 * @swagger
 * tags:
 *  name: User
 *  description: User managing API
 */

/**
 * @swagger
 * /api/users:
 *  get:
 *   summary: Get Users
 *   tags: [User]
 *   responses:
 *    200:
 *     description: Users data.
 *    500:
 *     description: Server error.
 */

router.get("/", userController.getUsers);

/**
 * @swagger
 * /api/users/signup:
 *  post:
 *   summary: Signup
 *   tags: [User]
 *   requestBody:
 *    required: true
 *    content:
 *     multipart/form-data:
 *      schema:
 *       type: object
 *       required:
 *        - name
 *        - email
 *        - password
 *        - image
 *       properties:
 *        name:
 *         type: string
 *        email:
 *         type: string
 *         format: email
 *        password:
 *         type: string
 *         minLength: 6
 *        image:
 *         type: file
 *   responses:
 *    201:
 *     description: User successfully signup.
 *    422:
 *     description: Validation error.
 *    500:
 *     description: Server error.
 */

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    body("name").notEmpty(),
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    body("password", "Password has to be valid.")
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
  ],
  userController.signup
);

/**
 * @swagger
 * /api/users/login:
 *  post:
 *   summary: Login
 *   tags: [User]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       required:
 *        - email
 *        - password
 *       properties:
 *        email:
 *         type: string
 *         format: email
 *        password:
 *         type: string
 *         minLength: 6
 *   responses:
 *    200:
 *     description: User successfully login.
 *    403:
 *     description: Invalid credentials.
 *    422:
 *     description: Validation error.
 *    500:
 *     description: Server error.
 */

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    body("password", "Password has to be valid.")
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
  ],
  userController.login
);

/**
 * @swagger
 * /api/users/reset:
 *  put:
 *   summary: Send Reset Password Mail
 *   tags: [User]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       required:
 *        - email
 *       properties:
 *        email:
 *         type: string
 *         format: email
 *   responses:
 *    201:
 *     description: Email successfully send.
 *    404:
 *     description: Not found user for provided email.
 *    422:
 *     description: Validation error.
 *    500:
 *     description: Server error.
 */

router.put(
  "/reset",
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail(),
  userController.restPassword
);

/**
 * @swagger
 * /api/users/reset/{passwordToken}:
 *  get:
 *   summary: Check If Token NOT Expire Yet
 *   tags: [User]
 *   parameters:
 *    - in: path
 *      name: passwordToken
 *      schema:
 *       type: string
 *      required: true
 *      description: The reset password token
 *   responses:
 *    200:
 *     description: Not expire yet.
 *    403:
 *     description: Invalid credentials.
 *    500:
 *     description: Server error.
 */

router.get("/reset/:passwordToken", userController.getNewPassword);

/**
 * @swagger
 * /api/users/password/new:
 *  patch:
 *   summary: Reset Password
 *   tags: [User]
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       required:
 *        - userId
 *        - newPassword
 *        - passwordToken
 *       properties:
 *        userId:
 *         type: string
 *        newPassword:
 *         type: string
 *         minLength: 6
 *        passwordToken:
 *         type: string
 *   responses:
 *    201:
 *     description: Password updated.
 *    403:
 *     description: Invalid credentials.
 *    500:
 *     description: Server error.
 */

router.patch(
  "/password/new",
  [
    body("userId").isMongoId(),
    body("newPassword", "Password has to be valid.")
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
  ],
  userController.setNewPassword
);

module.exports = router;
