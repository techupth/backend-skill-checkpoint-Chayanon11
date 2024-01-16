import express from "express";
import { client } from "./utils/db.js";
import { ObjectId } from "mongodb";

const init = async () => {
  await client.connect();
  const app = express();
  const port = 4000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mock data storage for questions
  let questions = [];

  // Middleware to check if question exists by ID
  const questionExists = async (req, res, next) => {
    const questionId = req.params.id;

    // Replace the mock data check with MongoDB query
    const collection = client.db("practice-mongo").collection("questions");
    const question = await collection.findOne({
      _id: new ObjectId(questionId),
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    req.question = question;
    next();
  };

  // Generate unique ID for questions
  const generateQuestionId = () => {
    return new ObjectId().toString();
  };

  // Create Express Router for questions
  const questionRouter = express.Router();

  // Create a new question
  questionRouter.post("/", async (req, res) => {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res
        .status(400)
        .json({ error: "Please provide title, description, and category" });
    }

    const collection = client.db("practice-mongo").collection("questions");

    const newQuestion = {
      _id: new ObjectId(),
      title,
      description,
      category,
    };

    await collection.insertOne(newQuestion);

    return res.status(201).json({
      message: "Question created successfully",
      question: newQuestion,
    });
  });

  // Get all questions
  questionRouter.get("/", async (req, res) => {
    const collection = client.db("practice-mongo").collection("questions");
    const allQuestions = await collection.find().toArray();
    return res.json({
      message: "Questions retrieved successfully",
      questions: allQuestions,
    });
  });

  // Get a specific question by ID
  questionRouter.get("/:id", questionExists, (req, res) => {
    return res.json({
      message: "Question retrieved successfully",
      question: req.question,
    });
  });

  // Update a question by ID
  questionRouter.put("/:id", questionExists, async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Please provide title and description for update" });
    }

    const collection = client.db("practice-mongo").collection("questions");

    await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { title, description } }
    );

    return res.json({
      message: "Question updated successfully",
    });
  });

  // Delete a question by ID
  questionRouter.delete("/:id", questionExists, async (req, res) => {
    const collection = client.db("practice-mongo").collection("questions");

    await collection.deleteOne({ _id: new ObjectId(req.params.id) });

    return res.json({ message: "Question deleted successfully" });
  });

  // Mount the questionRouter at the "/questions" endpoint
  app.use("/questions", questionRouter);

  // Default route for handling unknown paths
  app.get("*", (req, res) => {
    return res.status(404).json("Not found");
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
};

init();
