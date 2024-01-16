import express from "express";
import cors from "cors";
import questionRouter from "./apps/questions.js";
// Import ตัว `client` เข้ามา
import { client } from "./utils/db.js";

const init = async () => {
  await client.connect();
  const app = express();
  const port = 4000;

  app.use(cors());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/questions", questionRouter);

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
  });
};
init();
