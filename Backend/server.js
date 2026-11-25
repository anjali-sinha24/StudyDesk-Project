const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ======================================
// MySQL CONNECTION
// ======================================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {

    if (err) {
        console.error("❌ MySQL connection failed:", err.message);
        return;
    }

    console.log("✅ MySQL connected successfully!");

});


// ======================================
// HOME
// ======================================

app.get("/", (req, res) => {

    res.send("StudyDesk AIDS Backend is Running!");

});


// ======================================
// TASKS
// ======================================

// GET ALL TASKS

app.get("/api/tasks", (req, res) => {

    const sql = `
        SELECT
            tasks.id,
            tasks.title,
            subjects.name AS subject,
            tasks.subject_id,
            DATE_FORMAT(tasks.due_date, '%Y-%m-%d') AS due_date,
            tasks.priority,
            tasks.minutes,
            tasks.completed
        FROM tasks
        JOIN subjects
        ON tasks.subject_id = subjects.id
        ORDER BY tasks.due_date ASC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "❌ Error fetching tasks:",
                err.message
            );

            return res.status(500).json({
                error: "Failed to fetch tasks"
            });

        }

        res.json(results);

    });

});


// ADD NEW TASK

app.post("/api/tasks", (req, res) => {

    const {
        title,
        subject_id,
        due_date,
        priority,
        minutes
    } = req.body;


    if (!title || !subject_id || !due_date) {

        return res.status(400).json({
            error: "Title, subject and due date are required"
        });

    }


    const sql = `
        INSERT INTO tasks
        (
            title,
            subject_id,
            due_date,
            priority,
            minutes
        )
        VALUES (?, ?, ?, ?, ?)
    `;


    db.query(
        sql,
        [
            title,
            subject_id,
            due_date,
            priority || "Medium",
            minutes || 30
        ],
        (err, result) => {

            if (err) {

                console.error(
                    "❌ Error adding task:",
                    err.message
                );

                return res.status(500).json({
                    error: "Failed to add task"
                });

            }


            res.json({
                message: "Task added successfully",
                id: result.insertId
            });

        }
    );

});


// ======================================
// EXAMS
// ======================================

// GET ALL EXAMS

app.get("/api/exams", (req, res) => {

    const sql = `
        SELECT
            exams.id,
            exams.name,
            exams.subject_id,
            subjects.name AS subject,
            DATE_FORMAT(exams.exam_date, '%Y-%m-%d') AS exam_date
        FROM exams
        JOIN subjects
        ON exams.subject_id = subjects.id
        ORDER BY exams.exam_date ASC
    `;


    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "❌ Error fetching exams:",
                err.message
            );

            return res.status(500).json({
                error: "Failed to fetch exams"
            });

        }

        res.json(results);

    });

});


// ADD NEW EXAM

app.post("/api/exams", (req, res) => {

    const {
        name,
        subject_id,
        exam_date
    } = req.body;


    if (!name || !subject_id || !exam_date) {

        return res.status(400).json({
            error: "Exam name, subject and date are required"
        });

    }


    const sql = `
        INSERT INTO exams
        (
            name,
            subject_id,
            exam_date
        )
        VALUES (?, ?, ?)
    `;


    db.query(
        sql,
        [
            name,
            subject_id,
            exam_date
        ],
        (err, result) => {

            if (err) {

                console.error(
                    "❌ Error adding exam:",
                    err.message
                );

                return res.status(500).json({
                    error: "Failed to add exam"
                });

            }


            res.json({
                message: "Exam added successfully",
                id: result.insertId
            });

        }
    );

});


// DELETE EXAM

app.delete("/api/exams/:id", (req, res) => {

    const examId = req.params.id;


    const sql = `
        DELETE FROM exams
        WHERE id = ?
    `;


    db.query(
        sql,
        [examId],
        (err, result) => {

            if (err) {

                console.error(
                    "❌ Error deleting exam:",
                    err.message
                );

                return res.status(500).json({
                    error: "Failed to delete exam"
                });

            }


            res.json({
                message: "Exam deleted successfully"
            });

        }
    );

});


// ======================================
// START SERVER
// ======================================

const PORT = 5001;

app.listen(PORT, () => {

    console.log(
        `🚀 Server running on http://localhost:${PORT}`
    );

});