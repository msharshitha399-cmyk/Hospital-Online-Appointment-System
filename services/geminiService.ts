import { GoogleGenAI, Type } from "@google/genai";
import { SymptomAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeSymptoms = async (symptoms: string): Promise<SymptomAnalysisResult> => {
  if (!apiKey) {
    console.warn("API Key not found, returning mock response");
    return {
      recommendedSpecialist: "General Physician",
      reasoning: "API Key missing. Defaulting to General Physician."
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Patient symptoms: ${symptoms}. 
      Based on these symptoms, recommend the SINGLE most appropriate medical specialization from this list: 
      [Cardiologist, Neurologist, Pediatrician, Dermatologist, Orthopedic, General Physician].
      Also provide a one sentence reasoning.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedSpecialist: { type: Type.STRING },
            reasoning: { type: Type.STRING },
          },
          required: ["recommendedSpecialist", "reasoning"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return result as SymptomAnalysisResult;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      recommendedSpecialist: "General Physician",
      reasoning: "We could not analyze your symptoms at this time. Please see a General Physician."
    };
  }
};