'use client'

import { useState } from 'react'
import { PresentationChartLineIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface WelcomeSettingsProps {
  onWelcomeReset?: () => void
}

export function WelcomeSettings({ onWelcomeReset }: WelcomeSettingsProps) {
  const [isResetting, setIsResetting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleResetWelcomePage = () => {
    setIsResetting(true)
    setResetSuccess(false)

    try {
      // Remove the visited flag from localStorage to show welcome page again
      localStorage.removeItem('cocoa-reader-visited')
      
      setResetSuccess(true)
      setShowConfirmation(false)
      
      // Call the callback to notify parent component
      if (onWelcomeReset) {
        onWelcomeReset()
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setResetSuccess(false)
      }, 3000)

    } catch (error) {
      console.error('Error resetting welcome page:', error)
    } finally {
      setIsResetting(false)
    }
  }

  const confirmReset = () => {
    setShowConfirmation(true)
  }

  const cancelReset = () => {
    setShowConfirmation(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <PresentationChartLineIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Welcome Experience
        </h3>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Manage your onboarding experience and replay the welcome tour at any time.
      </p>

      <div className="space-y-4">
        {/* Reset Welcome Page Section */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Replay Welcome Tour
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Show the 3-slide welcome experience again to review app features and get a refresher on how to use Cocoa Reader.
          </p>

          {!showConfirmation ? (
            <button
              onClick={confirmReset}
              disabled={isResetting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
              {isResetting ? 'Resetting...' : 'Reset Welcome Page'}
            </button>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Confirm Welcome Page Reset
              </h5>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                This will show the welcome tour the next time you refresh or visit the app. Are you sure you want to continue?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleResetWelcomePage}
                  disabled={isResetting}
                  className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white text-sm font-medium rounded transition-colors"
                >
                  Yes, Reset Welcome
                </button>
                <button
                  onClick={cancelReset}
                  disabled={isResetting}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Success Message */}
        {resetSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h5 className="font-medium text-green-800 dark:text-green-200">
                  ✅ Welcome Page Reset Successfully
                </h5>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  The welcome tour will appear the next time you refresh the page or visit the app.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Page Features Info */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            📋 Welcome Tour Features
          </h4>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>• 3-slide interactive introduction to key features</li>
            <li>• Learn how to save and organize articles</li>
            <li>• Discover AI-powered summaries and insights</li>
            <li>• Understand offline reading capabilities</li>
            <li>• Get tips for using the PWA experience</li>
          </ul>
        </div>

        {/* Quick Actions Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="mb-1">
            <strong>Note:</strong> Resetting the welcome page will show the onboarding experience again for both new and returning users.
          </p>
          <p>
            <strong>Tip:</strong> This is useful when introducing Cocoa Reader to friends or family, or when you want to review the features yourself.
          </p>
        </div>
      </div>
    </div>
  )
}
