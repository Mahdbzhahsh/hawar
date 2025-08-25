"use client";

import { useState, useEffect } from 'react';
import { usePatients } from '../../context/PatientContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function PatientForm() {
  const { addPatient, isLoading, error } = usePatients();
  const router = useRouter();
  const { isStaffAuth } = useAuth();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // For staff, restrict specific fields but allow submission
  const isStaff = Boolean(isStaffAuth);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    hospitalFileNumber: '',
    mobileNumber: '',
    sex: '',
    ageOfDiagnosis: '',
    diagnosis: '',
    treatment: '',
    currentTreatment: '',
    response: '',
    note: '',
    tableData: '',
    imageUrl: '',
    imaging: '',
    ultrasound: '',
    labText: '',
    // clinicId is not included here as it's auto-generated
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
    setLocalError(null);
    
    try {
      setFormSubmitted(true);
      // Since clinicId is auto-generated on the server, we don't include it in the form data
      await addPatient({...formData, clinicId: ''});
      
      // Reset form after submission
      setTimeout(() => {
        setFormData({
          name: '',
          age: '',
          hospitalFileNumber: '',
          mobileNumber: '',
          sex: '',
          ageOfDiagnosis: '',
          diagnosis: '',
          treatment: '',
          currentTreatment: '',
          response: '',
          note: '',
          tableData: '',
          imageUrl: '',
          imaging: '',
          ultrasound: '',
          labText: '',
        });
        // Reset table cells
        setTableCells(Array(8).fill(null).map(() => Array(8).fill('')));
        setFormSubmitted(false);
        router.push('/dashboard/patients'); // Redirect to patients list
      }, 1500);
    } catch (err) {
      console.error('Error submitting patient data:', err);
      setLocalError('Failed to add patient. Please try again.');
      setFormSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Patient Registration
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Enter patient information below
          </p>
          <div className="mt-4 w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        {(localError || error) && (
          <div className="mb-6 max-w-4xl mx-auto">
            <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-lg shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                </svg>
                <span className="font-medium">{localError || error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {formSubmitted && !error && !localError && (
          <div className="mb-6 max-w-4xl mx-auto">
            <div className="p-4 bg-green-50 border-l-4 border-green-400 text-green-700 rounded-r-lg shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span className="font-medium">Patient record created successfully! Redirecting...</span>
              </div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="space-y-8">
                
                {/* Main Form Fields - Two Columns */}
                <div>
                  
                  {/* Personal Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div className="md:col-span-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          disabled={isLoading || formSubmitted}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Enter patient's full name"
                        />
                      </div>

                      {/* Age */}
                      <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Age
                        </label>
                        <input
                          type="text"
                          id="age"
                          name="age"
                          value={formData.age}
                          onChange={handleChange}
                          disabled={isLoading || formSubmitted}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Age"
                        />
                      </div>

                      {/* Sex */}
                      <div>
                        <label htmlFor="sex" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Gender
                        </label>
                        <select
                          id="sex"
                          name="sex"
                          value={formData.sex}
                          onChange={handleChange}
                          disabled={isLoading || formSubmitted}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Mobile Number
                        </label>
                        <input
                          type="text"
                          id="mobileNumber"
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          disabled={isLoading || formSubmitted}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Mobile number"
                        />
                      </div>

                      {/* Hospital File Number */}
                      <div>
                        <label htmlFor="hospitalFileNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Hospital File Number
                        </label>
                        <input
                          type="text"
                          id="hospitalFileNumber"
                          name="hospitalFileNumber"
                          value={formData.hospitalFileNumber}
                          onChange={handleChange}
                          disabled={isLoading || formSubmitted}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Hospital file number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Medical Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                      Medical Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Clinic ID (display only) */}
                      <div>
                        <label htmlFor="clinicId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Clinic ID
                        </label>
                        <div className="w-full px-4 py-3 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium">
                          Auto-generated after submission
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Format: [PatientNumber(2-digits)][DDMMYY]
                        </p>
                      </div>

                      {/* Age/Year of Diagnosis */}
                      <div>
                        <label htmlFor="ageOfDiagnosis" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Age/Year of Diagnosis
                        </label>
                        <input
                          type="text"
                          id="ageOfDiagnosis"
                          name="ageOfDiagnosis"
                          value={formData.ageOfDiagnosis}
                          onChange={handleChange}
                          disabled={isLoading || formSubmitted}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Age or year of diagnosis"
                        />
                      </div>

                      {/* Diagnosis */}
                      {!isStaff && (
                      <div>
                        <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Diagnosis
                        </label>
                        <input
                          type="text"
                          id="diagnosis"
                          name="diagnosis"
                          value={formData.diagnosis}
                          onChange={handleChange}
                           disabled={isLoading || formSubmitted || isStaff}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Patient diagnosis"
                        />
                      </div>
                      )}

                      {/* Treatment */}
                      {!isStaff && (
                      <div>
                        <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Treatment
                        </label>
                        <input
                          type="text"
                          id="treatment"
                          name="treatment"
                          value={formData.treatment}
                          onChange={handleChange}
                           disabled={isLoading || formSubmitted || isStaff}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Treatment information"
                        />
                      </div>
                      )}

                      {/* Response */}
                      {!isStaff && (
                      <div>
                        <label htmlFor="response" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Response
                        </label>
                        <input
                          type="text"
                          id="response"
                          name="response"
                          value={formData.response}
                          onChange={handleChange}
                           disabled={isLoading || formSubmitted || isStaff}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Patient response"
                        />
                      </div>
                      )}

                      {/* Current Treatment */}
                      {!isStaff && (
                      <div>
                        <label htmlFor="currentTreatment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Treatment
                        </label>
                        <textarea
                          id="currentTreatment"
                          name="currentTreatment"
                          value={formData.currentTreatment}
                          onChange={handleChange}
                          rows={3}
                           disabled={isLoading || formSubmitted || isStaff}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Current treatment details..."
                        />
                      </div>
                      )}
                      
                      {/* Patient Image URL (Optional) */}
                      {!isStaff && (
                      <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Patient Image URL <span className="text-xs text-gray-500">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          id="imageUrl"
                          name="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleChange}
                           disabled={isLoading || formSubmitted || isStaff}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="URL to patient image"
                        />
                      </div>
                      )}
                      
                      {/* Imaging (Optional) */}
                      {!isStaff && (
                      <div>
                        <label htmlFor="imaging" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Imaging <span className="text-xs text-gray-500">(Optional)</span>
                        </label>
                        <textarea
                          id="imaging"
                          name="imaging"
                          value={formData.imaging}
                          onChange={handleChange}
                          rows={3}
                          disabled={isLoading || formSubmitted || isStaff}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Imaging information"
                        />
                      </div>
                      )}
                      
                      {/* Ultrasound (Optional) */}
                      {!isStaff && (
                      <div>
                        <label htmlFor="ultrasound" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ultrasound <span className="text-xs text-gray-500">(Optional)</span>
                        </label>
                        <textarea
                          id="ultrasound"
                          name="ultrasound"
                          value={formData.ultrasound}
                          onChange={handleChange}
                          rows={3}
                          disabled={isLoading || formSubmitted || isStaff}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Ultrasound information"
                        />
                      </div>
                      )}
                      
                      {/* Lab Text (Optional) */}
                      {!isStaff && (
                      <div>
                        <label htmlFor="labText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Lab Text <span className="text-xs text-gray-500">(Optional)</span>
                        </label>
                        <textarea
                          id="labText"
                          name="labText"
                          value={formData.labText}
                          onChange={handleChange}
                          rows={3}
                          disabled={isLoading || formSubmitted || isStaff}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Lab text information"
                        />
                      </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes Section - Full Width at Bottom */}
                {!isStaff && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                    Additional Notes
                  </h3>
                  <div>
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      id="note"
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      rows={6}
                       disabled={isLoading || formSubmitted || isStaff}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                      placeholder="Enter any additional notes or observations about the patient..."
                    />
                  </div>
                </div>
                )}
                
                {/* Table Section with Dynamic Sizing */}
                {!isStaff && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Additional Data Table
                    </h3>
                    <div className="flex space-x-2">
                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={addTableColumn}
                           disabled={isLoading || formSubmitted || isStaff}
                          className="flex items-center px-3 py-1.5 text-sm bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-l-lg border border-indigo-200 dark:border-indigo-800 focus:outline-none disabled:opacity-70"
                          title="Add column"
                        >
                          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                          </svg>
                          Add Col
                        </button>
                        <button
                          type="button"
                          onClick={removeTableColumn}
                           disabled={isLoading || formSubmitted || tableCells[0].length <= 1 || isStaff}
                          className="flex items-center px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-r-lg border border-red-200 dark:border-red-800 focus:outline-none disabled:opacity-50"
                          title="Remove column"
                        >
                          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1v-1z" clipRule="evenodd" />
                          </svg>
                          Del Col
                        </button>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={addTableRow}
                           disabled={isLoading || formSubmitted || isStaff}
                          className="flex items-center px-3 py-1.5 text-sm bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-l-lg border border-indigo-200 dark:border-indigo-800 focus:outline-none disabled:opacity-70"
                          title="Add row"
                        >
                          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                          </svg>
                          Add Row
                        </button>
                        <button
                          type="button"
                          onClick={removeTableRow}
                           disabled={isLoading || formSubmitted || tableCells.length <= 1 || isStaff}
                          className="flex items-center px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-r-lg border border-red-200 dark:border-red-800 focus:outline-none disabled:opacity-50"
                          title="Remove row"
                        >
                          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                          Del Row
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm">
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
                                className="border border-gray-300 dark:border-gray-600 px-2 py-1 bg-white dark:bg-gray-800"
                              >
                                <input
                                  type="text"
                                  name={`tableCell-${rowIndex}-${colIndex}`}
                                  value={cell}
                                  onChange={handleChange}
                                   disabled={isLoading || formSubmitted || isStaff}
                                  className="w-full px-2 py-1 bg-transparent text-gray-900 dark:text-white focus:outline-none text-sm"

                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Optional: Add any additional data in this table. Use the buttons above to add rows or columns.
                  </p>
                </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-center sm:justify-end">
                  <button
                    type="submit"
                    disabled={isLoading || formSubmitted}
                    className={`w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-800 text-white font-medium rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center ${
                      isLoading || formSubmitted ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting Patient Data...
                      </>
                    ) : formSubmitted ? (
                      <>
                        <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        Successfully Submitted!
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Submit Patient Data
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}