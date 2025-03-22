const express = require("express");
const path = require("path");
const collegeData = require("./modules/collegeData");
const expressLayouts = require("express-ejs-layouts");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/main");

// Routes
app.get("/", (req, res) => res.render("home"));
app.get("/about", (req, res) => res.render("about"));
app.get("/htmlDemo", (req, res) => res.render("htmlDemo"));
app.get("/students/add", (req, res) => res.render("addStudent"));

app.get("/students", (req, res) => {
  collegeData.getAllStudents()
    .then(data => res.render("students", { students: data }))
    .catch(() => res.render("students", { message: "No results" }));
});

app.get("/courses", (req, res) => {
  collegeData.getCourses()
    .then(data => res.render("courses", { courses: data }))
    .catch(() => res.render("courses", { message: "No courses found" }));
});

app.get("/student/:num", (req, res) => {
  collegeData.getStudentByNum(req.params.num)
    .then(data => res.render("student", { student: data }))
    .catch(() => res.render("student", { message: "Student not found" }));
});

app.post("/student/update", (req, res) => {
  collegeData.updateStudent(req.body)
    .then(() => res.redirect("/students"))
    .catch(err => res.status(500).send(err));
});

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// ✅ Critical: Initialize data before exporting
if (process.env.VERCEL) {
  // Export only after initializing
  module.exports = (async () => {
    await collegeData.initialize();
    return app;
  })();
} else {
  collegeData.initialize().then(() => {
    app.listen(HTTP_PORT, () =>
      console.log(`Server running at http://localhost:${HTTP_PORT}`)
    );
  }).catch(err => {
    console.log("Failed to start server:", err);
  });
}
