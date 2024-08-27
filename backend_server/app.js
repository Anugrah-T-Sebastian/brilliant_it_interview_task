require("dotenv").config();
require("express-async-errors");

const cors = require("cors");
const express = require("express");
const app = express();

const documentRouter = require("./routes/document");

app.use(express.json());
app.use(cors());

//routes
app.use("/api/v1", documentRouter);

const port = process.env.PORT || 3003;

//create index and start server
const start = async () => {
  try {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error(error);
  }
};

start();
