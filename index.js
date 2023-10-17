const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const authRoute = require("./Routes/AuthRoute");
require("dotenv").config();
const { MONGO_URL } = process.env;
const PORT = process.env.PORT || 4000

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB is  connected successfully"))
  .catch((err) => console.error(err));

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const corsOptions = {
  origin: 'https://loginhomeoverrule.netlify.app',
  credentials: true,
};

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(express.json());

app.use("/", authRoute);