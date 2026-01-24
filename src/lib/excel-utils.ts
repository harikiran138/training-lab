import * as XLSX from 'xlsx';

export const parseExcel = async (file: File): Promise<{ sheetNames: string[], workbook: XLSX.WorkBook }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                resolve({ sheetNames: workbook.SheetNames, workbook });
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
};

export const getSheetData = (workbook: XLSX.WorkBook, sheetName: string): { headers: string[], data: any[] } => {
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (jsonData.length === 0) {
        return { headers: [], data: [] };
    }

    const headers = jsonData[0] as string[];
    const rawObjects = XLSX.utils.sheet_to_json(sheet);
    return { headers, data: rawObjects };
};

export const validateRows = (data: any[], mapping: Record<string, string>, schema: any[]) => {
    const valid: any[] = [];
    const invalid: any[] = [];

    data.forEach((row, index) => {
        const mappedRow: any = {};
        const errors: string[] = [];

        // 1. Map fields
        for (const [targetKey, sourceHeader] of Object.entries(mapping)) {
            if (sourceHeader) {
                // Handle nested keys like 'attendance.avg_attendance_percent'
                // For simple object construction we can just assign, but better to un-flatten if needed
                // BUT wait, our API expects nested objects.

                // Let's store flat for now and unflatten at submission? 
                // Or unflatten here.
                setNestedValue(mappedRow, targetKey, row[sourceHeader]);
            }
        }

        // 2. Validate against schema
        schema.forEach(field => {
            const val = getNestedValue(mappedRow, field.key);

            // Required check
            if (field.required && (val === undefined || val === null || val === '')) {
                errors.push(`${field.label} is required`);
            }

            // Type/Range check (simple number check)
            if (field.type === 'number' && val !== undefined && val !== '') {
                const num = Number(val);
                if (isNaN(num)) {
                    errors.push(`${field.label} must be a number`);
                } else {
                    if (field.min !== undefined && num < field.min) errors.push(`${field.label} cannot be less than ${field.min}`);
                    if (field.max !== undefined && num > field.max) errors.push(`${field.label} cannot be more than ${field.max}`);
                }
            }
        });

        if (errors.length > 0) {
            invalid.push({ row, errors, index });
        } else {
            valid.push(mappedRow);
        }
    });

    return { valid, invalid };
};

// Helper for 'attendance.avg_attendance' -> obj['attendance']['avg_attendance']
const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
};

const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}
