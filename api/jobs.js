const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000; // Use Vercel's PORT or fallback to 4000

app.get("/api/jobs", (req, res) => {
  console.log("✅ Received request for jobs");

  // Ensure correct path for both Local & Vercel
  const jobsDir = path.join(__dirname, "../data/jobs/");

  if (!fs.existsSync(jobsDir)) {
    console.error("❌ Jobs directory does not exist");
    return res.status(404).json({ error: "Jobs directory not found" });
  }

  const jobs = [];

  fs.readdirSync(jobsDir).forEach((file) => {
    if (!file.endsWith(".json")) return;

    const filePath = path.join(jobsDir, file);
    try {
      const data = fs.readFileSync(filePath, "utf8").trim();
      if (!data) return;

      const job = JSON.parse(data);
      if (job && typeof job === "object") {
        jobs.push(job);
      }
    } catch (error) {
      console.warn(`⚠️ Skipping invalid JSON file: ${file} -`, error.message);
    }
  });

  res.json(jobs);
});

// ✅ This check allows running locally but avoids conflicts on Vercel
if (process.env.NODE_ENV !== "vercel") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/api/jobs`);
  });
}

module.exports = app; // ✅ Required for Vercel
