const fs = require("fs");
const path = require("path");

module.exports = () => {
  try {
    const analysisPath = path.join(__dirname, "testimonial-analysis.json");

    if (fs.existsSync(analysisPath)) {
      const rawData = fs.readFileSync(analysisPath, "utf8");
      return JSON.parse(rawData);
    }

    // Fallback if analysis file doesn't exist
    return {
      topQualities: [],
      allQualities: [],
      totalTestimonials: 0,
      analyzedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error loading testimonial analysis:", error);
    return {
      topQualities: [],
      allQualities: [],
      totalTestimonials: 0,
      analyzedAt: new Date().toISOString()
    };
  }
};
