'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/types/article'
import { localDB } from '@/lib/local-database'

interface StatisticsProps {
  articles: Article[]
}

export function Statistics({ articles }: StatisticsProps) {
  const [stats, setStats] = useState({
    minutesRead: 0,
    totalArticlesRead: 0,
    totalArticlesAdded: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calculateStats()
  }, [articles])

  const calculateStats = async () => {
    try {
      setLoading(true)
      
      // Initialize database if needed
      await localDB.init()
      
      // Get all articles from database for accurate counts
      const allArticles = await localDB.getAllArticles()
      
      // Calculate total articles added
      const totalArticlesAdded = allArticles.length
      
      // Calculate total articles read (read status = true)
      const readArticles = allArticles.filter((article: Article) => article.read)
      const totalArticlesRead = readArticles.length
      
      // Calculate total minutes read (sum of reading time for read articles)
      const minutesRead = readArticles.reduce((total: number, article: Article) => {
        return total + (article.readingTime || 5) // Default to 5 minutes if no reading time
      }, 0)
      
      setStats({
        minutesRead,
        totalArticlesRead,
        totalArticlesAdded
      })
    } catch (error) {
      console.error('Error calculating statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reading Statistics</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reading Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Min Read */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/40 rounded-full p-2 mr-3">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.minutesRead}</p>
              <p className="text-sm text-purple-700 dark:text-purple-300">Min Read</p>
            </div>
          </div>
        </div>

        {/* Total Articles Read */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/40 rounded-full p-2 mr-3">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalArticlesRead}</p>
              <p className="text-sm text-green-700 dark:text-green-300">Articles Read</p>
            </div>
          </div>
        </div>

        {/* Total Articles Added */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2 mr-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalArticlesAdded}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Articles Added</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Reading Progress:</span>
            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
              {stats.totalArticlesAdded > 0 
                ? `${Math.round((stats.totalArticlesRead / stats.totalArticlesAdded) * 100)}%`
                : '0%'
              }
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Avg. Reading Time:</span>
            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
              {stats.totalArticlesRead > 0 
                ? `${Math.round(stats.minutesRead / stats.totalArticlesRead)} min`
                : '0 min'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
