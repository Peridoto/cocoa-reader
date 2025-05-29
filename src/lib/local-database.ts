import { Article } from '@/types/article'

// IndexedDB database name and version
const DB_NAME = 'cocoa-reader-db'
const DB_VERSION = 1
const STORE_NAME = 'articles'

// Database interface
class LocalDatabase {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create articles store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          
          // Create indexes for searching
          store.createIndex('title', 'title', { unique: false })
          store.createIndex('domain', 'domain', { unique: false })
          store.createIndex('read', 'read', { unique: false })
          store.createIndex('favorite', 'favorite', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('textContent', 'textContent', { unique: false })
        }
      }
    })
  }

  private getStore(mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized')
    }
    const transaction = this.db.transaction([STORE_NAME], mode)
    return transaction.objectStore(STORE_NAME)
  }

  async saveArticle(article: Article): Promise<Article> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('readwrite')
        const request = store.put(article)
        
        request.onsuccess = () => resolve(article)
        request.onerror = () => reject(request.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  async getArticle(id: string): Promise<Article | null> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore()
        const request = store.get(id)
        
        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => reject(request.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  async getAllArticles(): Promise<Article[]> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore()
        const request = store.getAll()
        
        request.onsuccess = () => {
          const articles = request.result || []
          // Sort by creation date, newest first
          articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          resolve(articles)
        }
        request.onerror = () => reject(request.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  async updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
    const existingArticle = await this.getArticle(id)
    if (!existingArticle) {
      throw new Error('Article not found')
    }

    const updatedArticle = { ...existingArticle, ...updates }
    return this.saveArticle(updatedArticle)
  }

  async deleteArticle(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('readwrite')
        const request = store.delete(id)
        
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  async searchArticles(query: string): Promise<Article[]> {
    const allArticles = await this.getAllArticles()
    
    if (!query.trim()) {
      return allArticles
    }

    const searchTerm = query.toLowerCase()
    return allArticles.filter(article => 
      article.title.toLowerCase().includes(searchTerm) ||
      article.textContent.toLowerCase().includes(searchTerm) ||
      article.domain.toLowerCase().includes(searchTerm) ||
      (article.summary && article.summary.toLowerCase().includes(searchTerm))
    )
  }

  async filterArticles(read?: boolean): Promise<Article[]> {
    const allArticles = await this.getAllArticles()
    
    if (read === undefined) {
      return allArticles
    }

    return allArticles.filter(article => article.read === read)
  }

  async filterFavoriteArticles(): Promise<Article[]> {
    const allArticles = await this.getAllArticles()
    return allArticles.filter(article => article.favorite === true)
  }

  async exportData(): Promise<string> {
    const articles = await this.getAllArticles()
    return JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      articles
    }, null, 2)
  }

  async importData(jsonData: string): Promise<number> {
    try {
      const data = JSON.parse(jsonData)
      
      if (!data.articles || !Array.isArray(data.articles)) {
        throw new Error('Invalid export format')
      }

      let importedCount = 0
      
      for (const articleData of data.articles) {
        try {
          // Ensure the article has all required fields
          const article: Article = {
            id: articleData.id || crypto.randomUUID(),
            title: articleData.title || 'Untitled',
            url: articleData.url || '',
            domain: articleData.domain || '',
            excerpt: articleData.excerpt || '',
            cleanedHTML: articleData.cleanedHTML || '',
            textContent: articleData.textContent || '',
            read: Boolean(articleData.read),
            favorite: Boolean(articleData.favorite),
            createdAt: new Date(articleData.createdAt || Date.now()),
            scroll: Number(articleData.scroll) || 0,
            readingTime: Number(articleData.readingTime) || 1,
            summary: articleData.summary || '',
            keyPoints: articleData.keyPoints || '',
            sentiment: articleData.sentiment || 'neutral'
          }
          
          await this.saveArticle(article)
          importedCount++
        } catch (error) {
          console.warn('Failed to import article:', articleData.title, error)
        }
      }

      return importedCount
    } catch (error) {
      throw new Error('Failed to parse import data: ' + (error as Error).message)
    }
  }

  async clearAllData(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('readwrite')
        const request = store.clear()
        
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      } catch (error) {
        reject(error)
      }
    })
  }
}

// Create singleton instance
export const localDB = new LocalDatabase()

// Initialize database on module load
if (typeof window !== 'undefined') {
  localDB.init().catch(console.error)
}
