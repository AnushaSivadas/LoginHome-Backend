const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Your email address is required"],
    unique: true,
  },
  username: {
    type: String,
    required: [true, "Your username is required"],
  },
  password: {
    type: String,
  },

  verified:{
    type:Boolean,
    default:false
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});


module.exports = mongoose.model("User", userSchema);