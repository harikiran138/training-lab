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
  // 1. CRT TRAINING ATTENDANCE
  'crt_attendance': {
    id: 'crt_attendance',
    name: 'CRT Attendance',
    category: 'CRT',
    description: 'Daily training participation tracking (D1-D6).',
    fields: [
      { key: 'branch', label: 'Branch Code', type: 'text' },
      { key: 'strength', label: 'Total Strength', type: 'number' },
      { key: 'd1', label: 'Day 1', type: 'number' },
      { key: 'd2', label: 'Day 2', type: 'number' },
      { key: 'd3', label: 'Day 3', type: 'number' },
      { key: 'd4', label: 'Day 4', type: 'number' },
      { key: 'd5', label: 'Day 5', type: 'number' },
      { key: 'd6', label: 'Day 6', type: 'number' },
      { 
        key: 'avg', 
        label: 'Weekly Avg %', 
        type: 'readOnly', 
        calculate: (row) => {
          const days = [row.d1, row.d2, row.d3, row.d4, row.d5, row.d6].filter(d => typeof d === 'number');
          if (days.length === 0) return 0;
          const sum = days.reduce((a, b) => a + b, 0);
          return Math.round((sum / (days.length * (row.strength || 1))) * 100);
        }
      }
    ],
    defaultData: [
      { branch: 'CSE-A', strength: 71, d1: 46, d2: 49, d3: 44, d4: 50, d5: 52, d6: 48 },
      { branch: 'CSE-B', strength: 70, d1: 26, d2: 40, d3: 45, d4: 48, d5: 53, d6: 50 }
    ]
  },

  // 2. PLACEMENTS SUMMARY ANALYSIS (YEARLY)
  'placement_summary': {
    id: 'placement_summary',
    name: 'Placement Summary',
    category: 'Placement',
    description: 'Executive overview of institutional placement performance.',
    fields: [
      { key: 'branch', label: 'Dept / Branch', type: 'text' },
      { key: 'students', label: 'No. of Students', type: 'number' },
      { key: 'enrolled', label: 'Enrolled', type: 'number' },
      { key: 'offers', label: 'Offers', type: 'number' },
      { key: 'placed', label: 'Placed Students', type: 'number' },
      { key: 'drives', label: 'No. of Drives', type: 'number' },
      { key: 'max_ctc', label: 'Max CTC (LPA)', type: 'number' },
      { 
        key: 'placement_percent', 
        label: '% Placed', 
        type: 'readOnly',
        calculate: (row) => row.enrolled > 0 ? Math.round((row.placed / row.enrolled) * 100) : 0
      }
    ],
    defaultData: [
      { branch: 'CSE', students: 180, enrolled: 175, offers: 210, placed: 165, drives: 42, max_ctc: 12.5 },
      { branch: 'ECE', students: 140, enrolled: 130, offers: 115, placed: 98, drives: 35, max_ctc: 8.2 }
    ]
  },

  // 3. PLACEMENT DRIVE LOG
  'drive_log': {
    id: 'drive_log',
    name: 'Placement Drive Log',
    category: 'Placement',
    description: 'Operational tracking of every placement drive event.',
    fields: [
      { key: 'date', label: 'Date of Drive', type: 'text' },
      { key: 'company', label: 'Company Name', type: 'text' },
      { key: 'ctc', label: 'CTC (LPA)', type: 'number' },
      { key: 'mode', label: 'Mode (On/Off)', type: 'text' },
      { key: 'appeared', label: 'Total Appeared', type: 'number' },
      { key: 'selected', label: 'Total Selected', type: 'number' },
      { 
        key: 'success_rate', 
        label: 'Success %', 
        type: 'readOnly',
        calculate: (row) => row.appeared > 0 ? Math.round((row.selected / row.appeared) * 100) : 0
      }
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
        { key: 'factor', label: 'Academic Segment', type: 'text' },
        { key: 'strengths', label: 'Strengths', type: 'textarea' },
        { key: 'weaknesses', label: 'Weaknesses', type: 'textarea' },
        { key: 'opportunities', label: 'Opportunities', type: 'textarea' },
        { key: 'threats', label: 'Threats', type: 'textarea' }
    ],
    defaultData: [
        { factor: 'CRT Program', strengths: 'Consistent faculty engagement', weaknesses: 'Absence of daily labs', opportunities: 'New platform tie-ups', threats: 'Declining student focus' }
    ]
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
