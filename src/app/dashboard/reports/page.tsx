"use client";

import { useMemo, useEffect, useCallback } from 'react';
import { usePatients, Patient } from '@/app/context/PatientContext';
import { supabase, ensureVisitsTableExists } from '@/lib/supabase';
import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

export default function ReportsPage() {
  const { patients, isLoading } = usePatients();
  const [visitCountToday, setVisitCountToday] = useState<number>(0);
  const [visitPatientsToday, setVisitPatientsToday] = useState<string[]>([]);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [visitsForDate, setVisitsForDate] = useState<any[]>([]);
  const [visitPatients, setVisitPatients] = useState<Record<string, Patient>>({});
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);

  // Function to load visits for a specific date
  const loadVisitsForDate = async (date: Date) => {
    setIsLoadingVisits(true);
    try {
      // First check if visits table exists
      const visitsTableExists = await ensureVisitsTableExists();
      
      if (!visitsTableExists) {
        console.warn("Visits table doesn't exist yet - showing zero visits for date");
        setVisitsForDate([]);
        setVisitPatients({});
        setIsLoadingVisits(false);
        return;
      }
      
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      
      const { data, error } = await supabase
        .from('visits')
        .select('id, patient_id, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading visits for date:', error);
        setVisitsForDate([]);
        setVisitPatients({});
        return;
      }
      
      if (data) {
        setVisitsForDate(data);
        
        // Get patient details for each visit
        const patientIds = Array.from(new Set(data.map(v => v.patient_id)));
        const patientMap: Record<string, Patient> = {};
        
        if (patientIds.length > 0) {
          const { data: patientData, error: patientError } = await supabase
            .from('patients')
            .select('*')
            .in('id', patientIds);
            
          if (patientError) {
            console.error('Error loading patient details:', patientError);
          } else if (patientData) {
            patientData.forEach((p: any) => {
              patientMap[p.id] = {
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
              };
            });
          }
        }
        
        setVisitPatients(patientMap);
      }
    } catch (e) {
      console.error('Failed to load visits:', e);
      setVisitsForDate([]);
      setVisitPatients({});
    } finally {
      setIsLoadingVisits(false);
    }
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Function to load today's visits
  const loadTodaysVisits = useCallback(async () => {
    try {
      // First check if visits table exists
      const visitsTableExists = await ensureVisitsTableExists();
      
      if (!visitsTableExists) {
        console.warn("Visits table doesn't exist yet - showing zero visits");
        setVisitCountToday(0);
        setVisitPatientsToday([]);
        return;
      }
      
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      
      const { data, error } = await supabase
        .from('visits')
        .select('id, patient_id, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());
        
      if (error) {
        console.error('Error loading visits:', error);
        return;
      }
      
      if (data) {
        setVisitCountToday(data.length);
        setVisitPatientsToday(Array.from(new Set(data.map(v => v.patient_id))));
      }
    } catch (e) {
      console.error('Failed to load visits:', e);
    }
  }, []);
  
  // Event listener for visit updates
  useEffect(() => {
    // Handler for the custom event
    const handleVisitsUpdated = () => {
      loadTodaysVisits();
    };
    
    // Add event listener
    window.addEventListener('visitsUpdated', handleVisitsUpdated);
    
    // Cleanup
    return () => {
      window.removeEventListener('visitsUpdated', handleVisitsUpdated);
    };
  }, [loadTodaysVisits]);
  
  useEffect(() => {
    document.title = 'Reports & Analytics';
    
    // Load today's visits count
    loadTodaysVisits();
  }, [loadTodaysVisits]);

  const now = new Date();
  const thisYear = now.getFullYear();

  const metrics = useMemo(() => {
    const byMonth = new Array(12).fill(0);
    const bySex: Record<string, number> = {};
    let thisYearCount = 0;
    let last30d = 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    patients.forEach(p => {
      const created = new Date(p.createdAt);
      if (created.getFullYear() === thisYear) {
        thisYearCount += 1;
        byMonth[created.getMonth()] += 1;
      }
      if (created >= thirtyDaysAgo) last30d += 1;
      const sexKey = (p.sex || 'Unknown').trim();
      bySex[sexKey] = (bySex[sexKey] || 0) + 1;
    });

    const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    return { byMonth, bySex, thisYearCount, last30d, monthLabels };
  }, [patients, thisYear]);

  const barData = useMemo(() => ({
    labels: metrics.monthLabels,
    datasets: [
      {
        label: `New Patients ${thisYear}`,
        data: metrics.byMonth,
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  }), [metrics, thisYear]);

  const lineData = useMemo(() => ({
    labels: metrics.monthLabels,
    datasets: [
      {
        label: 'Cumulative Patients',
        data: metrics.byMonth.reduce<number[]>((acc, val, i) => {
          const sum = (acc[i-1] ?? 0) + val;
          acc.push(sum);
          return acc;
        }, []),
        fill: true,
        borderColor: 'rgba(34,197,94,1)',
        backgroundColor: 'rgba(34,197,94,0.15)',
        tension: 0.35,
        pointRadius: 2,
      },
    ],
  }), [metrics]);

  const doughnutData = useMemo(() => {
    const labels = Object.keys(metrics.bySex);
    const data = Object.values(metrics.bySex);
    const palette = [
      'rgba(99,102,241,0.8)',
      'rgba(16,185,129,0.8)',
      'rgba(234,179,8,0.8)',
      'rgba(239,68,68,0.8)',
      'rgba(14,165,233,0.8)'
    ];
    return {
      labels,
      datasets: [
        {
          label: 'Sex Distribution',
          data,
          backgroundColor: labels.map((_, i) => palette[i % palette.length]),
          borderWidth: 0,
        },
      ],
    };
  }, [metrics]);

  const statCard = (title: string, value: string | number, sub?: string) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</p>}
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <p className="text-gray-600 dark:text-gray-300">Patient volumes, distributions, and trends</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {statCard('Total Patients', patients.length, 'All time')}
        {statCard('This Year', metrics.thisYearCount, `${thisYear}`)}
        {statCard('Last 30 Days', metrics.last30d)}
        <div 
          className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
          onClick={() => {
            setSelectedDate(new Date());
            loadVisitsForDate(new Date());
            setShowVisitModal(true);
          }}
        >
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Visits Today</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{visitCountToday}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{visitPatientsToday.length} unique patients</p>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 flex items-center">
            <span>Click to view details</span>
            <svg className="h-3 w-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Visit Details Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Patient Visits</h2>
              <button 
                onClick={() => setShowVisitModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value);
                      setSelectedDate(newDate);
                      loadVisitsForDate(newDate);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex-shrink-0 mt-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {visitsForDate.length} visits ({Object.keys(visitPatients).length} unique patients)
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingVisits ? (
                <div className="flex justify-center items-center h-40">
                  <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : visitsForDate.length === 0 ? (
                <div className="text-center py-10">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No visits found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    There are no recorded visits for this date.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {visitsForDate.map((visit) => {
                    const patient = visitPatients[visit.patient_id];
                    return (
                      <div key={visit.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{patient?.name || 'Unknown Patient'}</h3>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {patient?.clinicId && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                  ID: {patient.clinicId}
                                </span>
                              )}
                              {patient?.age && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                  Age: {patient.age}
                                </span>
                              )}
                              {patient?.sex && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                  {patient.sex}
                                </span>
                              )}
                            </div>
                            {patient?.diagnosis && (
                              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Diagnosis:</span> {patient.diagnosis}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatTime(visit.created_at)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Visit Time
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Charts grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Monthly New Patients ({thisYear})</h2>
          <Bar data={barData} options={{
            responsive: true,
            plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
          }} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Sex Distribution</h2>
          <Doughnut data={doughnutData} options={{
            responsive: true,
            plugins: { legend: { position: 'bottom' } },
            cutout: '60%'
          }} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700 xl:col-span-3">
          <h2 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Cumulative Growth</h2>
          <Line data={lineData} options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
          }} />
        </div>
      </div>
    </div>
  );
}