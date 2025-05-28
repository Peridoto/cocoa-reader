'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Article } from '@prisma/client';

type FormData = {
  url: string;
  title: string;
  notes: string;
};

type DebugInfo = {
  timestamp: string;
  windowLocation: {
    href: string;
    search: string;
    pathname: string;
    hash: string;
  };
  urlParams: Record<string, string | null>;
  parsedData: {
    url: string;
    title: string;
    text: string;
  };
  userAgent: string;
  referrer: string;
  shareTargetSupported: boolean;
  webShareSupported: boolean;
};

export default function SharePageContentDebug() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    url: '',
    title: '',
    notes: '',
  });

  // Comprehensive debugging on component mount
  useEffect(() => {
    console.log('🔍 SharePageContentDebug mounted - Starting comprehensive debugging');
    
    // Collect all debugging information
    const urlParams = new URLSearchParams(window.location.search);
    const allParams: Record<string, string | null> = {};
    
    // Get all URL parameters
    urlParams.forEach((value, key) => {
      allParams[key] = value;
    });

    const debugData: DebugInfo = {
      timestamp: new Date().toISOString(),
      windowLocation: {
        href: window.location.href,
        search: window.location.search,
        pathname: window.location.pathname,
        hash: window.location.hash,
      },
      urlParams: allParams,
      parsedData: {
        url: urlParams.get('url') || urlParams.get('text') || '',
        title: urlParams.get('title') || '',
        text: urlParams.get('text') || '',
      },
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      shareTargetSupported: 'serviceWorker' in navigator,
      webShareSupported: 'share' in navigator,
    };

    setDebugInfo(debugData);

    // Log everything to console
    console.log('🌐 Complete Debug Information:', debugData);

    // Extract data for form
    const url = debugData.parsedData.url;
    const title = debugData.parsedData.title;
    
    console.log('📝 Extracted for form - URL:', url, 'Title:', title);
    
    if (url) {
      setFormData(prev => ({
        ...prev,
        url,
        title,
      }));
      
      console.log('🚀 Auto-saving shared URL...');
      // Auto-save the shared URL immediately
      handleSaveArticle(url, title);
    } else {
      console.log('⚠️ No URL found in parameters - manual entry required');
    }
  }, []);

  const handleSaveArticle = async (urlToSave?: string, titleToSave?: string) => {
    const url = urlToSave || formData.url.trim();
    const title = titleToSave || formData.title.trim();
    
    console.log('💾 handleSaveArticle called with:', { url, title });
    
    if (!url) {
      const errorMsg = 'Please enter a URL';
      console.log('❌ No URL provided:', errorMsg);
      setErrorMessage(errorMsg);
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');
    setApiResponse(null);

    const requestBody = {
      url,
      title: title || undefined,
      notes: formData.notes || undefined,
    };

    console.log('📤 Sending API request:', requestBody);

    try {
      const response = await fetch('/api/article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 API Response status:', response.status);
      console.log('📥 API Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('📥 API Response data:', data);
      
      setApiResponse({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: data,
        requestBody: requestBody,
      });

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      setStatus('success');
      console.log('✅ Article saved successfully:', data);
      
      // Redirect to the article or back to home after a short delay
      setTimeout(() => {
        router.push('/');
      }, 5000); // Extended delay for debugging

    } catch (error) {
      console.error('❌ Error saving article:', error);
      setStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Failed to save article';
      setErrorMessage(errorMsg);
      
      setApiResponse(prev => ({
        ...prev,
        error: {
          message: errorMsg,
          stack: error instanceof Error ? error.stack : undefined,
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log('📝 Form input changed:', { name, value });
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📤 Form submitted manually');
    handleSaveArticle();
  };

  const handleCopyDebugInfo = () => {
    const debugText = JSON.stringify({
      debugInfo,
      apiResponse,
      formData,
      status,
      errorMessage,
    }, null, 2);
    
    navigator.clipboard.writeText(debugText).then(() => {
      alert('Debug information copied to clipboard!');
    }).catch(() => {
      console.log('Debug info:', debugText);
      alert('Debug information logged to console (clipboard failed)');
    });
  };

  if (status === 'success') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Article Saved Successfully! 🎉
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The article has been added to your reading list.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors mr-4"
          >
            Go to Library
          </button>
          <button
            onClick={handleCopyDebugInfo}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Copy Debug Info
          </button>
        </div>

        {/* Success Debug Info */}
        {apiResponse && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
              ✅ API Response Details
            </h3>
            <pre className="text-xs text-green-700 dark:text-green-300 overflow-auto">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Save Article - Debug Mode 🔍
        </h2>

        {/* Debug Information Panel */}
        {debugInfo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                🔍 Debug Information
              </h3>
              <button
                onClick={handleCopyDebugInfo}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
              >
                Copy All Debug Info
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">📍 Location Info:</h4>
                <div className="text-blue-700 dark:text-blue-300 space-y-1">
                  <div><strong>URL:</strong> {debugInfo.windowLocation.href}</div>
                  <div><strong>Search:</strong> {debugInfo.windowLocation.search || 'None'}</div>
                  <div><strong>Pathname:</strong> {debugInfo.windowLocation.pathname}</div>
                  <div><strong>Hash:</strong> {debugInfo.windowLocation.hash || 'None'}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">📝 Parsed Data:</h4>
                <div className="text-blue-700 dark:text-blue-300 space-y-1">
                  <div><strong>URL:</strong> {debugInfo.parsedData.url || 'None'}</div>
                  <div><strong>Title:</strong> {debugInfo.parsedData.title || 'None'}</div>
                  <div><strong>Text:</strong> {debugInfo.parsedData.text || 'None'}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">🌐 Environment:</h4>
                <div className="text-blue-700 dark:text-blue-300 space-y-1">
                  <div><strong>Share Target:</strong> {debugInfo.shareTargetSupported ? '✅' : '❌'}</div>
                  <div><strong>Web Share:</strong> {debugInfo.webShareSupported ? '✅' : '❌'}</div>
                  <div><strong>Referrer:</strong> {debugInfo.referrer || 'None'}</div>
                  <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">🔧 URL Parameters:</h4>
                <div className="text-blue-700 dark:text-blue-300 space-y-1">
                  {Object.keys(debugInfo.urlParams).length > 0 ? (
                    Object.entries(debugInfo.urlParams).map(([key, value]) => (
                      <div key={key}><strong>{key}:</strong> {value || 'null'}</div>
                    ))
                  ) : (
                    <div>No parameters found</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">📱 User Agent:</h4>
              <div className="text-xs text-blue-700 dark:text-blue-300 break-all">
                {debugInfo.userAgent}
              </div>
            </div>
          </div>
        )}

        {/* Error Information */}
        {status === 'error' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <div className="text-red-400 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  ❌ Error Details
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {errorMessage}
                </p>
              </div>
            </div>
            
            {apiResponse && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">API Response:</h4>
                <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto bg-red-100 dark:bg-red-900/30 p-2 rounded">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL * {formData.url && <span className="text-green-600">✅ Populated</span>}
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://example.com/article"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title (optional) {formData.title && <span className="text-green-600">✅ Populated</span>}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Article title"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add your notes about this article"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Article'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleCopyDebugInfo}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              📋 Copy Debug
            </button>
          </div>
        </form>

        {/* Loading State Debug */}
        {isLoading && (
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              ⏳ Processing Request...
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Sending article data to the server. This may take a few seconds depending on the website's response time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
