import { Router } from "express";
import { db } from "../utils/db.js";
import { ObjectId } from "mongodb";

const questionRouter = Router();

// Get all questions
questionRouter.get("/questions", async (req, res) => {
  try {
    const collection = db.collection("questions");
    const allQuestions = await collection.find().toArray();
    return res.json({
      message: "Questions retrieved successfully",
      questions: allQuestions,
    });
  } catch (error) {
    return res.json({
      message: `${error}`,
    });
  }
});

// Get a specific question by ID
questionRouter.get("/questions/:id", async (req, res) => {
  try {
    const collection = db.collection("questions");
    const questionId = new ObjectId(req.params.id);

    const questionById = await collection.findOne({ _id: questionId });

    return res.json({
      message: "Question retrieved successfully",
      question: questionById,
    });
  } catch (error) {
    return res.json({
      message: `${error}`,
    });
  }
});

// Create a new question
questionRouter.post("/questions", async (req, res) => {
  try {
    const collection = db.collection("questions");
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res
        .status(400)
        .json({ error: "Please provide title, description, and category" });
    }

    const newQuestionData = {
      title,
      description,
      category,
    };

    const newQuestion = await collection.insertOne(newQuestionData);

    return res.status(201).json({
      message: "Question created successfully",
      question: newQuestion.ops[0],
    });
  } catch (error) {
    return res.json({
      message: `${error}`,
    });
  }
});

// Update a question by ID
questionRouter.put("/questions/:id", async (req, res) => {
  try {
    const collection = db.collection("questions");
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Please provide title and description for update" });
    }

    const questionId = new ObjectId(req.params.id);

    await collection.updateOne(
      { _id: questionId },
      {
        $set: {
          title,
          description,
        },
      }
    );

    return res.json({
      message: "Question updated successfully",
    });
  } catch (error) {
    return res.json({
      message: `${error}`,
    });
  }
});

// Delete a question by ID
questionRouter.delete("/questions/:id", async (req, res) => {
  try {
    const collection = db.collection("questions");
    const questionId = new ObjectId(req.params.id);

    await collection.deleteOne({ _id: questionId });

    return res.json({ message: "Question deleted successfully" });
  } catch (error) {
    return res.json({
      message: `${error}`,
    });
  }
});

export default questionRouter;
