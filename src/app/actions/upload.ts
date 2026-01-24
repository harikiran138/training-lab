'use server';

import { model } from '@/lib/ai/client';
import StagingData from '@/models/StagingData';
import dbConnect from '@/lib/mongodb';
import { z } from 'zod';

// Schema for the AI output we expect
const AIResponseSchema = z.object({
    records: z.array(z.object({
        data: z.record(z.string(), z.any()),
        confidence: z.record(z.string(), z.number())
    }))
});

export async function processImageUpload(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        const type = formData.get('type') as string;
        const branch_code = formData.get('branch_code') as string;
        const section = formData.get('section') as string;
        const week_no = formData.get('week_no') ? parseInt(formData.get('week_no') as string) : undefined;
        const semester = formData.get('semester') as string;

        if (!file) {
            throw new Error('No file uploaded');
        }

        // Convert file to base64 for Gemini
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');

        // Prompt for Gemini
        const prompt = `
      Extract tabular data from this image. Return a JSON object with a "records" array.
      Each record should have:
      - "data": key-value pairs of the row data. Use specific keys like "studentId", "name", "score", "status".
      - "confidence": key-value pairs with a confidence score (0.0 to 1.0) for each field in "data".
      
      Example:
      {
        "records": [
          {
            "data": { "studentId": "123", "score": 95 },
            "confidence": { "studentId": 0.99, "score": 0.85 }
          }
        ]
      }
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: file.type
                }
            }
        ]);

        const response = await result.response;
        // Check if there is a response text to avoid empty response issues
        const text = response.text() || "{}";

        // Parse JSON (Gemini might wrap in Markdown code blocks)
        const jsonString = text.replace(/```json|```/g, '').trim();
        const parsedWait = JSON.parse(jsonString);

        // Validate with Zod
        const validatedData = AIResponseSchema.parse(parsedWait);

        // Re-mapping to Schema format
        const structuredData = validatedData.records.map(record => ({
            data: new Map(Object.entries(record.data)),
            confidence: new Map(Object.entries(record.confidence)),
            userVerified: false
        }));

        // Start DB Connection
        await dbConnect();

        // Create map for StagingData
        const stagingDoc = await StagingData.create({
            type: type || 'ATTENDANCE', // Default or from form
            status: 'DRAFT',
            imageUrl: base64Image, // Storing base64 for now
            branch_code,
            section,
            week_no,
            semester,
            rawAiOutput: validatedData,
            structuredData: structuredData
        });

        return {
            success: true,
            stagingId: stagingDoc._id.toString(),
            imageUrl: base64Image,
            data: validatedData
        };

    } catch (error) {
        console.error('Error processing image:', error);
        return { success: false, error: 'Failed to process image' };
    }
}
