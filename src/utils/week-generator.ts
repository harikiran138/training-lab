/**
 * Week Generator Utility for CRT Analytics
 * Supports future updates till 03-02-2027
 */

export interface WeekData {
  week_no: number;
  start_date: Date;
  end_date: Date;
  label: string;
}

export const generateWeeks = (startDate: Date, endDate: Date): WeekData[] => {
  const weeks: WeekData[] = [];
  const currentStart = new Date(startDate);
  let weekNo = 1;

  while (currentStart < endDate) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentStart.getDate() + 5); // 6 days including start (Mon-Sat)

    weeks.push({
      week_no: weekNo,
      start_date: new Date(currentStart),
      end_date: new Date(currentEnd),
      label: `Week ${weekNo}`,
    });

    // Move to next Monday
    currentStart.setDate(currentStart.getDate() + 7);
    weekNo++;
  }

  return weeks;
};

// Default seed parameters
export const SEED_START_DATE = new Date('2025-11-24');
export const SEED_END_DATE = new Date('2027-02-03');
