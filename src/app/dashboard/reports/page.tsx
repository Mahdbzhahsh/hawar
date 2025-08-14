"use client";

import { useMemo, useEffect } from 'react';
import { usePatients } from '@/app/context/PatientContext';
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

  useEffect(() => {
    document.title = 'Reports & Analytics';
  }, []);

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
        {statCard('Unique Sex Values', Object.keys(metrics.bySex).length)}
      </div>

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