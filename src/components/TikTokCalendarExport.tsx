'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';

interface CalendarEvent {
  id: string;
  title: string;
  camera: string;
  customer: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'confirmed' | 'active' | 'completed';
  color: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: CalendarEvent[];
}

interface TikTokCalendarExportProps {
  currentDate: Date;
  calendarDays: CalendarDay[];
  events: CalendarEvent[];
  onExportComplete?: (success: boolean, filename?: string) => void;
}

export default function TikTokCalendarExport({ 
  currentDate, 
  calendarDays, 
  onExportComplete 
}: TikTokCalendarExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const exportElement = document.getElementById('tiktok-calendar-export');
      if (!exportElement) {
        throw new Error('Export element not found');
      }

      // Show the element temporarily for better rendering
      exportElement.style.left = '0px';
      exportElement.style.top = '0px';
      exportElement.style.position = 'fixed';
      exportElement.style.zIndex = '9999';

      // Wait a moment for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      // Configure html2canvas for high quality with better browser compatibility
      const canvasOptions = {
        width: 1080,
        height: 1920,
        scale: 2, // High DPI for crisp text
        useCORS: false, // Disable CORS to avoid cross-origin issues
        allowTaint: true, // Allow tainted canvas for local content
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true,
        imageTimeout: 15000,
        foreignObjectRendering: false, // Disable foreign object rendering for better compatibility
        onclone: (clonedDoc: Document) => {
          try {
            // Ensure fonts are loaded in cloned document
            const clonedElement = clonedDoc.getElementById('tiktok-calendar-export');
            if (clonedElement) {
              clonedElement.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
              // Force all text to be black for better contrast
              const textElements = clonedElement.querySelectorAll<HTMLElement>('*');
              textElements.forEach((el) => {
                if (el.style) {
                  el.style.setProperty('-webkit-font-smoothing', 'antialiased');
                  el.style.setProperty('-moz-osx-font-smoothing', 'grayscale');
                }
              });
            }
          } catch (error) {
            console.warn('Font loading warning:', error);
          }
        }
      } as unknown as Parameters<typeof html2canvas>[1];
      const canvas = await html2canvas(exportElement, canvasOptions);

      // Create download link
      const link = document.createElement('a');
      const monthYear = `${monthNames[currentDate.getMonth()].toLowerCase()}-${currentDate.getFullYear()}`;
      const filename = `captura-calendar-${monthYear}.png`;
      
      link.download = filename;
      link.href = canvas.toDataURL('image/png', 1.0);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Hide the element again
      exportElement.style.left = '-9999px';
      exportElement.style.top = '-9999px';
      exportElement.style.position = 'fixed';
      exportElement.style.zIndex = 'auto';

      onExportComplete?.(true, filename);
    } catch (error) {
      console.error('Export failed:', error);

      // Provide more specific error messages
      let errorMessage = 'Export failed. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('cross-origin') || error.message.includes('CORS')) {
          errorMessage = 'Browser security restriction. Please try refreshing the page and export again.';
        } else if (error.message.includes('canvas')) {
          errorMessage = 'Canvas rendering failed. Please try a different browser or refresh the page.';
        }
      }

      // Show user-friendly error
      alert(errorMessage);

      // Ensure element is hidden even on error
      const exportElement = document.getElementById('tiktok-calendar-export');
      if (exportElement) {
        exportElement.style.left = '-9999px';
        exportElement.style.top = '-9999px';
        exportElement.style.position = 'fixed';
        exportElement.style.zIndex = 'auto';
      }

      onExportComplete?.(false);
    } finally {
      setIsExporting(false);
    }
  };

  const getAvailabilityStatus = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return 'other-month';
    if (day.bookings.length > 0) return 'booked';

    // Check if date is in the past (compare dates only, not time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);

    if (dayDate < today) return 'past';
    return 'available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return {
        backgroundColor: '#dcfce7',
        borderColor: '#86efac',
        color: '#166534'
      };
      case 'booked': return {
        backgroundColor: '#fecaca',
        borderColor: '#fca5a5',
        color: '#991b1b'
      };
      case 'past': return {
        backgroundColor: '#f3f4f6',
        borderColor: '#d1d5db',
        color: '#6b7280'
      };
      case 'other-month': return {
        backgroundColor: '#f9fafb',
        borderColor: '#e5e7eb',
        color: '#9ca3af'
      };
      default: return {
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        color: '#111827'
      };
    }
  };

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="inline-flex items-center rounded-xl border border-[#4a3727] bg-[#221912] px-4 py-2 font-semibold text-orange-300 shadow-[0_12px_28px_rgba(0,0,0,0.22)] transition-all duration-200 hover:border-[#c96b2c] hover:bg-[#2a1d15] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isExporting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-orange-300/30 border-t-orange-300"></div>
            Exporting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </>
        )}
      </button>

      {/* Hidden Export Template - TikTok Optimized 1080x1920 */}
      <div
        id="tiktok-calendar-export"
        className="fixed -left-[9999px] -top-[9999px] w-[1080px] h-[1920px] bg-white overflow-hidden"
        style={{
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          fontSize: '24px',
          lineHeight: '1.4',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility'
        }}
      >
        {/* Header Section */}
        <div className="relative h-[400px] flex flex-col justify-center items-center text-white" style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
        }}>
          {/* Glass effect overlay */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
            backdropFilter: 'blur(4px)'
          }}></div>
          
          {/* Content */}
          <div className="relative z-10 text-center space-y-6">
            <div className="text-8xl font-bold tracking-tight">
              CAPTURA
            </div>
            <div className="text-3xl font-light opacity-90">
              Camera Rental Services
            </div>
            <div className="text-5xl font-semibold mt-8">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="p-12 flex-1">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {dayNames.map(day => (
              <div key={day} className="text-center font-bold text-2xl py-4" style={{ color: '#374151' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const status = getAvailabilityStatus(day);
              const statusColors = getStatusColor(status);
              return (
                <div
                  key={index}
                  className="h-[140px] border-2 rounded-xl flex flex-col items-center justify-center text-center"
                  style={{
                    backgroundColor: statusColors.backgroundColor,
                    borderColor: statusColors.borderColor,
                    color: statusColors.color
                  }}
                >
                  <div className="text-3xl font-bold mb-2">
                    {day.date.getDate()}
                  </div>
                  {day.bookings.length > 0 && (
                    <div className="text-lg font-medium">
                      {day.bookings.length} booking{day.bookings.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend & Contact Section */}
        <div className="p-12 space-y-8" style={{ backgroundColor: '#f9fafb' }}>
          {/* Legend */}
          <div className="space-y-4">
            <h3 className="text-3xl font-bold mb-6" style={{ color: '#111827' }}>Legend</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 border-2 rounded" style={{
                  backgroundColor: '#dcfce7',
                  borderColor: '#86efac'
                }}></div>
                <span className="text-2xl font-medium" style={{ color: '#111827' }}>Available</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 border-2 rounded" style={{
                  backgroundColor: '#fecaca',
                  borderColor: '#fca5a5'
                }}></div>
                <span className="text-2xl font-medium" style={{ color: '#111827' }}>Booked</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-3xl font-bold" style={{ color: '#111827' }}>Book Now</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                  backgroundColor: '#10b981'
                }}>
                  <span className="text-white text-lg">📱</span>
                </div>
                <span className="text-2xl font-medium" style={{ color: '#111827' }}>WhatsApp: +60 17-746 4121</span>
              </div>
              <div className="text-xl" style={{ color: '#6b7280' }}>
                DJI Osmo Pocket 3 • DJI Action 5 Pro
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
