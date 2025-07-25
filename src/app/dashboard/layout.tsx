"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

// Navigation items for the sidebar
const navigationItems = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ) 
  },
  { 
    name: 'Patient Form', 
    href: '/dashboard/patient-form', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ) 
  },
  { 
    name: 'Patients List', 
    href: '/dashboard/patients', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ) 
  }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [greeting, setGreeting] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Function to handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Check if the current path matches a navigation item
  const isActivePath = (path: string) => {
    // Exact match for dashboard
    if (path === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    // For other routes, check if the pathname starts with the path
    if (path !== '/dashboard') {
      return pathname?.startsWith(path) ?? false;
    }
    return false;
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-indigo-900 text-white transition-all duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-4 border-b border-indigo-800">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-indigo-900 font-bold text-xl">A</span>
              </div>
              <span className="font-bold text-xl">AdminPanel</span>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto bg-white rounded-full flex items-center justify-center">
              <span className="text-indigo-900 font-bold text-xl">A</span>
            </div>
          )}
          <button 
            onClick={toggleSidebar}
            className="text-white focus:outline-none"
          >
            {sidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
        
        <div className="p-4 flex flex-col justify-between" style={{ height: "calc(100% - 65px)" }}>
          <nav>
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg transition duration-150 ${
                      isActivePath(item.href)
                        ? 'bg-indigo-800 text-white'
                        : 'text-white hover:bg-indigo-800'
                    }`}
                  >
                    {item.icon}
                    {sidebarOpen && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="mt-auto">
            <button 
              onClick={logout}
              className="flex items-center p-2 text-white hover:bg-indigo-800 rounded-lg transition duration-150 w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {sidebarOpen && <span className="ml-2">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-md">
          <div className="flex items-center justify-between p-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{greeting}, Admin</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Welcome to your dashboard</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
} 