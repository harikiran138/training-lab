'use server';

import StagingData from '@/models/StagingData';
import Attendance from '@/models/Attendance';
import CRTWeeklyReport from '@/models/CRTWeeklyReport';
import dbConnect from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { refreshAggregateSummary } from '@/services/aggregation';

export async function confirmUpload(stagingId: string, confirmedData: any[]) {
    try {
        await dbConnect();

        const stagingDoc = await StagingData.findById(stagingId);
        if (!stagingDoc) {
            return { success: false, error: 'Staging data not found' };
        }

        if (stagingDoc.status === 'PROCESSED') {
            return { success: false, error: 'Data already processed' };
        }

        const date = new Date();
        const finalRecords = confirmedData.map(item => ({
            studentId: item.data.studentId,
            name: item.data.name,
            status: item.data.status?.toUpperCase() || 'PRESENT',
            score: parseFloat(item.data.score) || undefined,
            date: date,
            sourceStagingId: stagingDoc._id
        }));

        // Insert into Attendance
        await Attendance.insertMany(finalRecords);

        // --- INTEGATION LOGIC START ---
        if (stagingDoc.branch_code && stagingDoc.week_no) {
            // Calculate averages for this sheet
            const attendanceCount = finalRecords.length;
            const presentCount = finalRecords.filter(r => r.status === 'PRESENT').length;
            const attendancePercent = attendanceCount > 0 ? (presentCount / attendanceCount) * 100 : 0;

            const scoredRecords = finalRecords.filter(r => r.score !== undefined);
            const passCount = scoredRecords.filter(r => (r.score || 0) >= 40).length; // Assuming 40 is pass
            const passPercent = scoredRecords.length > 0 ? (passCount / scoredRecords.length) * 100 : 0;
            const testAttendancePercent = attendanceCount > 0 ? (scoredRecords.length / attendanceCount) * 100 : 0;

            // Update CRTWeeklyReport
            // Note: In a real system, we might want to UPSERT or contribute to existing averages.
            // For now, we'll assume this upload IS the data for this branch/week/section.
            await CRTWeeklyReport.findOneAndUpdate(
                {
                    branch_code: stagingDoc.branch_code,
                    week_no: stagingDoc.week_no,
                    section: stagingDoc.section || 'A',
                    semester: stagingDoc.semester || 'SEM1'
                },
                {
                    $set: {
                        "attendance.avg_attendance_percent": attendancePercent,
                        "tests.avg_test_attendance_percent": testAttendancePercent,
                        "tests.avg_test_pass_percent": passPercent,
                        status: 'finalized' // Auto-finalize since it's verified from image
                    }
                },
                { upsert: true }
            );

            // Refresh global aggregate summary
            await refreshAggregateSummary(stagingDoc.branch_code);
        }
        // --- INTEGATION LOGIC END ---

        // Update Staging status
        stagingDoc.status = 'PROCESSED';
        // Optionally update the structuredData with the final user-edited version
        stagingDoc.structuredData = confirmedData.map(item => ({
            data: new Map(Object.entries(item.data)),
            confidence: new Map(Object.entries(item.confidence || {})),
            userVerified: true
        }));

        await stagingDoc.save();

        revalidatePath('/upload');

        return { success: true };

    } catch (error) {
        console.error('Error confirming upload:', error);
        return { success: false, error: 'Failed to confirm data' };
    }
}
