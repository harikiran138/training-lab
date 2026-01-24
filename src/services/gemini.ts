import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateAcademicInsight(prompt: string) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}

/**
 * Generates structured JSON insight for a student or class
 */
export async function generateStructuredInsight(data: any, type: 'Student' | 'Class' | 'Placement') {
  const basePrompt = `
    You are an Academic & Career Intelligence Engine. 
    Analyze the following ${type} data and provide a structured JSON response.
    Data: ${JSON.stringify(data)}
    
    Response Format:
    {
      "insight": "overall summary",
      "action_items": [{"task": "string", "priority": "Low/Medium/High"}],
      "risk_level": "None/Low/Medium/High",
      "priority_score": 0.0 to 1.0
    }
  `;

  try {
    const result = await model.generateContent(basePrompt);
    const text = result.response.text();
    // Basic JSON extraction (Gemini often wraps in ```json)
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Structured Insight Error:", error);
    return null;
  }
}
