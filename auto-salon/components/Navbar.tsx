'use client';

import Link from 'next/link';
import { DarkModeToggle } from './DarkModeToggle';
import { useTheme } from '@/context/ThemeContext';

export function Navbar() {
  const { isDarkMode } = useTheme();

  return (
    <nav className={`fixed w-full z-50 top-0 ${
      isDarkMode 
        ? 'bg-gray-900 text-white border-gray-800' 
        : 'bg-white text-gray-800 border-gray-200'
    } border-b transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold">
              AutoSallon
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/vehicles" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isDarkMode 
                  ? 'hover:bg-gray-800' 
                  : 'hover:bg-gray-100'
              }`}
            >
              Vehicles
            </Link>
            <Link 
              href="/about" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isDarkMode 
                  ? 'hover:bg-gray-800' 
                  : 'hover:bg-gray-100'
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isDarkMode 
                  ? 'hover:bg-gray-800' 
                  : 'hover:bg-gray-100'
              }`}
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            <Link 
              href="/login" 
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 