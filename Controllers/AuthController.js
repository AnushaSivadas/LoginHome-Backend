const User = require("../Models/UserModel");
const Token = require("../Models/TokenModel");
const sendEmail = require("../utils/sendEmail")
const jwt_decode = require('jwt-decode')
const { createSecretToken } = require("../utils/SecretToken");
const bcrypt = require("bcrypt");
const crypto = require('crypto')

module.exports.Signup = async (req, res, next) => {
  try {
    const { email, username, confirmpassword, createdAt } = req.body;
    let { password } = req.body
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }

    if (password != confirmpassword) {
      return res.json({ message: "Passwords doesn't match" })
    }

    password = await bcrypt.hash(password, 12);

    const user = await User.create({ email, password, username, createdAt });
    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex")
    }).save()

    const url = `${process.env.BASE_URL}/${user._id}/verify/${token.token}`
    await sendEmail(user.email, "Verify Email", url)
    res.status(201)
      .json({ message: "An Email sent to your account please verify", success: true, user });
    next();
  } catch (error) {
    console.error(error);
  }
};

module.exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });

    if (!token) return res.status(400).send({ message: "Invalid link" });

    await User.updateOne({ _id: user._id, verified: true });
    // await token.remove();

    res.status(200).send({ message: "Email verified successfully", success: true, user });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: 'All fields are required' })
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'Incorrect password or email' })
    }
    const auth = await bcrypt.compare(password, user.password)
    if (!auth) {
      return res.json({ message: 'Incorrect password or email' })
    }
    if (!user.verified) {
      let token = await Token.findOne({ userId: user._id });

      if (!token) {

        token = await new Token({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        }).save();
        const url = `${process.env.BASE_URL}/${user.id}/verify/${token.token}`;
        await sendEmail(user.email, "Verify Email", url);
      }
      return res
        .status(201)
        .json({ message: "An Email sent to your account please verify" });
    }
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: true,
  path: '/',
  domain: 'onrender.com',
  secure: true,
  sameSite: 'None'
    });
    console.log("cookie token",token)
    res.status(201).json({ message: "User logged in successfully", success: true });
    next()
  } catch (error) {
    console.error(error);
  }
}

module.exports.GoogleSignin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    let decoded = await jwt_decode(credential);
    const { given_name, family_name, email } = decoded;
    const user = await User.findOne({ email });
    if (user) {
      const token = createSecretToken(user._id);
      res.cookie("token", token, {
        withCredentials: true,
        httpOnly: false,
      });
      res.status(201).json({ message: "User logged in successfully", success: true });
      next()
    } else {
      const user = await User.create({
        email: email,
        username: given_name + " " + family_name,
      });
      const token = createSecretToken(user._id);
      res.cookie("token", token, {
        withCredentials: true,
        httpOnly: false,
      });
      res
        .status(201)
        .json({ message: "User registered successfully", success: true, user });
      next();
    }

  } catch (error) {
    console.error(error);
  }
}