'use server';

import Branch from '@/models/Branch';
import Week from '@/models/Week';
import dbConnect from '@/lib/mongodb';

export async function getUploadMetadata() {
    try {
        await dbConnect();
        const branches = await Branch.find({ deleted_at: null }).select('branch_code branch_name').lean();
        const weeks = await Week.find().sort({ week_no: 1 }).lean();

        return {
            success: true,
            branches: JSON.parse(JSON.stringify(branches)),
            weeks: JSON.parse(JSON.stringify(weeks))
        };
    } catch (error) {
        console.error('Error fetching metadata:', error);
        return { success: false, branches: [], weeks: [] };
    }
}
