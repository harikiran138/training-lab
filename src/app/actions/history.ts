'use server';

import StagingData from '@/models/StagingData';
import dbConnect from '@/lib/mongodb';

export async function getUploadHistory(page = 1, limit = 20) {
    try {
        await dbConnect();
        const skip = (page - 1) * limit;

        const history = await StagingData.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await StagingData.countDocuments();

        return {
            success: true,
            data: JSON.parse(JSON.stringify(history)),
            total,
            pages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Error fetching history:', error);
        return { success: false, data: [], total: 0, pages: 0 };
    }
}
