"use client";

import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Patient } from '@/app/context/PatientContext';

interface PageProps {
  params: Promise<{
    patientId: string;
    cardType: string;
  }>;
}

export default function ShareCardPage({ params }: PageProps) {
  // Unwrap parameters in React 19 style
  const { patientId, cardType } = use(params);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatientData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch patient using the public security-definer RPC function
        const { data, error: fetchError } = await supabase.rpc('get_patient_by_id_public', {
          patient_id: patientId
        });

        if (fetchError) {
          console.error('Error fetching patient data via RPC:', fetchError);
          
          // Fallback to direct select if table permissions allow (for local development or permissive setups)
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('patients')
            .select('*')
            .eq('id', patientId)
            .single();

          if (fallbackError) {
            throw new Error(fallbackError.message);
          }

          if (fallbackData) {
            setPatient(mapPatientRecord(fallbackData));
            return;
          }
          throw new Error('Patient not found');
        }

        if (data && data.length > 0) {
          setPatient(mapPatientRecord(data[0]));
        } else {
          throw new Error('Patient not found');
        }
      } catch (err: any) {
        console.error('Failed to load shared card data:', err);
        setError(err?.message || 'Failed to load card information.');
      } finally {
        setLoading(false);
      }
    }

    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  // Helper to map DB snake_case record to camelCase Patient object
  const mapPatientRecord = (p: any): Patient => {
    return {
      id: p.id,
      name: p.name,
      dob: p.dob || '',
      hospitalFileNumber: p.hospital_file_number || '',
      mobileNumber: p.mobile_number || '',
      sex: p.sex || '',
      ageOfDiagnosis: p.age_of_diagnosis || '',
      diagnosis: p.diagnosis || '',
      treatment: p.treatment || '',
      currentTreatment: p.current_treatment || '',
      clinicId: p.clinic_id || '',
      response: p.response || '',
      note: p.note || '',
      tableData: p.table_data || '',
      imageUrl: p.image_url || '',
      imaging: p.imaging || '',
      ultrasound: p.ultrasound || '',
      labText: p.lab_text || '',
      report: p.report || '',
      followUpDate: p.follow_up_date || '',
      createdAt: p.created_at || '',
      userId: p.user_id || ''
    };
  };

  const calculateAge = (dob: string): string => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return 'N/A';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  // Determine card content and title
  const getCardDetails = () => {
    if (!patient) return { title: 'Card', content: '' };
    switch (cardType) {
      case 'imaging':
        return { title: 'Imaging Card', content: patient.imaging || 'No imaging data recorded' };
      case 'ultrasound':
        return { title: 'Ultrasound Card', content: patient.ultrasound || 'No ultrasound data recorded' };
      case 'lab':
        return { title: 'Lab Test Card', content: patient.labText || 'No lab test data recorded' };
      case 'report':
        return { title: 'Report Card', content: patient.report || 'No report data recorded' };
      case 'treatment':
      default:
        return { title: 'Treatment Card', content: patient.currentTreatment || patient.treatment || 'No treatment details recorded' };
    }
  };

  const { title, content } = getCardDetails();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium">Retrieving shared card details...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md w-full">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Card Unavailable</h2>
          <p className="text-slate-400 mb-6">{error || 'This shared link is invalid or the data does not exist.'}</p>
          <a href="/" className="inline-block bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2px px-6 rounded-lg transition">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 md:p-8">
      {/* Action Header bar */}
      <div className="no-print w-full max-w-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          <p className="text-xs text-slate-400">Patient: <span className="font-medium text-slate-200">{patient.name}</span></p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => window.print()} 
            className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold py-2 px-6 rounded-xl shadow-lg shadow-indigo-600/25 transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Card
          </button>
        </div>
      </div>

      {/* Card Preview Container */}
      <div className="flex-1 w-full flex justify-center items-start overflow-auto">
        <div className="card-preview-wrapper flex items-center justify-center p-2 rounded-2xl bg-slate-950/40 border border-slate-800/40 shadow-2xl">
          <div className="card-container">
            <img src="/drhawar.jpg" className="report-image" alt="Clinic Card Template" />
            
            {/* Patient info in yellow area */}
            <div className="patient-info">
              {/* Name field */}
              <div className="name-row">
                <div className="name-label">Name:</div>
                <div className="name-value">{patient.name}</div>
              </div>
              
              {/* Age and clinic ID row */}
              <div className="details-row">
                <div className="age-container">
                  <div className="age-label">Age:</div>
                  <div className="age-value">{calculateAge(patient.dob)} / DOB: {patient.dob || 'N/A'}</div>
                </div>
                
                <div className="clinic-container">
                  <div className="clinic-id-label">clinic ID:</div>
                  <div className="clinic-id-value">{patient.clinicId}</div>
                </div>
              </div>
            </div>
            
            {/* Treatment/imaging/card data in green area */}
            <div className="treatment-data">
              {/* Separator line */}
              <div className="separator"></div>
              
              {/* Content (without label) */}
              <div className="treatment-content">{content}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded styles for perfect A5 card layout & Printing */}
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        /* Card styles for standard display */
        .card-container {
          width: 148mm;
          height: 210mm;
          position: relative;
          background: white;
          color: black;
          overflow: hidden;
          page-break-inside: avoid;
          page-break-after: always;
          font-family: Arial, sans-serif;
        }
        
        .report-image {
          width: 100%;
          height: 100%;
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          object-fit: contain;
          object-position: top left;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .patient-info {
          position: absolute;
          top: 205px;
          left: 15px;
          width: 90%;
          padding: 10px;
        }
        
        .treatment-data {
          position: absolute;
          top: 280px;
          left: 15px;
          width: 90%;
          padding: 10px;
        }
        
        .name-row {
          margin-bottom: 8px;
          display: flex;
        }
        
        .name-label {
          font-size: 10px;
          font-weight: bold;
          margin-right: 6px;
          min-width: 40px;
        }
        
        .name-value {
          font-size: 10px;
        }
        
        .details-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        
        .age-container {
          display: flex;
        }
        
        .age-label {
          font-size: 10px;
          font-weight: bold;
          margin-right: 6px;
          min-width: 40px;
        }
        
        .age-value {
          font-size: 10px;
        }
        
        .clinic-container {
          display: flex;
          margin-right: 0;
        }
        
        .clinic-id-label {
          font-size: 10px;
          font-weight: bold;
          margin-right: 6px;
        }
        
        .clinic-id-value {
          font-size: 10px;
        }
        
        .separator {
          border-bottom: 1px dashed #000;
          margin-bottom: 8px;
          width: 100%;
        }
        
        .treatment-content {
          font-size: 10px;
          line-height: 1.6;
          white-space: pre-wrap;
          padding-top: 10px;
          padding-left: 10px;
          padding-right: 10px;
        }

        /* Mobile scaling preview */
        @media (max-width: 640px) {
          .card-preview-wrapper {
            width: 100%;
            height: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
          }
          .card-container {
            /* Scale A5 down to fit standard mobile screen widths */
            transform: scale(0.62);
            transform-origin: top center;
            margin-bottom: -80mm; /* Offset scaled space */
          }
        }
        
        @media (max-width: 400px) {
          .card-container {
            transform: scale(0.5);
            margin-bottom: -105mm;
          }
        }

        /* Print overrides */
        @media print {
          @page {
            size: A5 portrait;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
          }
          
          html, body {
            width: 148mm;
            height: 210mm;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden;
            background: white !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .card-preview-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            background: none !important;
            box-shadow: none !important;
            width: 148mm !important;
            height: 210mm !important;
          }
          
          .card-container {
            box-shadow: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            height: 100% !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            margin-bottom: 0 !important;
          }
          
          .report-image {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
            object-position: top left !important;
            image-rendering: -webkit-optimize-contrast !important;
            image-rendering: crisp-edges !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .patient-info {
            position: absolute !important;
            top: 205px !important;
            left: 15px !important;
            width: 90% !important;
          }
          
          .treatment-data {
            position: absolute !important;
            top: 280px !important;
            left: 15px !important;
            width: 90% !important;
          }
        }
      `}</style>
    </div>
  );
}
