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
    response: '',
    note: '',
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
      await addPatient(formData);
      
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Patient Registration Form</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Enter patient information below</p>
      </div>

      {(localError || error) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
          </svg>
          <span>{localError || error}</span>
        </div>
      )}

      {formSubmitted && !error && !localError ? (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
          <span>Patient record created successfully! Redirecting...</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              disabled={isLoading || formSubmitted}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
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
              required
              disabled={isLoading || formSubmitted}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
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
              required
              disabled={isLoading || formSubmitted}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
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
              required
              disabled={isLoading || formSubmitted}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
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
              required
              disabled={isLoading || formSubmitted}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Age/Year of Diagnosis */}
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
              required
              disabled={isLoading || formSubmitted}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
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
              required
              disabled={isLoading || formSubmitted}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
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
              required
              disabled={isLoading || formSubmitted}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Response */}
        <div className="mt-6">
          <label htmlFor="response" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Response
          </label>
          <input
            type="text"
            id="response"
            name="response"
            value={formData.response}
            onChange={handleChange}
            required
            disabled={isLoading || formSubmitted}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
          />
        </div>

        {/* Notes */}
        <div className="mt-6">
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={3}
            disabled={isLoading || formSubmitted}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || formSubmitted}
            className={`px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition duration-150 flex items-center ${
              isLoading || formSubmitted ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : formSubmitted ? (
              'Submitted!'
            ) : (
              'Submit Patient Data'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 