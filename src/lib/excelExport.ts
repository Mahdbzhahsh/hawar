import * as XLSX from 'xlsx';
import { Patient } from '@/app/context/PatientContext';

export const exportToExcel = (patients: Patient[], fileName: string = 'patients-data') => {
  // Create a worksheet from the patient data
  const worksheet = XLSX.utils.json_to_sheet(
    patients.map(patient => ({
      'Name': patient.name,
      'Age': patient.age,
      'Hospital File Number': patient.hospitalFileNumber,
      'Mobile Number': patient.mobileNumber,
      'Sex': patient.sex,
      'Age of Diagnosis': patient.ageOfDiagnosis,
      'Diagnosis': patient.diagnosis,
      'Treatment': patient.treatment,
      'Current Treatment': patient.currentTreatment,
      'Clinic ID': patient.clinicId,
      'Response': patient.response,
      'Note': patient.note,
      'Image URL': patient.imageUrl,
      'Created At': new Date(patient.createdAt).toLocaleDateString()
    }))
  );

  // Set column widths for better readability
  const columnWidths = [
    { wch: 20 }, // Name
    { wch: 5 },  // Age
    { wch: 15 }, // Hospital File Number
    { wch: 15 }, // Mobile Number
    { wch: 8 },  // Sex
    { wch: 10 }, // Age of Diagnosis
    { wch: 25 }, // Diagnosis
    { wch: 25 }, // Treatment
    { wch: 25 }, // Current Treatment
    { wch: 10 }, // Clinic ID
    { wch: 15 }, // Response
    { wch: 30 }, // Note
    { wch: 40 }, // Image URL
    { wch: 12 }  // Created At
  ];
  worksheet['!cols'] = columnWidths;

  // Create a workbook and add the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients');

  // Generate the Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}; 