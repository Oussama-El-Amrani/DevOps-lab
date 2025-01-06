// Question: Quelle est la différence entre un contrôleur et une route ?
// Réponse:
// Question : Pourquoi séparer la logique métier des routes ?
// Réponse :
const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");
const mongoService = require("../services/mongoService");
const redisService = require("../services/redisService");

/**
 * Create a new course
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function createCourse(req, res) {
  try {
    const { title, description, instructor, duration } = req.body;

    // TODO: create a separate function that validate that
    if (!title || !description || !instructor || !duration) {
      res.status(400).json({
        error: "Title, description, instructor, and duration are required.",
      });
      return;
    }

    const newCourse = await mongoService.createDocument(
      getDb().collection("courses"),
      {
        title,
        description,
        instructor,
        duration,
        createdAt: new Date(),
      }
    );

    await redisService.cacheData(
      "courses:all",
      await mongoService.findAll(getDb().collection("courses")),
      3600
    );

    res
      .status(201)
      .json({ message: "Course created successfully.", data: newCourse });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
}

/**
 * Retrieves a single course by its ID.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function getCourse(req, res) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid course ID." });
      return;
    }

    const cachedCourse = await redisService.getCachedData(`course:${id}`);

    if (cachedCourse) {
      console.log(`Course ${id} retrieved from cache.`);
      res.status(200).json({
        message: "Course retrieved successfully.",
        data: cachedCourse,
      });
      return;
    }

    const course = await mongoService.findOneById(
      getDb().collection("courses"),
      id
    );

    if (!course) {
      res.status(404).json({ error: "course not found" });
      return;
    }

    await redisService.cacheData(`course:${id}`, course, 3600);

    res
      .status(200)
      .json({ message: "Course retrieved successfully.", data: course });
  } catch (error) {
    console.error("Error Retrieves a single course by its ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Retrieves statistics about all courses
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function getCourseStats(req, res) {
  try {
    const cachedCourses = await redisService.getCachedData("courses:all");

    let courses;

    if (cachedCourses) {
      console.log("Course stats retrieved from cache.");
      courses = cachedCourses;
    } else {
      courses = await mongoService.findAll(getDb().collection("courses"));
      await redisService.cacheData(
        "courses:all",
        courses,
        3600
      );
    }

    if (courses.length === 0) {
      res.status(404).json({ error: "No courses found." });
      return;
    }

    const stats = {
      totalCourses: courses.length,
      averageDuration:
        courses.reduce((sum, course) => {
          const durationInWeeks = parseInt(course.duration) || 0;
          return sum + durationInWeeks;
        }, 0) / courses.length,
    };

    res.status(200).json({
      message: "Course statistics retrieved successfully.",
      data: stats,
    });
  } catch (error) {
    console.error("Error retrieving course statistics:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
}

/**
 * Retrieves a all courses
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function getAllCourses(req, res) {
  try {
    const cachedCourses = await redisService.getCachedData(
      "courses:all"
    );

    let courses;
    if (cachedCourses) {
      console.log("Courses retrieved from cache.");
      courses = cachedCourses;
    } else {
      courses = await mongoService.findAll(getDb().collection("courses"));
      await redisService.cacheData(
        "courses:all",
        courses,
        3600
      );
    }

    if (courses.length == 0) {
      res.status(404).json({ message: "No courses found." });
      return;
    }

    res.status(200).json({
      message: "Courses retrieved successfully.",
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Error retrieving courses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Export des contrôleurs
module.exports = {
  createCourse,
  getCourse,
  getCourseStats,
  getAllCourses,
};