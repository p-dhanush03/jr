const dotenv = require("dotenv");
dotenv.config();


const express = require("express");
const cors = require("cors");

const generateRoute = require("./routes/generate");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/generate", generateRoute);

app.listen(3002, "0.0.0.0", () => {
  console.log("AI server running on http://localhost:3002");

});


