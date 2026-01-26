export type SchemaField = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'percent' | 'select' | 'readOnly' | 'textarea';
  isCalculated?: boolean;
  calculate?: (row: any) => any;
};

export type TableSchema = {
  id: string;
  name: string;
  description: string;
  category: 'CRT' | 'Placement' | 'Assessment' | 'Strategic';
  fields: SchemaField[];
  defaultData: any[];
};

export const INSTITUTIONAL_SCHEMAS: Record<string, TableSchema> = {
  // 1. ATTENDANCE (CORE)
  crt_attendance: {
    id: 'crt_attendance',
    name: 'CRT Attendance Log',
    category: 'CRT',
    description: 'Day-wise attendance tracking for training sessions',
    fields: [
      { key: 'branch_code', label: 'Branch Code', type: 'text' },
      { key: 'total_strength', label: 'Total Strength', type: 'number' },
      { key: 'day1_attended', label: 'Day 1', type: 'number' },
      { key: 'day2_attended', label: 'Day 2', type: 'number' },
      { key: 'day3_attended', label: 'Day 3', type: 'number' },
      { key: 'day4_attended', label: 'Day 4', type: 'number' },
      { key: 'day5_attended', label: 'Day 5', type: 'number' },
      { key: 'day6_attended', label: 'Day 6', type: 'number' },
    ],
    defaultData: []
  },

  // 2. ASSESSMENT SERIES
  assessment_weekly: {
    id: 'assessment_weekly',
    name: 'Assessment Series',
    category: 'Assessment',
    description: 'Weekly branch-wise exam performance',
    fields: [
      { key: 'branch', label: 'Branch', type: 'text' },
      { key: 'week', label: 'Week', type: 'number' },
      { key: 'type', label: 'Exam Type', type: 'text' },
      { key: 'appeared', label: 'Appeared', type: 'number' },
      { key: 'pass_percent', label: 'Pass %', type: 'percent' }
    ], // Placeholder for Fixed Form
    defaultData: []
  },

  // 3. CAREER PATH
  student_career: {
    id: 'student_career',
    name: 'Career Path Log',
    category: 'Strategic',
    description: 'Student career goal evolution',
    fields: [],
    defaultData: []
  },

  // 4. ASSETS (LAPTOPS)
  student_asset: {
    id: 'student_asset',
    name: 'Laptop Asset Registry',
    category: 'Strategic', // Categorized under Strategic/Ops
    description: 'Device allocation and health status',
    fields: [
      { key: 'branch', label: 'Branch', type: 'text' },
      { key: 'total_strength', label: 'Total Strength', type: 'number' },
      { key: 'laptop_available', label: 'Allocated', type: 'number' },
      { key: 'laptop_not_available', label: 'Unallocated', type: 'number' }
    ],
    defaultData: []
  },

  // 5. SYLLABUS
  syllabus_log: {
    id: 'syllabus_log',
    name: 'Syllabus Time-Series',
    category: 'CRT',
    description: 'Module completion tracking',
    fields: [],
    defaultData: []
  },

  // 6. FEEDBACK
  student_feedback: {
    id: 'student_feedback',
    name: 'Feedback Loops',
    category: 'Strategic',
    description: 'Weekly satisfaction indices',
    fields: [],
    defaultData: []
  },

  // 7. CONCLUSION
  program_conclusion: {
    id: 'program_conclusion',
    name: 'Exec. Conclusion',
    category: 'Strategic', // The "Overall Conclusion"
    description: 'High-level executive summary',
    fields: [],
    defaultData: []
  },

  // PLACEMENT (CORE)
  placement_summary: {
    id: 'placement_summary',
    name: 'Placement Summary',
    category: 'Placement',
    description: 'Track placement drive details including company, CTC, and selection stats.',
    fields: [
       { key: 'date', label: 'Date', type: 'text' },
       { key: 'company', label: 'Company', type: 'text' },
       { key: 'ctc', label: 'CTC (LPA)', type: 'number' },
       { key: 'mode', label: 'Mode', type: 'text' },
       { key: 'appeared', label: 'Appeared', type: 'number' },
       { key: 'selected', label: 'Selected', type: 'number' }
    ],
    defaultData: [
      { date: '2026-01-15', company: 'Amazon', ctc: 18.0, mode: 'Online', appeared: 450, selected: 12 },
      { date: '2026-01-22', company: 'TCS Ninja', ctc: 3.6, mode: 'Offline', appeared: 820, selected: 145 }
    ]
  },

  // 4. ASSESSMENT REGISTRATION STATUS
  'registration_status': {
    id: 'registration_status',
    name: 'Registration Status',
    category: 'Assessment',
    description: 'Tracking student onboarding & platform precision.',
    fields: [
        { key: 'branch', label: 'Branch Code', type: 'text' },
        { key: 'strength', label: 'Total Strength', type: 'number' },
        { key: 'reg_d1', label: 'Reg (Day 1)', type: 'number' },
        { key: 'reg_final', label: 'Reg (Final)', type: 'number' },
        { 
            key: 'not_reg', 
            label: 'Pending', 
            type: 'readOnly',
            calculate: (row) => Math.max(0, (row.strength || 0) - (row.reg_final || 0))
        },
        { 
            key: 'percent', 
            label: 'Reg %', 
            type: 'readOnly',
            calculate: (row) => row.strength > 0 ? Math.round((row.reg_final / row.strength) * 100) : 0
        }
    ],
    defaultData: [
        { branch: 'CSE-A', strength: 71, reg_d1: 45, reg_final: 71 },
        { branch: 'ECE-B', strength: 68, reg_d1: 12, reg_final: 52 }
    ]
  },

  // 5. ASSESSMENT PERFORMANCE
  'assessment_performance': {
    id: 'assessment_performance',
    name: 'Assessment Performance',
    category: 'Assessment',
    description: 'Participation and outcome tracking of weekend tests.',
    fields: [
      { key: 'branch', label: 'Branch', type: 'text' },
      { key: 'onboarded', label: 'LMS Onboarded', type: 'number' },
      { key: 'appeared', label: 'Test Taken', type: 'number' },
      { key: 'passed', label: 'Passed', type: 'number' },
      { 
        key: 'fail', 
        label: 'Not Passed', 
        type: 'readOnly',
        calculate: (row) => Math.max(0, (row.appeared || 0) - (row.passed || 0))
      },
      { 
        key: 'pass_percent', 
        label: 'Pass %', 
        type: 'readOnly',
        calculate: (row) => row.appeared > 0 ? Math.round((row.passed / row.appeared) * 100) : 0
      }
    ],
    defaultData: [
      { branch: 'CSE', onboarded: 180, appeared: 175, passed: 142 },
      { branch: 'ECE', onboarded: 140, appeared: 110, passed: 56 }
    ]
  },

  // 6. SWOT ANALYSIS
  'swot_analysis': {
    id: 'swot_analysis',
    name: 'SWOT Analysis',
    category: 'Strategic',
    description: 'Qualitative analysis for board-level strategic planning.',
    fields: [
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'points', label: 'Key Points', type: 'textarea' }
    ],
    defaultData: []
  },

  // 7. GENERIC TIME-SERIES
  'generic_tracking': {
    id: 'generic_tracking',
    name: 'Historical Tracking',
    category: 'Strategic',
    description: 'Custom metric tracking across 30-day/monthly cycles.',
    fields: [
        { key: 'metric', label: 'Target Metric', type: 'text' },
        { key: 'prev', label: 'Previous Cycle', type: 'number' },
        { key: 'current', label: 'Current Cycle', type: 'number' },
        { 
            key: 'growth', 
            label: 'Growth %', 
            type: 'readOnly',
            calculate: (row) => row.prev > 0 ? Math.round(((row.current - row.prev) / row.prev) * 100) : 0
        }
    ],
    defaultData: [
        { metric: 'Placement Enrolments', prev: 450, current: 520 },
        { metric: 'Certification Passes', prev: 85, current: 112 }
    ]
  }
};
