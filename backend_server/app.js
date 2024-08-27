require("dotenv").config();
require("express-async-errors");

const cors = require("cors");
const express = require("express");
const app = express();

const documentRouter = require("./routes/document");
const queryRouter = require("./routes/query");
const addPineconeIndex = require("./middleware/PineconeClient");

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
app.use(express.json());
app.use(cors());
app.use(addPineconeIndex);

//routes
app.use("/api/v1/upload", documentRouter);
app.use("/api/v1/query", queryRouter);

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
