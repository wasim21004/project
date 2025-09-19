const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/tasksdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Schemas
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  priority: { type: String, enum: ["high","medium","low"], default: "medium" },
  completed: { type: Boolean, default: false },
  scheduled: { type: Boolean, default: false },
  scheduledDate: { type: Date, default: null },
});

const CalendarEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  dateTime: { type: Date, required: true },
});

const Task = mongoose.model("Task", TaskSchema);
const CalendarEvent = mongoose.model("CalendarEvent", CalendarEventSchema);

// ----- Routes -----
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `recording-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// ---------------- Routes ----------------

// Process voice endpoint
app.post("/process-voice", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

    const audioPath = req.file.path;
    console.log("Received audio file:", audioPath);

    // 🔹 MOCK transcription (replace with real API)
    const mockTranscription = "Meeting with John Friday at 2 PM";

    // Optionally: delete uploaded file after processing
    fs.unlink(audioPath, (err) => {
      if (err) console.error("Failed to delete uploaded audio:", err);
    });

    res.json({ transcription: mockTranscription });
  } catch (err) {
    console.error("process-voice error:", err);
    res.status(500).json({ error: "Failed to process audio" });
  }
});
// Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    console.error("Failed to fetch tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Add new task
app.post("/tasks", async (req, res) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();
    res.json(newTask);
  } catch (err) {
    console.error("Failed to add task:", err);
    res.status(500).json({ error: "Failed to add task" });
  }
});

// Update task (PATCH)
app.patch("/tasks/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTask) return res.status(404).json({ error: "Task not found" });
    res.json(updatedTask);
  } catch (err) {
    console.error("Failed to update task:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete task:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Calendar Events
app.get("/calendar-events", async (req, res) => {
  try {
    const events = await CalendarEvent.find();
    res.json(events);
  } catch (err) {
    console.error("Failed to fetch calendar events:", err);
    res.status(500).json({ error: "Failed to fetch calendar events" });
  }
});

app.post("/calendar-events", async (req, res) => {
  try {
    const newEvent = new CalendarEvent(req.body);
    await newEvent.save();
    res.json(newEvent);
  } catch (err) {
    console.error("Failed to add calendar event:", err);
    res.status(500).json({ error: "Failed to add calendar event" });
  }
});

app.delete("/calendar-events/:id", async (req, res) => {
  try {
    const event = await CalendarEvent.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete calendar event:", err);
    res.status(500).json({ error: "Failed to delete calendar event" });
  }
});

app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on http://0.0.0.0:${PORT}`)
);
