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
  response: string;
  note: string;
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
  response: string;
  note: string;
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

// For admin login, we'll use local storage
const ADMIN_PATIENTS_KEY = 'adminPatients';

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableChecked, setTableChecked] = useState(false);
  const { session, isAuthenticated } = useAuth();

  // Check if user is logged in as admin
  const isAdmin = !session && isAuthenticated;

  // Check if the patients table exists
  useEffect(() => {
    async function checkTable() {
      if (!isAdmin && session?.user) {
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
  }, [isAdmin, session, isAuthenticated, tableChecked]);

  // Load patients data
  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (isAdmin) {
        // Admin uses local storage
        const storedPatients = localStorage.getItem(ADMIN_PATIENTS_KEY);
        if (storedPatients) {
          try {
            const parsedPatients = JSON.parse(storedPatients);
            setPatients(parsedPatients);
          } catch (e) {
            console.error('Failed to parse patients data:', e);
            localStorage.removeItem(ADMIN_PATIENTS_KEY);
            setPatients([]);
          }
        } else {
          setPatients([]);
        }
      } else if (session?.user) {
        // Regular user uses Supabase
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });
        
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
            response: p.response,
            note: p.note,
            createdAt: p.created_at,
            userId: p.user_id
          }));
          
          setPatients(formattedPatients);
        }
      } else {
        // Not authenticated
        setPatients([]);
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
    if (tableChecked) {
      fetchPatients();
    }
  }, [isAuthenticated, session, isAdmin, tableChecked]);

  // Add a new patient
  const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'userId'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (isAdmin) {
        // Admin uses local storage
        const newPatient: Patient = {
          ...patientData,
          id: `local-${Date.now()}`,
          createdAt: new Date().toISOString(),
          userId: 'admin'
        };
        
        const updatedPatients = [newPatient, ...patients];
        setPatients(updatedPatients);
        localStorage.setItem(ADMIN_PATIENTS_KEY, JSON.stringify(updatedPatients));
      } else if (session?.user?.id) {
        // Regular user uses Supabase
        const { data, error } = await supabase
          .from('patients')
          .insert({
            name: patientData.name,
            age: patientData.age,
            hospital_file_number: patientData.hospitalFileNumber,
            mobile_number: patientData.mobileNumber,
            sex: patientData.sex,
            age_of_diagnosis: patientData.ageOfDiagnosis,
            diagnosis: patientData.diagnosis,
            treatment: patientData.treatment,
            response: patientData.response,
            note: patientData.note,
            user_id: session.user.id
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
            response: data[0].response,
            note: data[0].note,
            createdAt: data[0].created_at,
            userId: data[0].user_id
          };
          
          setPatients(prevPatients => [newPatient, ...prevPatients]);
        }
      } else {
        throw new Error('Not authenticated');
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
      
      if (isAdmin) {
        // Admin uses local storage
        const updatedPatients = patients.map((patient: Patient) => 
          patient.id === id ? { ...patient, ...patientData } : patient
        );
        setPatients(updatedPatients);
        localStorage.setItem(ADMIN_PATIENTS_KEY, JSON.stringify(updatedPatients));
      } else if (session?.user.id) {
        // Regular user uses Supabase
        const { error } = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', id)
          .eq('user_id', session.user.id);
        
        if (error) {
          console.error('Supabase error editing patient:', error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        // Update local state
        setPatients((prevPatients: Patient[]) => prevPatients.map((patient: Patient) => 
          patient.id === id ? { ...patient, ...patientData } : patient
        ));
      } else {
        throw new Error('Not authenticated');
      }
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
      
      if (isAdmin) {
        // Admin uses local storage
        const updatedPatients = patients.filter((patient: Patient) => patient.id !== id);
        setPatients(updatedPatients);
        localStorage.setItem(ADMIN_PATIENTS_KEY, JSON.stringify(updatedPatients));
      } else if (session?.user.id) {
        // Regular user uses Supabase
        const { error } = await supabase
          .from('patients')
          .delete()
          .eq('id', id)
          .eq('user_id', session.user.id);
        
        if (error) {
          console.error('Supabase error deleting patient:', error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        // Update local state
        setPatients((prevPatients: Patient[]) => prevPatients.filter((patient: Patient) => patient.id !== id));
      } else {
        throw new Error('Not authenticated');
      }
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