"use client";

import { useEffect } from 'react';
import Link from 'next/link';

export default function ReportsPage() {
  // Add page title
  useEffect(() => {
    document.title = "Reports - Under Maintenance";
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Reports Section Under Maintenance
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto">
            We're currently working on enhancing this section to provide you with better analytics and reporting capabilities.
            Please check back later.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link 
              href="/dashboard"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 shadow-md"
            >
              Return to Dashboard
            </Link>
            
            <Link 
              href="/dashboard/patients"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200"
            >
              Go to Patients
            </Link>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse mr-2"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Expected completion: Coming Soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 