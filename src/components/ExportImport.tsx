'use client'

import { useState, useRef } from 'react'
import { localDB } from '@/lib/local-database'
import { 
  downloadFile, 
  generateExportFilename, 
  readFileAsText, 
  parseImportData 
} from '@/lib/export-import'

interface ImportStats {
  totalInFile: number
  imported: number
  skipped: number
  errors: number
}

interface ExportImportProps {
  onImportComplete?: (stats: ImportStats) => void
}

export function ExportImport({ onImportComplete }: ExportImportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState('')
  const [importStats, setImportStats] = useState<ImportStats | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setError('')
      
      // Export directly from local database
      const exportData = await localDB.exportData()
      const filename = generateExportFilename()
      
      downloadFile(exportData, filename)
      
      const articles = await localDB.getAllArticles()
      setImportProgress(`Successfully exported ${articles.length} articles`)
      setTimeout(() => setImportProgress(''), 3000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsImporting(true)
      setError('')
      setImportStats(null)
      setImportProgress('Reading file...')

      const fileContent = await readFileAsText(file)
      
      setImportProgress('Validating data...')
      
      // Validate the file content before importing
      const importData = parseImportData(fileContent)
      
      setImportProgress(`Importing ${importData.totalArticles} articles...`)
      
      // Import directly to local database
      const importedCount = await localDB.importData(fileContent)
      
      const stats: ImportStats = {
        totalInFile: importData.totalArticles,
        imported: importedCount,
        skipped: 0,
        errors: importData.totalArticles - importedCount
      }

      setImportStats(stats)
      setImportProgress('')
      
      // Call the callback to refresh the articles list
      if (onImportComplete) {
        onImportComplete(stats)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
      setImportProgress('')
    } finally {
      setIsImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        📦 Data Export & Import
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Export your articles for backup or import from another Coco Reader instance.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Export Section */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 dark:text-white">Export Articles</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Download all your articles as a JSON file for backup or migration.
          </p>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>
                📥 Export Articles
              </>
            )}
          </button>
        </div>

        {/* Import Section */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 dark:text-white">Import Articles</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Import articles from a Coco Reader export file. Duplicates will be skipped.
          </p>
          <button
            onClick={handleImportClick}
            disabled={isImporting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Importing...
              </>
            ) : (
              <>
                📤 Import Articles
              </>
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Progress Messages */}
      {importProgress && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200 text-sm">{importProgress}</p>
        </div>
      )}

      {/* Import Statistics */}
      {importStats && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
            ✅ Import Completed Successfully
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-green-700 dark:text-green-300 font-medium">Total in file:</span>
              <div className="text-green-800 dark:text-green-200">{importStats.totalInFile}</div>
            </div>
            <div>
              <span className="text-green-700 dark:text-green-300 font-medium">Imported:</span>
              <div className="text-green-800 dark:text-green-200">{importStats.imported}</div>
            </div>
            <div>
              <span className="text-green-700 dark:text-green-300 font-medium">Skipped:</span>
              <div className="text-green-800 dark:text-green-200">{importStats.skipped}</div>
            </div>
            <div>
              <span className="text-green-700 dark:text-green-300 font-medium">Errors:</span>
              <div className="text-green-800 dark:text-green-200">{importStats.errors}</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">
            ❌ {error}
          </p>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="mb-1">
          <strong>Privacy:</strong> All export/import operations are performed locally. 
          Your data is never sent to external servers.
        </p>
        <p>
          <strong>Format:</strong> Exports include article URLs, titles, content, and reading progress. 
          No personal information is included.
        </p>
      </div>
    </div>
  )
}
