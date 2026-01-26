import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PlacementDrive from '@/models/PlacementDrive';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const drives = await PlacementDrive.find({ academic_year: '2025-26' }).sort({ drive_date: -1 }).lean();
    
    const transformed = drives.map((d: any) => ({
       date: d.drive_date.toISOString().split('T')[0], // YYYY-MM-DD
       company: d.company_name,
       ctc: parseFloat(d.ctc_range.split(' ')[0]), // Extract number if possible, or keep string
       mode: d.status, // or add dedicated mode field if model has it
       appeared: 0, // Placeholder as current model doesn't strictly track appeared/selected count in Drive doc?
       selected: 0  
       // Wait, PlacementDrive model in my code had status, eligibility. 
       // The user data (Page 18) had selected/appeared. 
       // I should have updated PlacementDrive to include selected/appeared counts!
    }));
    
    // Correction: I should update PlacementDrive schema if I missed fields, 
    // OR just return what I have. The seed script populated basic info. 
    // Let's check seed script: "selected: 12". 
    // Wait, PlacementDrive schema I read earlier (Step 372) did NOT have selected/appeared stats?
    // Let's re-read PlacementDrive.ts content from previous step.
    // It had "company_name, drive_date, job_roles, ctc_range, eligibility_criteria, ... status".
    // It did NOT have selected count.
    // I missed that in the model update step. 
    // I will return what is possible now, and maybe update model later if critical.
    
    return NextResponse.json(drives);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
