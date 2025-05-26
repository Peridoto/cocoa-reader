'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Article } from '@prisma/client';

type FormData = {
  url: string;
  title: string;
  notes: string;
};

export default function SharePageContentFixed() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState<FormData>({
    url: '',
    title: '',
    notes: '',
  });

  // Fix hydration issue by using window.location directly instead of useSearchParams
  useEffect(() => {
    console.log('SharePageContentFixed mounted');
    console.log('window.location.search:', window.location.search);
    console.log('window.location.href:', window.location.href);
    
    // Parse URL parameters directly from window.location to avoid hydration mismatch
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url') || urlParams.get('text') || '';
    const title = urlParams.get('title') || '';
    
    console.log('Extracted URL:', url);
    console.log('Extracted title:', title);
    
    if (url) {
      setFormData(prev => ({
        ...prev,
        url,
        title,
      }));
      
      // Auto-save the shared URL immediately
      handleSaveArticle(url, title);
    }
  }, []);

  const handleSaveArticle = async (urlToSave?: string, titleToSave?: string) => {
    const url = urlToSave || formData.url.trim();
    const title = titleToSave || formData.title.trim();
    
    if (!url) {
      setErrorMessage('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          title: title || undefined,
          notes: formData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save article');
      }

      setStatus('success');
      console.log('Article saved successfully:', data);
      
      // Redirect to the article or back to home after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error) {
      console.error('Error saving article:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save article');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveArticle();
  };

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Article Saved!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The article has been added to your reading list.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Save Article
        </h2>

        {status === 'error' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL *
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
              Title (optional)
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
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
        </form>
      </div>
    </div>
  );
}
