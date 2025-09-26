'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
  status: 'active' | 'inactive';
  notes: string;
  avatar?: string;
  joinedDate: string;
  eventTypes: string[];
}

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Ahmad & Siti Rahman',
      email: 'ahmad.siti@email.com',
      phone: '+60123456789',
      totalBookings: 3,
      totalSpent: 2850,
      lastBooking: '2024-02-15',
      status: 'active',
      notes: 'Preferred photographers for traditional Malay weddings. Excellent communication.',
      joinedDate: '2023-06-15',
      eventTypes: ['Wedding', 'Engagement']
    },
    {
      id: '2',
      name: 'Corporate Events Sdn Bhd',
      email: 'events@company.com',
      phone: '+60987654321',
      totalBookings: 8,
      totalSpent: 6400,
      lastBooking: '2024-02-18',
      status: 'active',
      notes: 'Regular corporate client. Annual events, product launches, and team building sessions.',
      joinedDate: '2022-03-10',
      eventTypes: ['Corporate', 'Product Launch']
    },
    {
      id: '3',
      name: 'Fatimah Abdullah',
      email: 'fatimah@email.com',
      phone: '+60111222333',
      totalBookings: 1,
      totalSpent: 350,
      lastBooking: '2024-02-20',
      status: 'active',
      notes: 'University graduation. Family-oriented, prefers group shots.',
      joinedDate: '2024-01-20',
      eventTypes: ['Graduation']
    },
    {
      id: '4',
      name: 'David Lim Photography Studio',
      email: 'david@studio.com',
      phone: '+60333444555',
      totalBookings: 2,
      totalSpent: 1200,
      lastBooking: '2023-12-08',
      status: 'inactive',
      notes: 'Collaboration for large events. Professional partnership for overflow work.',
      joinedDate: '2023-08-22',
      eventTypes: ['Corporate', 'Wedding']
    },
    {
      id: '5',
      name: 'Sarah & James Thompson',
      email: 'sarah.james@email.com',
      phone: '+60555666777',
      totalBookings: 2,
      totalSpent: 1450,
      lastBooking: '2024-01-12',
      status: 'active',
      notes: 'Expat couple. Modern style preferences, loves candid shots.',
      joinedDate: '2023-11-05',
      eventTypes: ['Wedding', 'Portrait']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalActiveClients = clients.filter(c => c.status === 'active').length;
  const totalRevenue = clients.reduce((sum, client) => sum + client.totalSpent, 0);
  const averageBookingValue = totalRevenue / clients.reduce((sum, client) => sum + client.totalBookings, 0);

  const handleWhatsAppContact = (client: Client) => {
    const message = `Hi ${client.name}! Thank you for choosing Captura Photography. How can I assist you today?`;
    window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black mb-4 font-serif">Client Management</h1>
            <div className="w-16 h-px bg-[#d4af37] mx-auto mb-4"></div>
            <p className="text-black/60 text-lg max-w-2xl mx-auto">
              Build lasting relationships with your photography clients
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black/60 uppercase tracking-wide font-medium">Total Clients</p>
                <p className="text-3xl font-bold text-black">{clients.length}</p>
              </div>
              <div className="w-12 h-12 bg-black/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black/60 uppercase tracking-wide font-medium">Active Clients</p>
                <p className="text-3xl font-bold text-black">{totalActiveClients}</p>
              </div>
              <div className="w-12 h-12 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black/60 uppercase tracking-wide font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-black">RM{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black/60 uppercase tracking-wide font-medium">Avg. Booking</p>
                <p className="text-3xl font-bold text-black">RM{Math.round(averageBookingValue).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search clients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
              >
                <option value="all">All Clients</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 hover:border-[#d4af37] hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => {
                setSelectedClient(client);
                setShowModal(true);
              }}
            >
              {/* Client Header */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-[#d4af37]/20 rounded-full flex items-center justify-center">
                  <span className="text-[#d4af37] font-bold text-lg">{getInitials(client.name)}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-black font-serif">{client.name}</h3>
                  <p className="text-black/60 text-sm">{client.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      client.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Client Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-black/60 text-sm">Total Bookings</p>
                  <p className="text-xl font-bold text-black">{client.totalBookings}</p>
                </div>
                <div>
                  <p className="text-black/60 text-sm">Total Spent</p>
                  <p className="text-xl font-bold text-black">RM{client.totalSpent.toLocaleString()}</p>
                </div>
              </div>

              {/* Event Types */}
              <div className="mb-4">
                <p className="text-black/60 text-sm mb-2">Event Types</p>
                <div className="flex flex-wrap gap-1">
                  {client.eventTypes.map((type, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-black/10 text-black text-xs rounded-md"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Last Booking */}
              <div className="mb-4">
                <p className="text-black/60 text-sm">Last Booking</p>
                <p className="text-black font-medium">{new Date(client.lastBooking).toLocaleDateString()}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWhatsAppContact(client);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.687"/>
                  </svg>
                  <span>WhatsApp</span>
                </button>
                <button className="px-4 py-2 border border-[#d4af37] text-[#d4af37] text-sm font-medium rounded-lg hover:bg-[#d4af37] hover:text-black transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="text-lg font-medium text-black mb-2">No clients found</h3>
            <p className="text-black/60">No clients match your current search criteria.</p>
          </div>
        )}
      </main>

      {/* Client Details Modal */}
      {showModal && selectedClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-black font-serif">Client Details</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-[#d4af37]/20 rounded-full flex items-center justify-center">
                      <span className="text-[#d4af37] font-bold text-2xl">{getInitials(selectedClient.name)}</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-black">{selectedClient.name}</h4>
                      <p className="text-black/60">{selectedClient.email}</p>
                      <p className="text-black/60">{selectedClient.phone}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-black/60 text-sm">Status</p>
                      <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                        selectedClient.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedClient.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-black/60 text-sm">Joined</p>
                      <p className="text-black font-medium">{new Date(selectedClient.joinedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-black/60 text-sm">Total Bookings</p>
                      <p className="text-2xl font-bold text-black">{selectedClient.totalBookings}</p>
                    </div>
                    <div>
                      <p className="text-black/60 text-sm">Total Spent</p>
                      <p className="text-2xl font-bold text-black">RM{selectedClient.totalSpent.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-black/60 text-sm mb-2">Event Types</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedClient.eventTypes.map((type, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-black/10 text-black text-sm rounded-md"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-black/60 text-sm">Notes</p>
                    <p className="text-black">{selectedClient.notes}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => handleWhatsAppContact(selectedClient)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Contact via WhatsApp
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4af37] sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
