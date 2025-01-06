const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");
const mongoService = require("../services/mongoService");
const redisService = require("../services/redisService");

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
      getDb().collection("students"),
      {
        firstName,
        lastName,
        email,
        phoneNumber,
        createdAt: new Date(),
      }
    );

    await redisService.cacheData(
      "students:all",
      await mongoService.findAll(getDb().collection("students")),
      3600
    );

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
    const cachedStudents = await redisService.getCachedData("students:all");

    let students;
    if (cachedStudents) {
      console.log("Students retrieved from cache.");
      students = cachedStudents;
    } else {
      students = await mongoService.findAll(getDb().collection("students"));
      await redisService.cacheData("students:all", students, 3600);
    }

    if (students.length === 0) {
      res.status(404).json({ message: "No students found." });
      return;
    }

    res.status(200).json({
      message: "Students retrieved successfully.",
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

    const cachedStudent = await redisService.getCachedData(`student:${id}`);

    if (cachedStudent) {
      console.log(`Student ${id} retrieved from cache.`);
      res.status(200).json({
        message: "Student retrieved successfully.",
        data: cachedStudent,
      });
      return;
    }

    const student = await mongoService.findOneById(
      getDb().collection("students"),
      id
    );

    if (!student) {
      res.status(404).json({ error: "Student not found." });
      return;
    }

    await redisService.cacheData(`student:${id}`, student, 3600);

    res.status(200).json({
      message: "Student retrieved successfully.",
      data: student,
    });
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
