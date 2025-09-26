'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  category: string;
  isPublic: boolean;
  clientId: string;
  title: string;
  description: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

export default function PhotoUpload() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [defaultSettings, setDefaultSettings] = useState({
    category: 'wedding' as const,
    isPublic: true,
    clientId: ''
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleFileSelect = useCallback((files: FileList) => {
    const newFiles: UploadFile[] = Array.from(files).map(file => {
      if (!file.type.startsWith('image/')) {
        return null;
      }
      
      return {
        id: generateId(),
        file,
        preview: URL.createObjectURL(file),
        category: defaultSettings.category,
        isPublic: defaultSettings.isPublic,
        clientId: defaultSettings.clientId,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        description: '',
        progress: 0,
        status: 'pending' as const
      };
    }).filter(Boolean) as UploadFile[];

    setUploadFiles(prev => [...prev, ...newFiles]);
  }, [defaultSettings]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  }, [handleFileSelect]);

  const updateFile = (id: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map(file => 
      file.id === id ? { ...file, ...updates } : file
    ));
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const simulateUpload = async (file: UploadFile) => {
    updateFile(file.id, { status: 'uploading', progress: 0 });
    
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      updateFile(file.id, { progress });
    }
    
    // Simulate success/error
    const success = Math.random() > 0.1; // 90% success rate
    if (success) {
      updateFile(file.id, { status: 'completed', progress: 100 });
    } else {
      updateFile(file.id, { 
        status: 'error', 
        errorMessage: 'Upload failed. Please try again.'
      });
    }
  };

  const startUpload = async () => {
    setIsUploading(true);
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    
    // Upload files in batches of 3
    const batchSize = 3;
    for (let i = 0; i < pendingFiles.length; i += batchSize) {
      const batch = pendingFiles.slice(i, i + batchSize);
      await Promise.all(batch.map(simulateUpload));
    }
    
    setIsUploading(false);
  };

  const applyDefaultsToAll = () => {
    setUploadFiles(prev => prev.map(file => ({
      ...file,
      category: defaultSettings.category,
      isPublic: defaultSettings.isPublic,
      clientId: defaultSettings.clientId
    })));
  };

  const clearCompleted = () => {
    setUploadFiles(prev => {
      const completed = prev.filter(f => f.status === 'completed');
      completed.forEach(file => URL.revokeObjectURL(file.preview));
      return prev.filter(f => f.status !== 'completed');
    });
  };

  const clearAll = () => {
    uploadFiles.forEach(file => URL.revokeObjectURL(file.preview));
    setUploadFiles([]);
  };

  const pendingCount = uploadFiles.filter(f => f.status === 'pending').length;
  const uploadingCount = uploadFiles.filter(f => f.status === 'uploading').length;
  const completedCount = uploadFiles.filter(f => f.status === 'completed').length;
  const errorCount = uploadFiles.filter(f => f.status === 'error').length;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/photography/gallery" className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Upload Photos</h1>
                <p className="text-sm text-gray-500 mt-1">Add new images to your photography portfolio</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {uploadFiles.length > 0 && (
                <div className="text-sm text-gray-600">
                  {pendingCount} pending • {completedCount} completed • {errorCount} errors
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              isDragging 
                ? 'border-[#d4af37] bg-[#d4af37]/5' 
                : 'border-gray-300 hover:border-[#d4af37] hover:bg-gray-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {isDragging ? 'Drop your photos here' : 'Drag and drop your photos'}
                </h3>
                <p className="text-gray-500 mb-6">
                  or click below to browse your files
                </p>
                <label className="inline-flex items-center px-6 py-3 bg-[#d4af37] text-black font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#d4af37]/90 transition-colors cursor-pointer">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Select Photos
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-400 mt-4">
                  Supports: JPG, PNG, HEIC, WebP • Max 10MB per file • Up to 50 files at once
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Default Settings */}
        {uploadFiles.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Default Settings</h3>
              <button
                onClick={applyDefaultsToAll}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-200 transition-colors"
              >
                Apply to All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Category</label>
                <select
                  value={defaultSettings.category}
                  onChange={(e) => setDefaultSettings(prev => ({ 
                    ...prev, 
                    category: e.target.value as any 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                >
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate</option>
                  <option value="graduation">Graduation</option>
                  <option value="portrait">Portrait</option>
                  <option value="event">Event</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Visibility</label>
                <select
                  value={defaultSettings.isPublic ? 'public' : 'private'}
                  onChange={(e) => setDefaultSettings(prev => ({ 
                    ...prev, 
                    isPublic: e.target.value === 'public' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                >
                  <option value="public">Public (Show on website)</option>
                  <option value="private">Private (Admin only)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Client ID</label>
                <input
                  type="text"
                  value={defaultSettings.clientId}
                  onChange={(e) => setDefaultSettings(prev => ({ 
                    ...prev, 
                    clientId: e.target.value 
                  }))}
                  placeholder="e.g., ahmad-siti-wedding-2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadFiles.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Upload Queue ({uploadFiles.length} files)</h3>
              <div className="flex items-center space-x-3">
                {completedCount > 0 && (
                  <button
                    onClick={clearCompleted}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md hover:bg-green-200"
                  >
                    Clear Completed ({completedCount})
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-md hover:bg-gray-200"
                >
                  Clear All
                </button>
                {pendingCount > 0 && (
                  <button
                    onClick={startUpload}
                    disabled={isUploading}
                    className="px-6 py-2 bg-[#d4af37] text-black font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-[#d4af37]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Uploading...' : `Upload ${pendingCount} Photo${pendingCount > 1 ? 's' : ''}`}
                  </button>
                )}
              </div>
            </div>
            
            {/* Upload Items */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {uploadFiles.map(file => (
                <div key={file.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={file.preview}
                      alt={file.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="text"
                        value={file.title}
                        onChange={(e) => updateFile(file.id, { title: e.target.value })}
                        className="font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[#d4af37] rounded px-2 py-1 flex-1 mr-4"
                        placeholder="Photo title"
                      />
                      <div className="flex items-center space-x-2">
                        <select
                          value={file.category}
                          onChange={(e) => updateFile(file.id, { category: e.target.value })}
                          className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                        >
                          <option value="wedding">Wedding</option>
                          <option value="corporate">Corporate</option>
                          <option value="graduation">Graduation</option>
                          <option value="portrait">Portrait</option>
                          <option value="event">Event</option>
                        </select>
                        
                        <button
                          onClick={() => updateFile(file.id, { isPublic: !file.isPublic })}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                            file.isPublic 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                          }`}
                          title={file.isPublic ? 'Public' : 'Private'}
                        >
                          {file.isPublic ? (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          )}
                        </button>
                        
                        <button
                          onClick={() => removeFile(file.id)}
                          className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span>{formatFileSize(file.file.size)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        file.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                        file.status === 'uploading' ? 'bg-blue-100 text-blue-800' :
                        file.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {file.status === 'pending' ? 'Pending' :
                         file.status === 'uploading' ? 'Uploading' :
                         file.status === 'completed' ? 'Completed' :
                         'Error'}
                      </span>
                    </div>
                    
                    {file.clientId && (
                      <input
                        type="text"
                        value={file.clientId}
                        onChange={(e) => updateFile(file.id, { clientId: e.target.value })}
                        placeholder="Client ID"
                        className="text-xs text-gray-500 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[#d4af37] rounded px-2 py-1 w-full"
                      />
                    )}
                    
                    {/* Progress Bar */}
                    {(file.status === 'uploading' || file.status === 'completed') && (
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              file.status === 'completed' ? 'bg-green-500' : 'bg-[#d4af37]'
                            }`}
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {file.status === 'error' && file.errorMessage && (
                      <p className="text-red-600 text-xs mt-2">{file.errorMessage}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {uploadFiles.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No photos selected</h3>
            <p className="text-gray-500 mb-6">
              Start by dragging and dropping photos above, or clicking "Select Photos"
            </p>
            <Link
              href="/admin/photography/gallery"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Gallery
            </Link>
          </div>
        )}

        {/* Upload Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Upload Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Public photos</strong> will appear on your website gallery</li>
                <li>• <strong>Private photos</strong> are only visible to you and can be shared with specific clients</li>
                <li>• Use <strong>Client IDs</strong> to organize photos for specific clients (e.g., "ahmad-siti-wedding-2024")</li>
                <li>• <strong>High-quality JPEGs</strong> are recommended for best website performance</li>
                <li>• Photos are automatically resized for web optimization while preserving originals</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
