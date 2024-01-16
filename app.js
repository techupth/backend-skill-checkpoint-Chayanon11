import express from "express";
import { client } from "./utils/db.js";

async function init() {
  const app = express();
  const port = 4000;

  await client.connect();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mock data storage for questions
  let questions = [];

  // Middleware to check if question exists by ID
  const questionExists = (req, res, next) => {
    const questionId = req.params.id;
    const question = questions.find((q) => q.id === questionId);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    req.question = question;
    next();
  };

  // Generate unique ID for questions
  const generateQuestionId = () => {
    return Date.now().toString(36) + Math.random().toString(36);
  };

  // Routes

  // Create a new question
  app.post("/questions", (req, res) => {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res
        .status(400)
        .json({ error: "Please provide title, description, and category" });
    }

    const newQuestion = {
      id: generateQuestionId(),
      title,
      description,
      category,
    };

    questions.push(newQuestion);

    return res.status(201).json({
      message: "Question created successfully",
      question: newQuestion,
    });
  });

  // Get all questions
  app.get("/questions", (req, res) => {
    return res.json({
      message: "Questions retrieved successfully",
      questions: questions,
    });
  });

  // Get a specific question by ID
  app.get("/questions/:id", questionExists, (req, res) => {
    return res.json({
      message: "Question retrieved successfully",
      question: req.question,
    });
  });

  // Update a question by ID
  app.put("/questions/:id", questionExists, (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Please provide title and description for update" });
    }

    req.question.title = title;
    req.question.description = description;

    return res.json({
      message: "Question updated successfully",
      updatedQuestion: req.question,
    });
  });

  // Delete a question by ID
  app.delete("/questions/:id", questionExists, (req, res) => {
    questions = questions.filter((q) => q.id !== req.question.id);

    return res.json({ message: "Question deleted successfully" });
  });

  // Default route for handling unknown paths
  app.get("*", (req, res) => {
    return res.status(404).json("Not found");
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

init();
