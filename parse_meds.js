import fs from 'fs';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const content = fs.readFileSync('src/data/protocols.ts', 'utf-8');
  
  // Extract MEDICATIONS array string
  const match = content.match(/export const MEDICATIONS: Medication\[\] = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error("Could not find MEDICATIONS array");
    return;
  }
  
  const medsStr = match[1];
  
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        dosingDetails: {
          type: Type.OBJECT,
          properties: {
            adult: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  route: { type: Type.STRING, description: "e.g. IV, IM, PO, Nebulized, Auto-Injector, General" },
                  dose: { type: Type.STRING }
                }
              }
            },
            pediatric: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  route: { type: Type.STRING, description: "e.g. IV, IM, PO, Nebulized, Auto-Injector, General" },
                  dose: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    }
  };

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Parse the following medications array and extract the dosing information into a structured format.
    For each medication, extract the adult and pediatric dosing, and categorize by route of administration.
    If a route isn't explicitly stated, use "General" or infer it.
    If there is no pediatric dose, leave the pediatric array empty.
    If there is no adult dose, leave the adult array empty.
    
    Here is the array:
    ${medsStr}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }
  });
  
  const parsed = JSON.parse(response.text);
  fs.writeFileSync('parsed_meds.json', JSON.stringify(parsed, null, 2));
  console.log("Done parsing");
}

run().catch(console.error);
