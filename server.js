const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;

app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Middleware to parse JSON request bodies

const jobsDir = path.join(__dirname, "data/jobs/");

// API: Get all job listings
app.get("/api/jobs", async (req, res) => {
  try {
    const files = await fs.promises.readdir(jobsDir);
    const jobs = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const filePath = path.join(jobsDir, file);
      try {
        const data = await fs.promises.readFile(filePath, "utf8");
        if (data.trim()) {
          const job = JSON.parse(data);
          if (job && typeof job === "object") jobs.push(job);
        }
      } catch (error) {
        console.warn(`⚠️ Skipping invalid JSON file: ${file} -`, error.message);
      }
    }

    res.json(jobs);
  } catch (err) {
    console.error("❌ Error reading job files:", err);
    res.status(500).json({ error: "Failed to load job listings" });
  }
});

// API: Get a specific job by ID
app.get("/api/jobs/:id", async (req, res) => {
  const jobId = req.params.id;
  const filePath = path.join(jobsDir, `${jobId}.json`);

  try {
    const data = await fs.promises.readFile(filePath, "utf8");
    const job = JSON.parse(data);
    res.json(job);
  } catch (err) {
    console.warn(`⚠️ Job file not found or invalid: ${jobId}.json`);
    res.status(404).json({ error: "Job not found or invalid data" });
  }
});

// API: Add a new job listing (Optional)
app.post("/api/jobs", async (req, res) => {
  const jobData = req.body;
  if (!jobData.id) {
    return res.status(400).json({ error: "Job must have an ID" });
  }

  const filePath = path.join(jobsDir, `${jobData.id}.json`);

  try {
    await fs.promises.writeFile(
      filePath,
      JSON.stringify(jobData, null, 2),
      "utf8"
    );
    res.json({ success: true, message: "Job added successfully!" });
  } catch (err) {
    console.error("❌ Error saving job:", err);
    res.status(500).json({ error: "Failed to save job listing" });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/api/jobs`);
});
