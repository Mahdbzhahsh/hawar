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
    response: patient.response,
    note: patient.note || '',
  });
  
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
      response: patient.response,
      note: patient.note || '',
    });
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
            required
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
            required
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
            required
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
            required
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
            required
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
            required
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
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed"
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
          required
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