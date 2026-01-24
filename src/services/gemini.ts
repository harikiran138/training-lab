import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Generates structured JSON insight for a specific entity type
 */
export async function generateStructuredInsight(data: any, type: 'Student' | 'Class' | 'Placement' | 'Department') {
  const prompt = `
    You are an AI Academic & Career Intelligence Engine. 
    Analyze the following ${type} data and provide a personalized, actionable intelligence report in valid JSON format.
    
    Data: ${JSON.stringify(data)}
    
    Analysis Rules:
    1. For Students: Focus on Placement Readiness Index (PRI), missing skills, and interview round success.
    2. For Classes: Focus on attendance drops, faculty impact, and syllabus velocity.
    3. For Departments: Focus on placement conversion and resource allocation (laptops, labs).
    
    Strict JSON Format:
    {
      "insight": "Concise summary (max 3 sentences)",
      "action_items": [
        {"task": "specific next step", "priority": "High/Medium/Low"}
      ],
      "risk_level": "High/Medium/Low/None",
      "priority_score": 0.0 to 1.0 (Higher means more urgent/ready)
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`AI Analysis Error (${type}):`, error);
    return null;
  }
}

export async function generateChatResponse(studentId: string, query: string, context: any) {
    // For the "AI Performance Analyst" chat component
    const prompt = `
        User Question: "${query}"
        Relevant Data Context: ${JSON.stringify(context)}
        
        Guidelines: Be encouraging but data-driven. Cites specific test scores or attendance where relevant.
    `;
    const result = await model.generateContent(prompt);
    return result.response.text();
}
