const Joi = require("joi");
const mongoose = require("mongoose");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: true, message: error.details[0].message });
  }
  next();
};

/**
 * Validate one or more route parameters as MongoDB ObjectIds.
 */
const validateObjectId = (...paramNames) => (req, res, next) => {
  for (const paramName of paramNames) {
    const value = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return res.status(400).json({ error: true, message: "Invalid note or attachment ID." });
    }
  }
  next();
};

const schemas = {
  register: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  createNote: Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    tags: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string().allow("")),
    isPinned: Joi.boolean(),
    summary: Joi.string().allow(""),
    isSummarizing: Joi.boolean(),
    deleteAttachmentUrl: Joi.any(),
    deleteAttachmentId: Joi.any(),
  }).unknown(true),
  editNote: Joi.object({
    title: Joi.string(),
    content: Joi.string(),
    tags: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string().allow("")),
    isPinned: Joi.boolean(),
    summary: Joi.string().allow(""),
    isSummarizing: Joi.boolean(),
    deleteAttachmentUrl: Joi.any(),
    deleteAttachmentId: Joi.any(),
  }).unknown(true),
  updatePinned: Joi.object({
    isPinned: Joi.boolean().required(),
  }),
};

module.exports = { validate, validateObjectId, schemas };
