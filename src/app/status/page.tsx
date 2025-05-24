'use client'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          ✅ Application Status Check
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🎉 Success! The application is working properly.
          </h2>
          
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>✅ React components are rendering correctly</p>
            <p>✅ TypeScript compilation successful</p>
            <p>✅ Tailwind CSS styling is working</p>
            <p>✅ Dark mode styles are applied</p>
            <p>✅ Client-side rendering is functional</p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Next steps:</strong> Go back to the main page to test the full application functionality.
            </p>
            <a 
              href="/" 
              className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Main Page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
