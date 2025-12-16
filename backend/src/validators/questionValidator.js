const { body, query } = require("express-validator");

exports.createQuestionValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("title is required"),

  body("difficulty")
    .optional()
    .isIn(["Easy", "Medium", "Hard"])
    .withMessage("difficulty must be Easy, Medium or Hard"),

  body("status")
    .optional()
    .isIn(["todo", "in-progress", "done"])
    .withMessage("status must be todo, in-progress or done"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("tags must be an array"),

  body("attempts")
    .optional()
    .isInt({ min: 0 })
    .withMessage("attempts must be a non-negative integer")
];

exports.queryQuestionValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 2000 }),
  query("difficulty").optional().isIn(["Easy", "Medium", "Hard"]),
  query("status").optional().isIn(["todo", "in-progress", "done"])
];
