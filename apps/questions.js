import { Router } from "express";
import { db } from "../utils/db.js";
import { ObjectId } from "mongodb";

const questionRouter = Router();
const collection = db.collection("questions");

// Get all questions
questionRouter.get("/", async (req, res) => {
  try {
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
questionRouter.get("/:id", async (req, res) => {
  try {
    // รับ collection จาก MongoDB client
    const collection = db.collection("questions");

    const questionId = new ObjectId(req.params.id);

    // ใช้ findOne ในการค้นหาข้อมูล
    const questionById = await collection.findOne({ _id: questionId });

    return res.json({
      message: "Question retrieved successfully",
      question: questionById,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error retrieving question: ${error}`,
    });
  }
});

questionRouter.post("/", async (req, res) => {
  try {
    const collection = db.collection("questions");
    const questionData = { ...req.body, created_at: new Date() };

    const newQuestionData = await collection.insertOne(questionData);

    return res.status(201).json({
      message: `Question Id ${newQuestionData.insertedId} has been created successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error creating question: ${error}`,
    });
  }
});

// Update a question by ID
questionRouter.put("/:id", async (req, res) => {
  try {
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
questionRouter.delete("/:id", async (req, res) => {
  try {
    // รับ collection จาก MongoDB client
    const collection = db.collection("questions");

    const questionId = new ObjectId(req.params.id);

    // ใช้ deleteOne ในการลบข้อมูล
    const result = await collection.deleteOne({ _id: questionId });

    if (result.deletedCount === 1) {
      return res.json({ message: "Question deleted successfully" });
    } else {
      return res.status(404).json({ message: "Question not found" });
    }
  } catch (error) {
    return res.status(500).json({
      message: `Error deleting question: ${error}`,
    });
  }
});

export default questionRouter;
