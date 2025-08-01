"use client";

import { useState, useEffect } from 'react';
import { usePatients, Patient } from '../../context/PatientContext';
import Link from 'next/link';
import PatientEditForm from '../../components/PatientEditForm';
import { exportToExcel } from '@/lib/excelExport';

export default function PatientsPage() {
  const { patients, deletePatient, editPatient, isLoading, error, refreshPatients } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [customMinAge, setCustomMinAge] = useState<string>('');
  const [customMaxAge, setCustomMaxAge] = useState<string>('');
  const [showCustomAgeInputs, setShowCustomAgeInputs] = useState(false);

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Print treatment function
  const handlePrintTreatment = (patient: Patient) => {
    // Create a new window for the print document
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this website');
      return;
    }
    
    // Check if patient has necessary fields
    if (!patient.name || !patient.clinicId) {
      alert('Patient information is incomplete. Please ensure name and clinic ID are filled.');
      printWindow.close();
      return;
    }

    // Get today's date
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    // Create content for the print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Treatment Card - ${patient.name}</title>
        <style>
                     body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            direction: ltr; /* Ensure default direction */
          }
          .print-container {
            width: 148mm; /* A5 width */
            height: 210mm; /* A5 height */
            margin: 0 auto;
            position: relative;
            overflow: hidden;
            border: none;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .report-image {
            width: 148mm;
            display: block;
            object-fit: contain;
            object-position: top;
          }
          .patient-info {
            position: absolute;
            top: 62mm; /* Position for patient name in the card */
            left: 60mm;
            font-size: 14px;
            font-weight: bold;
            direction: rtl;
          }
          .date-info {
            position: absolute;
            top: 62mm;
            left: 20mm;
            font-size: 14px;
          }
          .treatment-info {
            position: absolute;
            top: 100mm;
            left: 20mm;
            right: 20mm;
            font-size: 14px;
            line-height: 1.5;
            white-space: pre-wrap;
            text-align: center;
          }
          @media print {
            @page {
              size: A5;
              margin: 0;
            }
            body {
              width: 148mm;
              height: 210mm;
            }
            .print-button {
              display: none;
            }
          }
          .print-button {
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 8px 16px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <img src="/reportprint.jpg" class="report-image" />
          <div class="patient-info">
            ${patient.name}
          </div>
          <div class="date-info">
            ${day} / ${month} / ${year}
          </div>
          <div class="treatment-info">
            <strong>Clinic ID: ${patient.clinicId}</strong><br />
            <strong>Age: ${patient.age}</strong><br /><br />
            ${patient.currentTreatment || 'No current treatment specified.'}
          </div>
        </div>
        <button class="print-button" onclick="window.print();return false;">Print</button>
        <script>
          // Auto-print
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `);
    
    // Finish writing and close the document
    printWindow.document.close();
  };

  // Refresh data when component mounts
  useEffect(() => {
    refreshPatients();
  }, []);

  // Filter patients based on search term and age filter
  const filteredPatients = patients.filter(patient => {
    // Text search filter
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.hospitalFileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Age filter
    let matchesAge = true;
    if (ageFilter !== 'all') {
      const patientAge = parseInt(patient.age) || 0;
      
      switch (ageFilter) {
        case 'under18':
          matchesAge = patientAge < 18;
          break;
        case '18to30':
          matchesAge = patientAge >= 18 && patientAge <= 30;
          break;
        case '31to50':
          matchesAge = patientAge >= 31 && patientAge <= 50;
          break;
        case 'over50':
          matchesAge = patientAge > 50;
          break;
        case 'custom':
          const minAge = parseInt(customMinAge) || 0;
          const maxAge = parseInt(customMaxAge) || 999;
          matchesAge = patientAge >= minAge && patientAge <= maxAge;
          break;
        default:
          matchesAge = true;
      }
    }
    
    return matchesSearch && matchesAge;
  });

  // Handle patient selection for details view
  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditing(false); // Close edit form when selecting a new patient
    setShowMobileDetails(true); // Show details panel on mobile
  };

  // Handle patient deletion
  const handleDeletePatient = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      try {
        setIsDeleting(id);
        await deletePatient(id);
        if (selectedPatient?.id === id) {
          setSelectedPatient(null);
        }
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Handle patient edit form submission
  const handleEditSubmit = async (data: Partial<Patient>) => {
    if (!selectedPatient) return;
    
    try {
      await editPatient(selectedPatient.id, data);
      // Update the selected patient with new data after successful edit
      setSelectedPatient(prev => prev ? { ...prev, ...data } : null);
      setIsEditing(false); // Close the form after successful edit
    } catch (err) {
      console.error('Error updating patient:', err);
    }
  };

  // Handle Excel export
  const handleExportToExcel = () => {
    try {
      setIsExporting(true);
      
      // Use the filtered patients if there's a search term, otherwise use all patients
      const dataToExport = filteredPatients;
      
      // Generate a filename with current date
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const filename = `patients-data-${date}`;
      
      // Export the data
      exportToExcel(dataToExport, filename);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Toggle back to list view on mobile
  const handleBackToList = () => {
    setShowMobileDetails(false);
  };

  // Loading state
  if (isLoading && patients.length === 0) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <svg className="inline animate-spin h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-700 dark:text-gray-300">Loading patients data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-4 rounded-lg text-red-700 dark:text-red-300">
          <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
          <p>{error}</p>
          <button 
            onClick={() => refreshPatients()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Patients Records</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {filteredPatients.length} {filteredPatients.length === 1 ? 'record' : 'records'} found
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/patient-form" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition duration-150 inline-flex items-center">
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Patient
            </Link>
            <button
              onClick={handleExportToExcel}
              disabled={isExporting || filteredPatients.length === 0}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg shadow-md transition duration-150 inline-flex items-center"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Excel
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search patients..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full md:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg inline-flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-150"
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {ageFilter !== 'all' && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                    {ageFilter === 'custom' && (customMinAge || customMaxAge) ? '2' : '1'}
                  </span>
                )}
              </button>
              
              {isFilterOpen && (
                <div className="absolute z-50 mt-2 w-72 right-0 md:right-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Age Range
                    </label>
                    <select
                      value={ageFilter}
                      onChange={(e) => setAgeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Ages</option>
                      <option value="under18">Under 18</option>
                      <option value="18to30">18-30</option>
                      <option value="31to50">31-50</option>
                      <option value="over50">Over 50</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                  
                  {ageFilter === 'custom' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Custom Age Range (Min - Max)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min Age"
                          value={customMinAge}
                          onChange={(e) => setCustomMinAge(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <input
                          type="number"
                          placeholder="Max Age"
                          value={customMaxAge}
                          onChange={(e) => setCustomMaxAge(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        setAgeFilter('all');
                        setCustomMinAge('');
                        setCustomMaxAge('');
                        setIsFilterOpen(false);
                      }}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View: Toggle between list and details */}
      <div className="block md:hidden mb-4">
        {showMobileDetails && selectedPatient && (
          <button 
            onClick={handleBackToList}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to List
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients List - Only render if not editing */}
        {!isEditing && (
          <div className={`lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${showMobileDetails ? 'hidden md:block' : 'block'}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Patient List</h2>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <div 
                    key={patient.id} 
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                      selectedPatient?.id === patient.id ? 'bg-gray-100 dark:bg-gray-700 border-l-4 border-indigo-500' : ''
                    }`}
                    onClick={() => handleViewPatient(patient)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{patient.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {patient.diagnosis} | Age: {patient.age}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Added: {formatDate(patient.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 font-medium">
                          {patient.clinicId}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">
                          {patient.hospitalFileNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No patients found. Please add a patient or adjust your search.
                </div>
              )}
            </div>
            
            {/* Show loading indicator when refreshing data */}
            {isLoading && patients.length > 0 && (
              <div className="p-2 bg-gray-50 dark:bg-gray-700 text-center">
                <svg className="inline animate-spin h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs text-gray-600 dark:text-gray-300">Refreshing...</span>
              </div>
            )}
          </div>
        )}

        {/* Patient Details */}
        <div className={`${isEditing ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white dark:bg-gray-800 rounded-lg shadow-md ${!showMobileDetails ? 'hidden md:block' : 'block'}`}>
          {selectedPatient ? (
            <div className="p-4 md:p-6">
              {!isEditing ? (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedPatient.name}</h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full font-medium text-sm">
                          Clinic ID: {selectedPatient.clinicId}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                          File #: {selectedPatient.hospitalFileNumber}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Added: {formatDate(selectedPatient.createdAt)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-md transition duration-150"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeletePatient(selectedPatient.id)}
                        disabled={isDeleting === selectedPatient.id}
                        className={`p-2 text-red-600 hover:bg-red-100 rounded-md transition duration-150 ${
                          isDeleting === selectedPatient.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isDeleting === selectedPatient.id ? (
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Personal Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Age</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPatient.age}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Sex</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPatient.sex}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPatient.mobileNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Medical Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Diagnosis Age</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPatient.ageOfDiagnosis}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Diagnosis</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPatient.diagnosis}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Treatment</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPatient.treatment}</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Treatment</span>
                            <button
                              onClick={() => {
                                if (selectedPatient.currentTreatment) {
                                  handlePrintTreatment(selectedPatient);
                                } else {
                                  alert('Please add current treatment information before printing.');
                                }
                              }}
                              title="Print treatment card for this patient"
                              className="flex items-center px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                            >
                              <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                              Print
                            </button>
                          </div>
                          <div className="mt-1 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{selectedPatient.currentTreatment || 'No current treatment specified.'}</p>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Clinic ID</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPatient.clinicId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Response</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPatient.response}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</h3>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {selectedPatient.note || 'No notes available.'}
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Patient</h2>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to View
                    </button>
                  </div>
                  <PatientEditForm 
                    patient={selectedPatient}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setIsEditing(false)}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <svg className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Select a patient</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Click on a patient from the list to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 