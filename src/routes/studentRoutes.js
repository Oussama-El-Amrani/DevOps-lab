const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// Routes pour les students
router.post("/", studentController.createStudent);
router.get("/", studentController.getAllStudents);
router.get("/:id", studentController.getStudent);

module.exports = router;