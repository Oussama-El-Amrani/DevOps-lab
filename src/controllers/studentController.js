const express = require("express");
const { ObjectId } = require("mongodb");
const { db, getDb } = require("../config/db");
const mongoService = require("../services/mongoService");
const redisService = require("../services/redisService");
const e = require("express");

/**
 * Create a new student
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function createStudent(req, res) {
  try {
    const { firstName, lastName, email, phoneNumber } = req.body;

    // TODO: create a separate function that validate that
    if ((!firstName || !lastName, !email, !phoneNumber)) {
      res
        .status(400)
        .json({ error: "firstName, lastName, email,phoneNumber are required" });
    }
    console.log("createStudent");

    const newStudent = await mongoService.createDocument(
      getDb().collection("students"),
      {
        firstName,
        lastName,
        email,
        phoneNumber,
      }
    );

    res
      .status(201)
      .json({ message: "Student created successfully", data: newStudent });
  } catch (error) {
    console.error("Error creating a new student:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Retrieves a all students
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function getAllStudents(req, res) {
  try {
    const students = await mongoService.findAll(getDb().collection("students"));

    if (students.length == 0) {
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
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Retrieves a single student by its ID.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function getStudent(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid course ID." });
      return;
    }
    console.log(`getStudent ${id}`);

    const student = await mongoService.findOneById(
      getDb().collection("students"),
      id
    );

    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    res
      .status(201)
      .json({ message: "Student retrieved successfully.", data: student });
  } catch (error) {
    console.error("Error  Retrieves a single student by its ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Export des contrôleurs
module.exports = {
  createStudent,
  getAllStudents,
  getStudent,
};
