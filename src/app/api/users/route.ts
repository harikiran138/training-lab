import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import { logAction } from '@/services/audit';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getSession();

        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const users = await User.find({}, { password: 0 }).sort({ name: 1 }).lean();
        return NextResponse.json({ success: true, data: users });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getSession();

        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { userId, branches, role, active } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (branches !== undefined) updateData.branches = branches;
        if (role !== undefined) updateData.role = role;
        if (active !== undefined) updateData.active = active;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, select: '-password' }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await logAction(
            session.id,
            'UPDATE_USER_PERMISSIONS',
            'User',
            updatedUser._id.toString(),
            { updatedFields: Object.keys(updateData) }
        );

        return NextResponse.json({ success: true, data: updatedUser });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
