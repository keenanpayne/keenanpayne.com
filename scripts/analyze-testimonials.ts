/**
 * Testimonial Analysis Script
 * --------------------------
 * Analyzes testimonials to extract and count common positive qualities mentioned by clients.
 *
 * Usage:
 *   $ node scripts/analyze-testimonials.ts
 *   $ npm run analyze:testimonials
 *
 * Process:
 * 1. Reads testimonials from app/data/testimonials.ts
 * 2. Counts quality mentions (e.g., "professional", "efficient")
 * 3. Outputs:
 *    - Console: Top 12 qualities with stats
 *    - File: app/data/testimonial-analysis.json
 *    - Site: Used by the `testimonials-grid` section
 *
 * Run after adding/updating testimonials or when refresh needed.
 */

import fs from "node:fs";
import path from "node:path";

// Import testimonials data
import { testimonials } from "../app/data/testimonials.ts";

// Common positive adjectives and qualities to look for
const positiveQualities = [
  // Professional qualities
  "professional",
  "reliable",
  "dependable",
  "efficient",
  "responsive",
  "communicative",
  "collaborative",
  "patient",
  "diligent",
  "organized",
  "punctual",
  "dedicated",

  // Technical skills
  "talented",
  "skilled",
  "expert",
  "experienced",
  "knowledgeable",
  "technical",
  "creative",
  "innovative",
  "cutting-edge",
  "magical",
  "wizard",
  "mastery",
  "robust",

  // Personal qualities
  "easy",
  "friendly",
  "kind",
  "pleasant",
  "laid-back",
  "cool-headed",
  "empathetic",
  "sharp",
  "intuitive",
  "smart",
  "intelligent",
  "thoughtful",
  "understanding",

  // Work quality
  "excellent",
  "outstanding",
  "exceptional",
  "amazing",
  "fantastic",
  "great",
  "wonderful",
  "beautiful",
  "elegant",
  "clean",
  "polished",
  "professional",
  "high-quality",

  // Communication & collaboration
  "clear",
  "transparent",
  "helpful",
  "supportive",
  "available",
  "accessible",
  "collaborative",
  "team-player",
  "communicative"
];

// Additional descriptive phrases to look for
const positivePhases = [
  "highly recommend",
  "highly recommended",
  "would recommend",
  "pleasure to work with",
  "easy to work with",
  "great to work with",
  "amazing to work with",
  "excellent job",
  "exceeded expectations",
  "above and beyond",
  "went above",
  "great value",
  "on time",
  "on schedule",
  "quick",
  "fast",
  "efficient",
  "timely"
];

function cleanText(text: string) {
  // Remove HTML tags and convert to lowercase
  return text.replace(/<[^>]*>/g, "").toLowerCase();
}

function findQualities(text: string) {
  const cleanedText = cleanText(text);
  const foundQualities: string[] = [];

  // Look for individual words
  positiveQualities.forEach((quality) => {
    if (cleanedText.includes(quality)) {
      foundQualities.push(quality);
    }
  });

  // Look for phrases
  positivePhases.forEach((phrase) => {
    if (cleanedText.includes(phrase)) {
      // Convert phrase to a single word representation
      const phraseKey = phrase.replace(/\s+/g, "-");
      foundQualities.push(phraseKey);
    }
  });

  // Count each quality once, even if it's listed twice (e.g. "efficient")
  return [...new Set(foundQualities)];
}

function analyzeTestimonials() {
  const qualityCount: Record<string, number> = {};
  const totalTestimonials = testimonials.length;

  testimonials.forEach((testimonial) => {
    const qualities = findQualities(testimonial.content);

    qualities.forEach((quality) => {
      qualityCount[quality] = (qualityCount[quality] || 0) + 1;
    });
  });

  // Sort by frequency and convert to array
  const sortedQualities = Object.entries(qualityCount)
    .sort(([, a], [, b]) => b - a)
    .map(([quality, count]) => ({
      word: quality,
      count: count,
      percentage: Math.round((count / totalTestimonials) * 100)
    }));

  return {
    topQualities: sortedQualities.slice(0, 12), // Top 12 qualities
    allQualities: sortedQualities,
    totalTestimonials: totalTestimonials,
    analyzedAt: new Date().toISOString()
  };
}

function formatWordForDisplay(word: string) {
  // Convert hyphenated phrases back to readable format
  return word
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function generateReport() {
  const analysis = analyzeTestimonials();

  console.log("🎯 Testimonial Analysis Report");
  console.log("=".repeat(50));
  console.log(`Total testimonials analyzed: ${analysis.totalTestimonials}`);
  console.log(
    `Analysis date: ${new Date(analysis.analyzedAt).toLocaleDateString()}`
  );
  console.log("");

  console.log("Top Qualities Mentioned:");
  console.log("-".repeat(30));

  analysis.topQualities.forEach((item, index) => {
    const displayWord = formatWordForDisplay(item.word);
    console.log(
      `${index + 1}. ${displayWord} (${item.count}x, ${item.percentage}%)`
    );
  });

  // Save to data file for use by the site
  const dataDir = path.join(import.meta.dirname, "../app/data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const outputPath = path.join(dataDir, "testimonial-analysis.json");
  fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));

  console.log("");
  console.log(`✅ Analysis saved to: ${outputPath}`);

  return analysis;
}

// Run the analysis
if (import.meta.main) {
  generateReport();
}

export { analyzeTestimonials, formatWordForDisplay };
