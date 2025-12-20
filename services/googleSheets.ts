
import { Student } from '../types';

const SHEET_ID = '1idfCJE2jQLzZzIyU8C0JN0Na0PxfoKq-mAP6_7Pz-L4';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`;

export const fetchSheetData = async (): Promise<Student[]> => {
  try {
    const response = await fetch(CSV_URL);
    const csvText = await response.text();
    
    // Simplistic CSV parser (could use PapaParse if available)
    // We handle the header and basic structure based on the provided data
    const rows = csvText.split('\n').map(row => {
      // Handle commas inside quotes
      const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      return matches ? matches.map(m => m.replace(/^"|"$/g, '')) : [];
    });

    // Skip header row
    const dataRows = rows.slice(1);
    
    return dataRows.filter(row => row.length >= 2).map((row) => ({
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
    }));
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return [];
  }
};
