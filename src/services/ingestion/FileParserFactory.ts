import { BaseParser } from './BaseParser';
import { ExcelParser } from './ExcelParser';

export class FileParserFactory {
  static getParser(mimeType: string, fileName: string): BaseParser {
    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      mimeType === 'application/vnd.ms-excel' ||
      fileName.endsWith('.xlsx') || 
      fileName.endsWith('.xls') ||
      fileName.endsWith('.csv')
    ) {
      return new ExcelParser();
    }

    // Logic for PDF or Images would go here
    // return new PDFParser();
    
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
