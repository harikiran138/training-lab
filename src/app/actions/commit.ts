'use server';

import dbConnect from '@/lib/mongodb';
import StagingData from '@/models/StagingData';
import Attendance from '@/models/Attendance';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function commitStagingData(stagingId: string, verifiedData: any[]) {
    try {
        await dbConnect();

        const stagingDoc = await StagingData.findById(stagingId);
        if (!stagingDoc) {
            return { success: false, error: 'Staging Record not found' };
        }

        if (stagingDoc.status === 'PROCESSED') {
            return { success: false, error: 'Data already processed' };
        }

        const type = stagingDoc.type;
        const processedRecords = [];
        const errors = [];

        for (const row of verifiedData) {
            const { data } = row;
            // Normalize keys for both Attendance and Assessment
            const rollNo = data.roll_no || data.rollno || data.student_id || data.id;
            const status = data.status || (type === 'ATTENDANCE' ? 'PRESENT' : undefined);
            const score = data.score || data.marks || data.result;

            if (!rollNo) {
                errors.push(`Row missing Roll No: ${JSON.stringify(data)}`);
                continue;
            }

            // Create record compatible with Attendance model
            const record = {
                studentId: rollNo,
                name: data.name || data.student_name,
                date: stagingDoc.createdAt || new Date(),
                status: status ? status.trim().toUpperCase() : 'PRESENT',
                score: score !== undefined ? Number(score) : undefined,
                sourceStagingId: stagingDoc._id,
            };

            processedRecords.push(record);
        }

        if (processedRecords.length > 0) {
            // Bulk Save to MongoDB
            await Attendance.insertMany(processedRecords);
        }

        // Update Staging Status to PROCESSED
        stagingDoc.status = 'PROCESSED';
        // Preserve the verified data in the staging record for audit
        stagingDoc.structuredData = verifiedData.map(v => ({
            ...v,
            userVerified: true
        }));

        await stagingDoc.save();

        revalidatePath(`/staging/${stagingId}`);
        revalidatePath('/upload/history');
        return { success: true, processedCount: processedRecords.length };

    } catch (error) {
        console.error("Commit Error:", error);
        return { success: false, error: 'Failed to commit data' };
    }
}
