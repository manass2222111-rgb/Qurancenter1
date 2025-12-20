
import { Student } from '../types';

const SHEET_ID = '1idfCJE2jQLzZzIyU8C0JN0Na0PxfoKq-mAP6_7Pz-L4';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`;

/**
 * وظيفة لتحليل صف CSV مع مراعاة النصوص الموجودة داخل علامات الاقتباس
 */
const parseCSVRow = (row: string): string[] => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

export const fetchSheetData = async (): Promise<Student[]> => {
  try {
    const response = await fetch(CSV_URL);
    
    if (!response.ok) {
      throw new Error(`فشل الاتصال بجدول البيانات: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('text/csv') && !contentType.includes('application/octet-stream')) {
      throw new Error('الملف المستلم ليس بتنسيق CSV. تأكد أن الجدول "عام" (Anyone with the link can view).');
    }

    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    // تخطي السطر الأول (العناوين)
    const dataRows = lines.slice(1);
    
    return dataRows.map((line) => {
      const row = parseCSVRow(line);
      return {
        id: row[0] || '',
        name: row[1] || '',
        nationality: row[2] || '',
        dob: row[3] || '',
        phone: row[4] || '',
        age: row[5] || '',
        qualification: row[6] || '',
        job: row[7] || '',
        address: row[8] || '',
        regDate: row[9] || '',
        level: row[10] || '',
        part: row[11] || '',
        nationalId: row[12] || '',
        category: row[13] || '',
        period: row[14] || '',
        expiryId: row[15] || '',
        teacher: row[16] || '',
        fees: row[17] || '',
        circle: row[18] || '',
        completion: row[19] || '',
      };
    });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error; // نمرر الخطأ ليتم التعامل معه في الواجهة
  }
};
