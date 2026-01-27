import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Announcement from '@/models/Announcement';
import { logAudit } from '@/lib/audit-logger';

// Mock User Context (In real app, get from session/token)
const MOCK_USER = {
  id: 'admin_001',
  role: 'Admin'
};

export async function GET() {
  try {
    await dbConnect();
    const announcements = await Announcement.find({ is_active: true }).sort({ createdAt: -1 });
    
    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { title, message, target_audience, type, priority, expiry_date } = body;

    // Validation
    if (!title || !message) {
      return NextResponse.json({ error: 'Title and Message are required' }, { status: 400 });
    }

    const newAnnouncement = new Announcement({
      title,
      message,
      target_audience: target_audience || ['All'],
      type: type || 'General',
      priority: priority || 'Normal',
      expiry_date,
      created_by: MOCK_USER.id
    });

    await newAnnouncement.save();

    // AUDIT LOG
    await logAudit({
      userId: MOCK_USER.id,
      role: MOCK_USER.role,
      action: 'CREATE',
      tableName: 'Announcement',
      recordId: newAnnouncement.announcement_id,
      newValue: { title, message },
      details: `Created new announcement: ${title}`
    });

    return NextResponse.json({ success: true, data: newAnnouncement }, { status: 201 });

  } catch (error) {
    console.error("Failed to create announcement:", error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
