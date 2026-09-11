const express = require("express");

const User = require("../models/User");
const Task = require("../models/Task");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Get all users
router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const users = await User.find().select("-password");

      res.json(users);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

// Get all tasks
router.get(
  "/tasks",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const tasks = await Task.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      res.json(tasks);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

// Delete any task
router.delete(
  "/tasks/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);

      if (!task) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      res.json({
        message: "Task deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
);

// Delete a user
router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Delete all tasks belonging to this user
      await Task.deleteMany({
        user: req.params.id,
      });

      res.json({
        message: "User and associated tasks deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
);

module.exports = router;
