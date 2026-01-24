'use server';

import StagingData from '@/models/StagingData';
import dbConnect from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';

export async function rejectUpload(stagingId: string) {
    try {
        await dbConnect();
        const stagingDoc = await StagingData.findById(stagingId);
        if (!stagingDoc) {
            return { success: false, error: 'Staging data not found' };
        }

        stagingDoc.status = 'REJECTED';
        await stagingDoc.save();

        revalidatePath('/upload');
        return { success: true };
    } catch (error) {
        console.error('Error rejecting upload:', error);
        return { success: false, error: 'Failed to reject data' };
    }
}
