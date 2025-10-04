"use client";

import { useState, useEffect } from 'react';
import { Patient } from '../context/PatientContext';

interface PatientEditFormProps {
  patient: Patient;
  onSubmit: (data: Partial<Patient>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export default function PatientEditForm({ patient, onSubmit, onCancel, isLoading }: PatientEditFormProps) {
  const [formData, setFormData] = useState({
    name: patient.name,
    age: patient.age,
    hospitalFileNumber: patient.hospitalFileNumber,
    mobileNumber: patient.mobileNumber,
    sex: patient.sex,
    ageOfDiagnosis: patient.ageOfDiagnosis,
    diagnosis: patient.diagnosis,
    treatment: patient.treatment,
    currentTreatment: patient.currentTreatment || '',
    response: patient.response,
    note: patient.note || '',
    tableData: patient.tableData || '',
    imageUrl: patient.imageUrl || '',
    imaging: patient.imaging || '',
    ultrasound: patient.ultrasound || '',
    labText: patient.labText || '',
    report: patient.report || '',

    // clinicId is read-only, not included in editable form
  });
  
  // State for table cells with dynamic sizing (default 8x8)
  const [tableCells, setTableCells] = useState(
    Array(8).fill(null).map(() => Array(8).fill(''))
  );
  
  // Functions to add or remove rows/columns from the table
  const addTableRow = () => {
    const newRow = Array(tableCells[0].length).fill('');
    const newTableCells = [...tableCells, newRow];
    setTableCells(newTableCells);
    
    // Update tableData in formData
    const tableDataString = JSON.stringify(newTableCells);
    setFormData(prev => ({
      ...prev,
      tableData: tableDataString
    }));
  };
  
  const addTableColumn = () => {
    const newTableCells = tableCells.map(row => [...row, '']);
    setTableCells(newTableCells);
    
    // Update tableData in formData
    const tableDataString = JSON.stringify(newTableCells);
    setFormData(prev => ({
      ...prev,
      tableData: tableDataString
    }));
  };
  
  const removeTableRow = () => {
    if (tableCells.length <= 1) return; // Don't remove the last row
    
    const newTableCells = tableCells.slice(0, -1); // Remove the last row
    setTableCells(newTableCells);
    
    // Update tableData in formData
    const tableDataString = JSON.stringify(newTableCells);
    setFormData(prev => ({
      ...prev,
      tableData: tableDataString
    }));
  };
  
  const removeTableColumn = () => {
    if (tableCells[0].length <= 1) return; // Don't remove the last column
    
    const newTableCells = tableCells.map(row => row.slice(0, -1)); // Remove the last column
    setTableCells(newTableCells);
    
    // Update tableData in formData
    const tableDataString = JSON.stringify(newTableCells);
    setFormData(prev => ({
      ...prev,
      tableData: tableDataString
    }));
  };
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset the form when the patient changes
  useEffect(() => {
    setFormData({
      name: patient.name,
      age: patient.age,
      hospitalFileNumber: patient.hospitalFileNumber,
      mobileNumber: patient.mobileNumber,
      sex: patient.sex,
      ageOfDiagnosis: patient.ageOfDiagnosis,
      diagnosis: patient.diagnosis,
      treatment: patient.treatment,
      currentTreatment: patient.currentTreatment || '',
      response: patient.response,
      note: patient.note || '',
      tableData: patient.tableData || '',
      imageUrl: patient.imageUrl || '',
      imaging: patient.imaging || '',
      ultrasound: patient.ultrasound || '',
      labText: patient.labText || '',
      report: patient.report || '',

      // clinicId is read-only, not included in editable form
    });
    
    // Parse table data from JSON if it exists
    if (patient.tableData) {
      try {
        const parsedTable = JSON.parse(patient.tableData);
        if (Array.isArray(parsedTable) && parsedTable.length > 0 && Array.isArray(parsedTable[0])) {
          // Handle tables of any size
          setTableCells(parsedTable);
        } else {
          // Default to 8x8 if invalid format
          setTableCells(Array(8).fill(null).map(() => Array(8).fill('')));
        }
      } catch (err) {
        console.error("Error parsing table data:", err);
        setTableCells(Array(8).fill(null).map(() => Array(8).fill('')));
      }
    } else {
      setTableCells(Array(8).fill(null).map(() => Array(8).fill('')));
    }
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle table cell changes
    if (name.startsWith('tableCell-')) {
      const [_, rowIndex, colIndex] = name.split('-');
      const newTableCells = [...tableCells];
      newTableCells[Number(rowIndex)][Number(colIndex)] = value;
      setTableCells(newTableCells);
      
      // Convert table data to JSON string for storage
      const tableDataString = JSON.stringify(newTableCells);
      setFormData(prev => ({
        ...prev,
        tableData: tableDataString
      }));
    } else {
      // Handle regular form fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    try {
      await onSubmit(formData);
      setSuccessMessage('Patient updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Failed to update patient');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
          {successMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
          />
        </div>

        {/* Age */}
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Age
          </label>
          <input
            type="text"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
          />
        </div>

        {/* Hospital File Number */}
        <div>
          <label htmlFor="hospitalFileNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hospital File Number
          </label>
          <input
            type="text"
            id="hospitalFileNumber"
            name="hospitalFileNumber"
            value={formData.hospitalFileNumber}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mobile Number
          </label>
          <input
            type="text"
            id="mobileNumber"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
          />
        </div>

        {/* Sex */}
        <div>
          <label htmlFor="sex" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sex
          </label>
          <select
            id="sex"
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Age of Diagnosis */}
        <div>
          <label htmlFor="ageOfDiagnosis" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Age/Year of Diagnosis
          </label>
          <input
            type="text"
            id="ageOfDiagnosis"
            name="ageOfDiagnosis"
            value={formData.ageOfDiagnosis}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
          />
        </div>

        {/* Diagnosis */}
        <div>
          <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Diagnosis
          </label>
          <input
            type="text"
            id="diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
          />
        </div>

        {/* Treatment */}
        <div>
          <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Treatment
          </label>
          <input
            type="text"
            id="treatment"
            name="treatment"
            value={formData.treatment}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
          />
        </div>

        {/* Current Treatment */}
        <div>
          <label htmlFor="currentTreatment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Current Treatment
          </label>
          <textarea
            id="currentTreatment"
            name="currentTreatment"
            value={formData.currentTreatment}
            onChange={handleChange}
            rows={3}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
          />
        </div>
        
        {/* Clinic ID (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Clinic ID
          </label>
          <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium text-sm">
            {patient.clinicId || 'Not assigned'}
          </div>
        </div>
        
        {/* Image URL */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Patient Image URL <span className="text-xs text-gray-500">(Optional)</span>
          </label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
            placeholder="URL to patient image"
          />
        </div>

        {/* Imaging */}
        <div>
          <label htmlFor="imaging" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Imaging <span className="text-xs text-gray-500">(Optional)</span>
          </label>
          <textarea
            id="imaging"
            name="imaging"
            value={formData.imaging}
            onChange={handleChange}
            rows={3}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
            placeholder="Imaging information"
          />
        </div>

        {/* Ultrasound */}
        <div>
          <label htmlFor="ultrasound" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ultrasound <span className="text-xs text-gray-500">(Optional)</span>
          </label>
          <textarea
            id="ultrasound"
            name="ultrasound"
            value={formData.ultrasound}
            onChange={handleChange}
            rows={3}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
            placeholder="Ultrasound information"
          />
        </div>
        
        {/* Report */}
        <div>
          <label htmlFor="report" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Report <span className="text-xs text-gray-500">(Optional)</span>
          </label>
          <textarea
            id="report"
            name="report"
            value={formData.report}
            onChange={handleChange}
            rows={3}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
            placeholder="Report information"
          />
        </div>
        

        {/* Lab Text */}
        <div>
          <label htmlFor="labText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Lab Text <span className="text-xs text-gray-500">(Optional)</span>
          </label>
          <textarea
            id="labText"
            name="labText"
            value={formData.labText}
            onChange={handleChange}
            rows={3}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
            placeholder="Lab text information"
          />
        </div>
      </div>

      {/* Response */}
      <div>
        <label htmlFor="response" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Response
        </label>
                  <input
            type="text"
            id="response"
            name="response"
            value={formData.response}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
          />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          id="note"
          name="note"
          value={formData.note}
          onChange={handleChange}
          rows={3}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
        />
      </div>
      
      {/* Data Table (with dynamic sizing) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Additional Data Table
          </label>
          <div className="flex space-x-2">
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={addTableColumn}
                disabled={isLoading}
                className="px-2 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-l border border-indigo-200 dark:border-indigo-800 focus:outline-none"
                title="Add column"
              >
                <div className="flex items-center">
                  <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                  </svg>
                  Add Col
                </div>
              </button>
              <button
                type="button"
                onClick={removeTableColumn}
                disabled={isLoading || tableCells[0].length <= 1}
                className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 rounded-r border border-red-200 dark:border-red-800 focus:outline-none disabled:opacity-50"
                title="Remove column"
              >
                <div className="flex items-center">
                  <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1v-1z" clipRule="evenodd" />
                  </svg>
                  Del Col
                </div>
              </button>
            </div>
            
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={addTableRow}
                disabled={isLoading}
                className="px-2 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-l border border-indigo-200 dark:border-indigo-800 focus:outline-none"
                title="Add row"
              >
                <div className="flex items-center">
                  <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                  Add Row
                </div>
              </button>
              <button
                type="button"
                onClick={removeTableRow}
                disabled={isLoading || tableCells.length <= 1}
                className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 rounded-r border border-red-200 dark:border-red-800 focus:outline-none disabled:opacity-50"
                title="Remove row"
              >
                <div className="flex items-center">
                  <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Del Row
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {tableCells[0].map((_, colIndex) => (
                  <th 
                    key={colIndex} 
                    className="border border-gray-300 dark:border-gray-600 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium"
                  >
                    C{colIndex + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableCells.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td 
                      key={`${rowIndex}-${colIndex}`} 
                      className="border border-gray-300 dark:border-gray-600 px-1 py-1 bg-white dark:bg-gray-800"
                    >
                      <input
                        type="text"
                        name={`tableCell-${rowIndex}-${colIndex}`}
                        value={cell}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full px-2 py-1 bg-transparent text-gray-900 dark:text-white focus:outline-none text-sm"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Optional: Add any additional data in this table. Use the buttons above to add rows or columns.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
} 