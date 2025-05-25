import { Article } from '@/types/article'

// Client-side AI processor using various approaches
export class ClientAIProcessor {
  
  async processArticle(article: Article): Promise<Partial<Article>> {
    try {
      const [summary, keyPoints, sentiment] = await Promise.all([
        this.generateSummary(article.textContent),
        this.extractKeyPoints(article.textContent),
        this.analyzeSentiment(article.textContent)
      ])

      return {
        summary,
        keyPoints: JSON.stringify(keyPoints), // Convert array to JSON string
        sentiment: sentiment as 'positive' | 'negative' | 'neutral',
        categories: JSON.stringify([]), // Initialize as empty JSON array
        tags: JSON.stringify([]), // Initialize as empty JSON array
        readingTime: this.calculateReadingTime(article.textContent)
      }
    } catch (error) {
      console.error('AI processing failed:', error)
      return {
        summary: 'Summary generation failed',
        keyPoints: JSON.stringify(['Key points extraction failed']),
        sentiment: 'neutral',
        categories: JSON.stringify([]),
        tags: JSON.stringify([]),
        readingTime: null
      }
    }
  }

  private async generateSummary(textContent: string): Promise<string> {
    // Extractive summarization using sentence ranking
    const sentences = this.splitIntoSentences(textContent)
    
    if (sentences.length <= 3) {
      return sentences.join(' ')
    }

    // Score sentences based on various factors
    const scoredSentences = sentences.map((sentence, index) => ({
      sentence,
      index,
      score: this.scoreSentence(sentence, sentences, textContent)
    }))

    // Sort by score and take top sentences
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(3, Math.ceil(sentences.length * 0.3)))
      .sort((a, b) => a.index - b.index) // Restore original order

    return topSentences.map(s => s.sentence).join(' ')
  }

  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10) // Filter out very short fragments
  }

  private scoreSentence(sentence: string, allSentences: string[], fullText: string): number {
    let score = 0

    // Position bias - earlier sentences often contain important info
    const position = allSentences.indexOf(sentence)
    const positionScore = 1 - (position / allSentences.length)
    score += positionScore * 0.2

    // Length bias - prefer medium-length sentences
    const idealLength = 100
    const lengthScore = 1 - Math.abs(sentence.length - idealLength) / idealLength
    score += Math.max(0, lengthScore) * 0.1

    // Word frequency scoring
    const words = this.extractWords(sentence)
    const allWords = this.extractWords(fullText)
    const wordFreq = this.calculateWordFrequency(allWords)
    
    const sentenceScore = words.reduce((sum, word) => {
      const freq = wordFreq[word] || 0
      // Prefer words that appear multiple times but not too frequently
      return sum + Math.min(freq * 0.1, 0.5)
    }, 0)
    
    score += sentenceScore / words.length

    // Keyword bonus
    const keywords = ['important', 'key', 'significant', 'main', 'primary', 'conclusion', 'result']
    const keywordBonus = keywords.reduce((bonus, keyword) => {
      return bonus + (sentence.toLowerCase().includes(keyword) ? 0.1 : 0)
    }, 0)
    score += keywordBonus

    return score
  }

  private async extractKeyPoints(textContent: string): Promise<string[]> {
    const sentences = this.splitIntoSentences(textContent)
    
    // Find sentences that seem to contain key information
    const keyPointIndicators = [
      'key', 'important', 'significant', 'main', 'primary', 'crucial',
      'essential', 'critical', 'major', 'notable', 'remarkable',
      'first', 'second', 'third', 'finally', 'conclusion', 'result'
    ]

    const keyPointSentences = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase()
      return keyPointIndicators.some(indicator => lowerSentence.includes(indicator))
    })

    if (keyPointSentences.length === 0) {
      // Fallback: use highest-scored sentences
      const scored = sentences.map(sentence => ({
        sentence,
        score: this.scoreSentence(sentence, sentences, textContent)
      }))
      
      return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(item => item.sentence)
    }

    return keyPointSentences.slice(0, 5)
  }

  private async analyzeSentiment(textContent: string): Promise<string> {
    // Simple rule-based sentiment analysis
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
      'positive', 'success', 'achievement', 'progress', 'improvement',
      'innovation', 'solution', 'benefit', 'advantage', 'opportunity'
    ]

    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'negative', 'problem',
      'issue', 'failure', 'decline', 'crisis', 'disaster', 'concern',
      'risk', 'threat', 'challenge', 'difficulty', 'limitation'
    ]

    const words = this.extractWords(textContent.toLowerCase())
    
    let positiveScore = 0
    let negativeScore = 0

    words.forEach(word => {
      if (positiveWords.includes(word)) {
        positiveScore++
      } else if (negativeWords.includes(word)) {
        negativeScore++
      }
    })

    const totalScore = positiveScore - negativeScore
    const threshold = words.length * 0.01 // Adjust sensitivity

    if (totalScore > threshold) {
      return 'positive'
    } else if (totalScore < -threshold) {
      return 'negative'
    } else {
      return 'neutral'
    }
  }

  private extractWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2) // Filter out very short words
  }

  private calculateWordFrequency(words: string[]): Record<string, number> {
    const frequency: Record<string, number> = {}
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1
    })

    return frequency
  }

  private calculateReadingTime(textContent: string): number {
    // Average reading speed is about 200-250 words per minute
    // We'll use 225 words per minute as a reasonable average
    const words = this.extractWords(textContent)
    const wordsPerMinute = 225
    const readingTimeMinutes = Math.ceil(words.length / wordsPerMinute)
    return Math.max(1, readingTimeMinutes) // Minimum 1 minute
  }

  // Batch processing for multiple articles
  async batchProcess(articles: Article[]): Promise<Article[]> {
    const results: Article[] = []

    for (const article of articles) {
      try {
        if (!article.summary || !article.keyPoints) {
          const processed = await this.processArticle(article)
          results.push({
            ...article,
            ...processed
          })
        } else {
          results.push(article)
        }
      } catch (error) {
        console.error(`Failed to process article ${article.id}:`, error)
        results.push(article)
      }

      // Add small delay to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return results
  }
}

export const clientAI = new ClientAIProcessor()
