var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_cors = __toESM(require("cors"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use((0, import_cors.default)());
  app.use(import_express.default.json());
  const ai = new import_genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
  app.post("/api/rx/lookup", async (req, res) => {
    try {
      const { query, type, image } = req.body;
      if (!query && type !== "interactions" && type !== "scan") {
        return res.status(400).json({ error: "Missing query" });
      }
      let prompt = "";
      let contents = "";
      if (type === "info") {
        prompt = `You are an expert emergency medical consultant. Provide a highly professional, clinical summary for the medication: "${query}".
Focus on rapid, on-scene emergency responders (EMTs and Paramedics).
Format your response as a structured JSON object with the following fields:
- brandName: (string) Brand names
- genericName: (string) Generic name
- drugClass: (string) Pharmacological class
- primaryIndication: (string) What it is mainly used for
- emergencyImplications: (string) Critical things an EMS responder must know (e.g. "Can cause severe hypotension", "Altered mental status if overdosed", etc.)
- standardDosing: (string) Typical outpatient or emergency dosing if applicable
- sideEffects: (string[]) Top 3-4 side effects relevant to EMS
- contraindications: (string[]) Top 2-3 contraindications or dangerous interactions
- visualDescription: (string) Typical physical appearance if known, or general guidance.`;
        contents = prompt;
      } else if (type === "pill") {
        prompt = `You are an expert forensic pharmacist and emergency medicine toxicologist. 
The user has provided the following pill markings/description: "${query}".
Search your database to identify this medication. If you cannot identify it precisely, provide the most likely candidates or standard identification guidance.
Format your response as a structured JSON object with the following fields:
- identified: (boolean) whether you successfully identified a specific drug
- brandName: (string) Identified or most likely Brand name
- genericName: (string) Identified or most likely Generic name
- drugClass: (string) Pharmacological class
- strength: (string) Typical dosage strength for this imprint
- emergencyImplications: (string) Critical information for a paramedic on scene
- descriptionConfirmed: (string) Re-verify physical description matching the query (e.g. white round tablet with marking X)
- warningLabel: (string) High-risk warnings (e.g. controlled substance, high overdose risk, respiratory depressant).`;
        contents = prompt;
      } else if (type === "interactions") {
        prompt = `You are an expert clinical pharmacist. Analyze potential interactions or overlaps for the following list of medications: "${query}".
Format your response as a structured JSON object with the following fields:
- hasInteraction: (boolean) whether there is a moderate-to-severe risk
- riskLevel: (string) "High", "Moderate", or "Low/None"
- severitySummary: (string) A concise, 1-sentence summary of the interaction risk
- mechanism: (string) Pharmacological mechanism of the interaction
- emsActionableGuidance: (string) What the EMS responder should do on scene (e.g. "Monitor ECG for QTc prolongation", "Prepare to assist ventilations", etc.)
- dangerousOverlaps: (string[]) List of specific severe drug-drug or drug-class overlaps identified.`;
        contents = prompt;
      } else if (type === "scan") {
        if (!image) {
          return res.status(400).json({ error: "Missing image for photo analysis" });
        }
        const match = image.match(/^data:([^;]+);base64,(.+)$/);
        let mimeType = "image/jpeg";
        let base64Data = image;
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        }
        const imagePart = {
          inlineData: {
            mimeType,
            data: base64Data
          }
        };
        const textPart = {
          text: `You are an expert emergency medical consultant and toxicologist. 
Analyze the medication or medications visible in this photo. They could be pill bottles, loose pills, prescription boxes, or liquid vials.
Identify all medications and retrieve critical EMS/toxicology intelligence about them.
Format your response as a structured JSON object with the following fields:
- identified: (boolean) Whether you successfully identified at least one medication in the photo.
- medications: (array of objects, each containing):
  - brandName: (string) Identified Brand name (e.g. "Percocet", "Eliquis") or "Unknown"
  - genericName: (string) Identified Generic name (e.g. "Oxycodone/Acetaminophen", "Apixaban") or "Unknown"
  - drugClass: (string) Pharmacological class (e.g. "Anticoagulant", "Opioid Analgesic")
  - strength: (string) Strength if readable (e.g. "5mg/325mg", "5mg"), otherwise empty or "Unknown"
  - confidence: (string) "High", "Medium", or "Low"
  - emergencyImplications: (string) Critical responder implications (e.g. "Monitor for respiratory depression", "Severe hemorrhage risk", etc.)
  - description: (string) Quick description of what was seen in the photo (e.g., "Round yellow tablet with imprint 103", "Standard Rx bottle labeled Eliquis")
- overallClinicalWarning: (string) A comprehensive overall safety warning/caution summary for responders encountering this patient.`
        };
        contents = { parts: [imagePart, textPart] };
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a highly precise, reliable emergency clinical pharmacy database. Only provide medically accurate, on-scene actionable information for EMS personnel. If unsure, state lack of certainty but provide safety precautions."
        }
      });
      const text = response.text;
      if (!text) {
        throw new Error("No response from AI model");
      }
      res.json(JSON.parse(text));
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
