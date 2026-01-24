
export class DataNormalizer {
  static normalizeBranchCode(rawInput: string): string {
    if (!rawInput) return 'UNKNOWN';
    const normalized = rawInput.trim().toUpperCase();
    
    const mapping: { [key: string]: string } = {
      'ME': 'MECH',
      'MECHANICAL': 'MECH',
      'EEE': 'EEE',
      'ECE': 'ECE',
      'CSE': 'CSE',
      'CSM': 'CSM',
      'CSD': 'CSD',
      'CIVIL': 'CIVIL',
      'CE': 'CIVIL'
      // Add more mappings as needed
    };

    return mapping[normalized] || normalized;
  }

  static normalizePercent(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace('%', '').trim();
      return parseFloat(cleaned) || 0;
    }
    return 0;
  }

  static getRiskLevel(attendance: number, passPercent: number, syllabusCoverage: string | 'Lagging' | 'On-Track' | 'Ahead'): 'Healthy' | 'Needs Attention' | 'Critical' {
    let riskScore = 0;

    if (attendance < 65) riskScore += 2;
    else if (attendance < 75) riskScore += 1;

    if (passPercent < 50) riskScore += 2;
    else if (passPercent < 60) riskScore += 1;

    if (syllabusCoverage === 'Lagging') riskScore += 1;

    if (riskScore >= 3) return 'Critical';
    if (riskScore >= 1) return 'Needs Attention';
    return 'Healthy';
  }
}
