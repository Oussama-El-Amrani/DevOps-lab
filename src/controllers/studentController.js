const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");
const mongoService = require("../services/mongoService");
const redisService = require("../services/redisService");

const STUDENTS = "students";
/**
 * Create a new student
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function createStudent(req, res) {
  try {
    const { firstName, lastName, email, phoneNumber } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber) {
      res.status(400).json({
        error: "firstName, lastName, email, and phoneNumber are required.",
      });
      return;
    }

    const newStudent = await mongoService.createDocument(
      getDb().collection(STUDENTS),
      {
        firstName,
        lastName,
        email,
        phoneNumber,
        createdAt: new Date(),
      }
    );

    await redisService.cacheHashDocument(STUDENTS, newStudent.insertedId, newStudent);

    res
      .status(201)
      .json({ message: "Student created successfully.", data: newStudent });
  } catch (error) {
    console.error("Error creating a new student:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
}

/**
 * Retrieves all students
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function getAllStudents(req, res) {
  try {
    let source = "cache";
    let students = await redisService.getAllHashDocuments("courses");

    if (students.length === 0) {
      source = "database";
      students = await mongoService.findAll(getDb().collection(STUDENTS));

      if (students.length === 0) {
        res.status(404).json({ message: "No students found." });
        return;
      }

      await Promise.all(
        students.map((student) =>
          redisService.cacheHashDocument(
            STUDENTS,
            student._id.toString(),
            student
          )
        )
      );
    }

    res.status(200).json({
      message: `Students retrieved from ${source}`,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Error retrieving students:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
}

/**
 * Retrieves a single student by their ID
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function getStudent(req, res) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid student ID." });
      return;
    }

    const student = await redisService.getHashDocument(STUDENTS, id);
    let source = "cache";

    if (!student) {
      source = "database";
      student = await mongoService.findOneById(
        getDb().collection(STUDENTS),
        id
      );

      if (student) {
        await redisService.cacheHashDocument(
          STUDENTS,
          student._id.toString(),
          student
        );
      }
    }

    if (student) {
      res.status(200).json({
        message: `Student retrieved successfully form ${source}`,
        data: student,
      });
    }

    if (!student) {
      res.status(404).json({ error: "Student not found." });
      return;
    }
  } catch (error) {
    console.error("Error retrieving a single student by ID:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
}

// Export the controllers
module.exports = {
  createStudent,
  getAllStudents,
  getStudent,
};
