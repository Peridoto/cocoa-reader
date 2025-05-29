'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClientScraper } from '@/lib/client-scraper';
import { localDB } from '@/lib/local-database';
import type { Article } from '@/types/article';

type FormData = {
  url: string;
  title: string;
  notes: string;
};

export default function SharePageContentProduction() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [savedArticle, setSavedArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<FormData>({
    url: '',
    title: '',
    notes: '',
  });

  // Auto-process shared URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url') || urlParams.get('text') || '';
    const title = urlParams.get('title') || '';
    
    if (url && url.trim()) {
      // Auto-populate form and save immediately
      setFormData(prev => ({
        ...prev,
        url: url.trim(),
        title: title.trim(),
      }));
      
      // Auto-save shared URL
      handleSaveArticle(url.trim(), title.trim());
    }
  }, []);

  // Check if user is online
  const isOnline = () => {
    return navigator.onLine;
  };

  // Create offline article with minimal data
  const createOfflineArticle = (url: string, title?: string): Article => {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const offlineTitle = title || domain;
    
    return {
      id: crypto.randomUUID(),
      url: url,
      title: offlineTitle,
      domain: domain,
      excerpt: 'Article saved without internet connection',
      cleanedHTML: `<div class="offline-article">
        <h2>${offlineTitle}</h2>
        <p><strong>URL:</strong> <a href="${url}" target="_blank">${url}</a></p>
        <p><em>This article was saved without internet connection. Connect to internet to process content.</em></p>
      </div>`,
      textContent: `${offlineTitle}\n\nURL: ${url}\n\nArticle saved without internet connection.`,
      read: false,
      favorite: false,
      createdAt: new Date(),
      scroll: 0,
      readingTime: 1,
      summary: null,
      keyPoints: null,
      categories: null,
      tags: null,
      sentiment: null
    };
  };

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
      let newArticle: Article;

      // Check if user is offline
      if (!isOnline()) {
        newArticle = createOfflineArticle(url, title);
      } else {
        // Online - use ClientScraper to extract article content
        const scraper = new ClientScraper();
        
        const scrapedData = await scraper.scrapeArticle(url);
        
        // Create article object for local storage
        newArticle = {
          id: crypto.randomUUID(),
          url: url,
          title: title || scrapedData.title || 'Untitled Article',
          domain: new URL(url).hostname,
          excerpt: scrapedData.excerpt || '',
          cleanedHTML: scrapedData.cleanedHTML || '',
          textContent: scrapedData.textContent || '',
          read: false,
          favorite: false,
          createdAt: new Date(),
          scroll: 0,
          readingTime: scrapedData.readingTime || 1,
          summary: null,
          keyPoints: null,
          categories: null,
          tags: null,
          sentiment: null
        };
      }

      // Ensure local database is initialized
      await localDB.init();
      
      const savedArticle = await localDB.saveArticle(newArticle);
      setSavedArticle(savedArticle);
      setStatus('success');

      // Redirect to the main page after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error) {
      console.error('Error saving article:', error);
      setStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Failed to save article';
      setErrorMessage(errorMsg);
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

  if (status === 'success' && savedArticle) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Article Saved! 🎉
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            "{savedArticle.title}" has been added to your reading list.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go to Library
            </button>
            <button
              onClick={() => router.push(`/read/${savedArticle.id}`)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Read Now
            </button>
          </div>
          
          {/* Status Badge */}
          <div className="mt-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isOnline() 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
            }`}>
              {isOnline() ? '🌐 Saved with content' : '📵 Saved offline'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Save Article
        </h2>

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Processing Article...
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {isOnline() 
                    ? 'Extracting content and saving to your library...'
                    : 'Saving article in offline mode...'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error Saving Article
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
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

          <div className="flex gap-3">
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
              onClick={() => router.push('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Connection Status */}
        <div className="mt-4 flex justify-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isOnline() 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
          }`}>
            {isOnline() ? '🌐 Online - Full content extraction' : '📵 Offline - Basic saving'}
          </span>
        </div>
      </div>
    </div>
  );
}
