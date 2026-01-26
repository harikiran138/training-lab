import CrtAttendanceRecord from '@/models/CrtAttendanceRecord';
import AssessmentWeekly from '@/models/AssessmentWeekly';
import StudentCareerLog from '@/models/StudentCareerLog';
import StudentAsset from '@/models/StudentAsset';
import SyllabusLog from '@/models/SyllabusLog';
import StudentFeedbackWeekly from '@/models/StudentFeedbackWeekly';
import ProgramConclusion from '@/models/ProgramConclusion';
import dbConnect from '@/lib/mongodb';

export interface DataHealthStatus {
  domain_id: string;
  name: string;
  status: 'active' | 'pending' | 'critical';
  last_updated: Date | null;
  record_count: number;
}

export class DataAvailabilityService {
  /**
   * Checks the pulse of all 7 institutional operational domains.
   */
  static async getSystemHealth(): Promise<DataHealthStatus[]> {
    await dbConnect();
    
    // 1. Attendance
    const attCount = await CrtAttendanceRecord.countDocuments();
    const attLast = await CrtAttendanceRecord.findOne().sort({ createdAt: -1 });

    // 2. Assessment
    const assCount = await AssessmentWeekly.countDocuments();
    const assLast = await AssessmentWeekly.findOne().sort({ createdAt: -1 });

    // 3. Career Path
    const careerCount = await StudentCareerLog.countDocuments();
    const careerLast = await StudentCareerLog.findOne().sort({ createdAt: -1 });

    // 4. Laptops (Assets)
    const assetCount = await StudentAsset.countDocuments();
    const assetLast = await StudentAsset.findOne().sort({ createdAt: -1 });

    // 5. Syllabus
    const sylCount = await SyllabusLog.countDocuments();
    const sylLast = await SyllabusLog.findOne().sort({ createdAt: -1 });

    // 6. Feedback
    const fbCount = await StudentFeedbackWeekly.countDocuments();
    const fbLast = await StudentFeedbackWeekly.findOne().sort({ createdAt: -1 });

    // 7. Conclusion
    const concCount = await ProgramConclusion.countDocuments();
    const concLast = await ProgramConclusion.findOne().sort({ createdAt: -1 });

    return [
      {
        domain_id: 'attendance',
        name: 'Attendance Stream',
        status: attCount > 0 ? 'active' : 'pending',
        last_updated: attLast?.updatedAt || null,
        record_count: attCount
      },
      {
        domain_id: 'assessment',
        name: 'Assessment Series',
        status: assCount > 0 ? 'active' : 'pending',
        last_updated: assLast?.createdAt || null,
        record_count: assCount
      },
      {
        domain_id: 'career',
        name: 'Career Path Log',
        status: careerCount > 0 ? 'active' : 'pending',
        last_updated: careerLast?.createdAt || null,
        record_count: careerCount
      },
      {
        domain_id: 'assets',
        name: 'Laptop Registry',
        status: assetCount > 0 ? 'active' : 'pending',
        last_updated: assetLast?.updatedAt || null,
        record_count: assetCount
      },
      {
        domain_id: 'syllabus',
        name: 'Syllabus Coverage',
        status: sylCount > 0 ? 'active' : 'pending',
        last_updated: sylLast?.createdAt || null,
        record_count: sylCount
      },
      {
        domain_id: 'feedback',
        name: 'Student Feedback',
        status: fbCount > 0 ? 'active' : 'pending',
        last_updated: fbLast?.createdAt || null,
        record_count: fbCount
      },
      {
        domain_id: 'conclusion',
        name: 'Exec. Conclusion',
        status: concCount > 0 ? 'active' : 'pending',
        last_updated: concLast?.createdAt || null,
        record_count: concCount
      }
    ];
  }
}
