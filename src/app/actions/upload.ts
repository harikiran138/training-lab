'use server';

import { model } from '@/lib/ai/client';
import StagingData from '@/models/StagingData';
import dbConnect from '@/lib/mongodb';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { z } from 'zod'; // Keeping zod import for future validation refinement if needed

export async function uploadImage(formData: FormData) {
    try {
        await dbConnect();

        const file = formData.get('file') as File;
        const type = formData.get('type') as string;
        const branch_code = formData.get('branch_code') as string | undefined;
        const section = formData.get('section') as string | undefined;
        const week_no = formData.get('week_no') ? Number(formData.get('week_no')) : undefined;
        const semester = formData.get('semester') as string | undefined;

        if (!file) {
            return { success: false, error: 'No file uploaded' };
        }

        // 1. Save File Locally (for preview)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (e) {
            // Ignore error if directory exists
        }

        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const filepath = path.join(uploadsDir, filename);
        await writeFile(filepath, buffer);

        const imageUrl = `/uploads/${filename}`;

        // 2. Process with AI
        const base64Image = buffer.toString('base64');

        const prompt = `Extract tabular data from this ${type} image.
    Return a strictly valid JSON object containing a single key "records".
    "records" must be an array of objects.
    Each object in the array must have two keys:
    1. "data": an object containing the extracted key-value pairs for that row (e.g., {"roll_no": "123", "name": "John", "status": "P"}). Keys should be normalized to snake_case.
    2. "confidence": an object containing a confidence score (number between 0.0 and 1.0) for EACH key in "data".
    
    Ensure all text is extracted accurately. If a field is illegible, report it with low confidence.
    Do not wrap the JSON in markdown code blocks. Just return the raw JSON string.
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

        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        let aiData;
        try {
            aiData = JSON.parse(responseText);
        } catch (e) {
            console.error("AI Response Parsing Error:", responseText);
            return { success: false, error: 'Failed to parse AI response' };
        }

        const records = Array.isArray(aiData.records) ? aiData.records : [];

        // 3. Save to Staging DB
        const stagingDoc = await StagingData.create({
            type: type || 'ATTENDANCE', // Default or from form
            status: 'DRAFT',
            imageUrl,
            rawAiOutput: aiData,
            structuredData: records.map((r: any) => ({
                data: r.data || {},
                confidence: r.confidence || {},
                userVerified: false
            })),
            branch_code,
            section,
            week_no,
            semester
        });

        return { success: true, redirectUrl: `/staging/${stagingDoc._id}` };

    } catch (error) {
        console.error("Upload Action Error:", error);
        return { success: false, error: 'Internal Server Error' };
    }
}
