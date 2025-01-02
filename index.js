const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");

const app = express();
const port = 4000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use(
  session({
    secret: "your-secret-key", // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
  })
);

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://malarselvi273:SJyWQnA1unaYECxC@cluster0.hit65.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Database connection error:", err));

// Define Schema and Model
const labSchema = new mongoose.Schema({
  name: String,
  registerNumber: Number,
  department: String,
  email: String,
  mobileNumber: Number,
  lab: String,
  skills: [String],
  resumePath: String,
});

const LabRegistration = mongoose.model("LabRegistration", labSchema);

// Routes

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Handle first form submission
app.post("/register", (req, res) => {
  try {
    // Save first form data in session
    req.session.firstFormData = req.body;
    res.redirect("/next.html"); // Redirect to next form
  } catch (error) {
    console.error("Error saving first form data:", error);
    res.status(500).send("Error saving data. Please try again.");
  }
});

// Serve next.html
app.get("/next.html", (req, res) => {
  res.sendFile(path.join(__dirname, "next.html"));
});

// Handle second form submission
app.post("/submit", async (req, res) => {
  try {
    const firstFormData = req.session.firstFormData;

    if (!firstFormData) {
      return res.status(400).send("First form data is missing.");
    }

    const { lab, skills, resume } = req.body;

    // Combine data from both forms
    const newLabRegistration = new LabRegistration({
      ...firstFormData,
      lab: lab,
      skills: Array.isArray(skills) ? skills : [skills],
      resumePath: resume || "N/A", // Placeholder for file uploads
    });

    // Save to MongoDB
    await newLabRegistration.save();
    res.send("<p>Registration complete! <a href='/'>Go back</a></p>");
  } catch (error) {
    console.error("Error saving registration data:", error);
    res.status(500).send(`Error saving registration data: ${error.message}`);
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
