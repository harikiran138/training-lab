import { createWorker } from 'tesseract.js';

export interface VisionExtractedData {
  branch?: string;
  strength?: number;
  days?: number[];
  confidence: number;
}

export class VisionIntelligenceService {
  /**
   * Performs high-fidelity OCR and NLP mapping to extract institutional data from images.
   */
  static async extractTableData(imageBuffer: Buffer): Promise<VisionExtractedData[]> {
    const worker = await createWorker('eng');
    
    // 1. OCR Stage
    const result = await worker.recognize(imageBuffer);
    const { text } = result.data;
    const lines = (result.data as any).lines || [];
    await worker.terminate();

    // 2. NLP Translation Stage (Heuristic mapping)
    const results: VisionExtractedData[] = [];

    // Common Institutional patterns: "CSE-A 70 65 60..."
    lines.forEach((line: any) => {
      const content = line.text.trim();
      if (!content) return;

      // Extract tokens using common delimiters
      const tokens = content.split(/[\s\t,]+/).filter((t: string) => t.length > 0);
      
      // Heuristic: If first token looks like a branch (e.g., CSE, ECE, IT)
      const branchMatch = tokens[0]?.match(/^[A-Z]{2,}(?:-[A-Z0-9])?$/i);
      if (branchMatch) {
        const numbers = tokens.slice(1).map((t: string) => parseInt(t)).filter((n: number) => !isNaN(n));
        
        if (numbers.length >= 1) {
          results.push({
            branch: tokens[0].toUpperCase(),
            strength: numbers[0],
            days: numbers.slice(1),
            confidence: line.confidence / 100
          });
        }
      }
    });

    // 3. Post-Process (Consolidation)
    return results.filter(r => r.branch && r.strength);
  }

  /**
   * Refines raw OCR text into a structured JSON payload for the institution.
   */
  static mapToCrtSchema(extracted: VisionExtractedData[]) {
    return extracted.map(e => ({
      branch: e.branch,
      strength: e.strength,
      d1: e.days?.[0] || 0,
      d2: e.days?.[1] || 0,
      d3: e.days?.[2] || 0,
      d4: e.days?.[3] || 0,
      d5: e.days?.[4] || 0,
      d6: e.days?.[5] || 0,
    }));
  }
}
