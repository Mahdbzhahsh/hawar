"use client";

import { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { useRouter } from 'next/navigation';

export default function PatientForm() {
  const { addPatient, isLoading, error } = usePatients();
  const router = useRouter();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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
    // clinicId is not included here as it's auto-generated
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        });
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
                          disabled={isLoading || formSubmitted}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Patient diagnosis"
                        />
                      </div>

                      {/* Treatment */}
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
                          disabled={isLoading || formSubmitted}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Treatment information"
                        />
                      </div>

                      {/* Response */}
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
                          disabled={isLoading || formSubmitted}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Patient response"
                        />
                      </div>

                      {/* Current Treatment */}
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
                          disabled={isLoading || formSubmitted}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                          placeholder="Current treatment details..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section - Full Width at Bottom */}
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
                      disabled={isLoading || formSubmitted}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                      placeholder="Enter any additional notes or observations about the patient..."
                    />
                  </div>
                </div>
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