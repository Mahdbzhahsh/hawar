"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase, ensurePatientsTableExists } from '@/lib/supabase';
import { useAuth } from './AuthContext';

// Define the Patient interface
export interface Patient {
  id: string;
  name: string;
  age: string;
  hospitalFileNumber: string;
  mobileNumber: string;
  sex: string;
  ageOfDiagnosis: string;
  diagnosis: string;
  treatment: string;
  currentTreatment: string;
  clinicId: string;
  response: string;
  note: string;
  tableData?: string;
  imageUrl?: string;
  createdAt: string;
  userId?: string;
}

// Define the database record shape
interface PatientRecord {
  id: string;
  name: string;
  age: string;
  hospital_file_number: string;
  mobile_number: string;
  sex: string;
  age_of_diagnosis: string;
  diagnosis: string;
  treatment: string;
  current_treatment: string;
  clinic_id: string;
  response: string;
  note: string;
  table_data?: string;
  image_url?: string;
  created_at: string;
  user_id: string;
}

interface PatientContextType {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  editPatient: (id: string, patient: Partial<Omit<Patient, 'id' | 'createdAt' | 'userId'>>) => Promise<void>;
  getPatient: (id: string) => Patient | undefined;
  deletePatient: (id: string) => Promise<void>;
  refreshPatients: () => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableChecked, setTableChecked] = useState(false);
  const { session, isAuthenticated, userId } = useAuth();

  // Check if the patients table exists
  useEffect(() => {
    async function checkTable() {
      if (isAuthenticated) {
        const exists = await ensurePatientsTableExists();
        if (!exists) {
          setError('Database table not found. Please contact the administrator.');
        }
        setTableChecked(true);
      } else {
        setTableChecked(true);
      }
    }
    
    if (!tableChecked && isAuthenticated) {
      checkTable();
    }
  }, [isAuthenticated, tableChecked]);

  // Load patients data
  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isAuthenticated || !userId) {
        // Not authenticated
        setPatients([]);
        return;
      }

      // For admin user, don't filter by user_id to get all records
      let query = supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      
      // If not the admin user, filter by user_id
      if (userId !== '00000000-0000-0000-0000-000000000000') {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Supabase error fetching patients:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (data) {
        // Map from snake_case to camelCase
        const formattedPatients = data.map((p: PatientRecord) => ({
          id: p.id,
          name: p.name,
          age: p.age,
          hospitalFileNumber: p.hospital_file_number,
          mobileNumber: p.mobile_number,
          sex: p.sex,
          ageOfDiagnosis: p.age_of_diagnosis,
          diagnosis: p.diagnosis,
          treatment: p.treatment,
          currentTreatment: p.current_treatment || '',
          clinicId: p.clinic_id || '',
          response: p.response,
          note: p.note,
          tableData: p.table_data || '',
          imageUrl: p.image_url || '',
          createdAt: p.created_at,
          userId: p.user_id
        }));
        
        setPatients(formattedPatients);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh patients when auth state changes
  useEffect(() => {
    if (tableChecked && isAuthenticated && userId) {
      fetchPatients();
    } else {
      setPatients([]);
    }
  }, [isAuthenticated, userId, tableChecked]);

  // Add a new patient
  const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'userId'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isAuthenticated || !userId) {
        throw new Error('Not authenticated');
      }

      // Generate Clinic ID: [PatientCount][DDMMYY]
      // 1. Get today's date in DDMMYY format
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = String(today.getFullYear()).slice(-2);
      const dateFormat = `${day}${month}${year}`;
      
      // 2. Count patients added today to determine count
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      
      const { data: todaysPatients, error: countError } = await supabase
        .from('patients')
        .select('id')
        .gte('created_at', startOfDay.toISOString());
        
      if (countError) {
        console.error('Error counting today\'s patients:', countError);
        throw new Error(`Database error: ${countError.message}`);
      }
      
      // Add 1 to the count (zero-indexed array)
      const patientCount = (todaysPatients?.length || 0) + 1;
      
      // Create clinic ID with 2-digit patient count (padded with leading zero if needed)
      const patientCountFormatted = String(patientCount).padStart(2, '0');
      
      // Create clinic ID
      const clinicId = `${patientCountFormatted}${dateFormat}`;
      
      // Always use Supabase for data storage
      const { data, error } = await supabase
        .from('patients')
        .insert({
          name: patientData.name, // Only name is required
          age: patientData.age || '',
          hospital_file_number: patientData.hospitalFileNumber || '',
          mobile_number: patientData.mobileNumber || '',
          sex: patientData.sex || '',
          age_of_diagnosis: patientData.ageOfDiagnosis || '',
          diagnosis: patientData.diagnosis || '',
          treatment: patientData.treatment || '',
          current_treatment: patientData.currentTreatment || '',
          clinic_id: clinicId,
          response: patientData.response || '',
          note: patientData.note || '',
          table_data: patientData.tableData || '',
          image_url: patientData.imageUrl || '',
          user_id: userId
        })
        .select();
      
      if (error) {
        console.error('Supabase error adding patient:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (data && data[0]) {
        // Add the new patient to the state
                  const newPatient: Patient = {
            id: data[0].id,
            name: data[0].name,
            age: data[0].age,
            hospitalFileNumber: data[0].hospital_file_number,
            mobileNumber: data[0].mobile_number,
            sex: data[0].sex,
            ageOfDiagnosis: data[0].age_of_diagnosis,
            diagnosis: data[0].diagnosis,
            treatment: data[0].treatment,
            currentTreatment: data[0].current_treatment || '',
            clinicId: data[0].clinic_id || '',
            response: data[0].response,
            note: data[0].note,
            tableData: data[0].table_data || '',
            imageUrl: data[0].image_url || '',
            createdAt: data[0].created_at,
            userId: data[0].user_id
          };
        
        setPatients(prevPatients => [newPatient, ...prevPatients]);
      }
    } catch (err) {
      console.error('Error adding patient:', err);
      setError('Failed to add patient');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Edit a patient
  const editPatient = async (id: string, patientData: Partial<Omit<Patient, 'id' | 'createdAt' | 'userId'>>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isAuthenticated || !userId) {
        throw new Error('Not authenticated');
      }

      // Convert camelCase to snake_case for database
      const dbData: any = {};
      
      if (patientData.name !== undefined) dbData.name = patientData.name;
      if (patientData.age !== undefined) dbData.age = patientData.age;
      if (patientData.hospitalFileNumber !== undefined) dbData.hospital_file_number = patientData.hospitalFileNumber;
      if (patientData.mobileNumber !== undefined) dbData.mobile_number = patientData.mobileNumber;
      if (patientData.sex !== undefined) dbData.sex = patientData.sex;
      if (patientData.ageOfDiagnosis !== undefined) dbData.age_of_diagnosis = patientData.ageOfDiagnosis;
      if (patientData.diagnosis !== undefined) dbData.diagnosis = patientData.diagnosis;
      if (patientData.treatment !== undefined) dbData.treatment = patientData.treatment;
      if (patientData.currentTreatment !== undefined) dbData.current_treatment = patientData.currentTreatment;
      // Note: we don't allow editing clinicId as it's system-generated
      if (patientData.response !== undefined) dbData.response = patientData.response;
      if (patientData.note !== undefined) dbData.note = patientData.note;
      if (patientData.tableData !== undefined) dbData.table_data = patientData.tableData;
      if (patientData.imageUrl !== undefined) dbData.image_url = patientData.imageUrl;

      // Always use Supabase for data storage
      const { error } = await supabase
        .from('patients')
        .update(dbData)
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Supabase error editing patient:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      // Update local state
      setPatients((prevPatients: Patient[]) => prevPatients.map((patient: Patient) => 
        patient.id === id ? { ...patient, ...patientData } : patient
      ));
    } catch (err) {
      console.error('Error editing patient:', err);
      setError('Failed to edit patient');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get a patient by ID
  const getPatient = (id: string) => {
    return patients.find(patient => patient.id === id);
  };

  // Delete a patient
  const deletePatient = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isAuthenticated || !userId) {
        throw new Error('Not authenticated');
      }

      // Always use Supabase for data storage
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Supabase error deleting patient:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      // Update local state
      setPatients((prevPatients: Patient[]) => prevPatients.filter((patient: Patient) => patient.id !== id));
    } catch (err) {
      console.error('Error deleting patient:', err);
      setError('Failed to delete patient');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh patients data
  const refreshPatients = async () => {
    await fetchPatients();
  };

  return (
    <PatientContext.Provider value={{ 
      patients, 
      isLoading, 
      error, 
      addPatient, 
      editPatient,
      getPatient, 
      deletePatient,
      refreshPatients 
    }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
} 