const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const { TOKEN_EXPIRES_IN, getAccessTokenSecret } = require("../config/env");
const { asyncHandler } = require("../utils/asyncHandler");

function publicUser(user) {
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function issueToken(userResponse) {
  return jwt.sign({ user: userResponse }, getAccessTokenSecret(), {
    expiresIn: TOKEN_EXPIRES_IN,
  });
}

exports.createAccount = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: true, message: "Please fill in all fields." });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: true, message: "User already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ firstName, lastName, email, password: hashedPassword });
  await user.save();

  const userResponse = publicUser(user);
  const accessToken = issueToken(userResponse);

  return res.json({
    error: false,
    user: userResponse,
    accessToken,
    message: "User created successfully.",
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: true, message: "Please fill in all fields." });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: true, message: "User does not exist." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ error: true, message: "Invalid credentials." });
  }

  const accessToken = issueToken(publicUser(user));

  return res.json({
    error: false,
    message: "Login successful.",
    email,
    accessToken,
  });
});

exports.getUser = asyncHandler(async (req, res) => {
  const { user } = req.user;
  const foundUser = await User.findOne({ _id: user._id });

  if (!foundUser) {
    return res.sendStatus(401);
  }

  return res.json({
    user: publicUser(foundUser),
    message: "",
  });
});
