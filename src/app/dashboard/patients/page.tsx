"use client";

import { useState, useEffect } from 'react';
import { usePatients, Patient } from '../../context/PatientContext';
import Link from 'next/link';
import PatientEditForm from '../../components/PatientEditForm';

export default function PatientsPage() {
  const { patients, deletePatient, editPatient, isLoading, error, refreshPatients } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  // Refresh data when component mounts
  useEffect(() => {
    refreshPatients();
  }, []);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.hospitalFileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle patient selection for details view
  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditing(false); // Close edit form when selecting a new patient
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

  // Loading state
  if (isLoading && patients.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
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
      <div className="p-6">
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
    <div className="p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Patients Records</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">View and manage patient information</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <Link href="/dashboard/patient-form" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition duration-150 inline-flex items-center">
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Patient
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Patient List</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filteredPatients.length} {filteredPatients.length === 1 ? 'record' : 'records'} found
            </p>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <div 
                  key={patient.id} 
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    selectedPatient?.id === patient.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                  onClick={() => handleViewPatient(patient)}
                >
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{patient.name}</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                      {patient.hospitalFileNumber}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {patient.diagnosis} | Age: {patient.age}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Added: {formatDate(patient.createdAt)}
                  </p>
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

        {/* Patient Details */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {selectedPatient ? (
            <div className="p-6">
              {!isEditing ? (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedPatient.name}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        File #: {selectedPatient.hospitalFileNumber} | Added: {formatDate(selectedPatient.createdAt)}
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
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Personal Information</h3>
                      <div className="mt-2 border-t border-gray-100 dark:border-gray-700 pt-2">
                        <dl className="divide-y divide-gray-100 dark:divide-gray-800">
                          <div className="py-2 grid grid-cols-3">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Age</dt>
                            <dd className="text-sm text-gray-900 dark:text-gray-100 col-span-2">{selectedPatient.age}</dd>
                          </div>
                          <div className="py-2 grid grid-cols-3">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sex</dt>
                            <dd className="text-sm text-gray-900 dark:text-gray-100 col-span-2">{selectedPatient.sex}</dd>
                          </div>
                          <div className="py-2 grid grid-cols-3">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile</dt>
                            <dd className="text-sm text-gray-900 dark:text-gray-100 col-span-2">{selectedPatient.mobileNumber}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Medical Information</h3>
                      <div className="mt-2 border-t border-gray-100 dark:border-gray-700 pt-2">
                        <dl className="divide-y divide-gray-100 dark:divide-gray-800">
                          <div className="py-2 grid grid-cols-3">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Diagnosis Age</dt>
                            <dd className="text-sm text-gray-900 dark:text-gray-100 col-span-2">{selectedPatient.ageOfDiagnosis}</dd>
                          </div>
                          <div className="py-2 grid grid-cols-3">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Diagnosis</dt>
                            <dd className="text-sm text-gray-900 dark:text-gray-100 col-span-2">{selectedPatient.diagnosis}</dd>
                          </div>
                          <div className="py-2 grid grid-cols-3">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Treatment</dt>
                            <dd className="text-sm text-gray-900 dark:text-gray-100 col-span-2">{selectedPatient.treatment}</dd>
                          </div>
                          <div className="py-2 grid grid-cols-3">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Response</dt>
                            <dd className="text-sm text-gray-900 dark:text-gray-100 col-span-2">{selectedPatient.response}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {selectedPatient.note || 'No notes available.'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit Patient</h2>
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