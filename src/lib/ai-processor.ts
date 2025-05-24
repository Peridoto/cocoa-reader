/**
 * AI Processing Module for Article Summarization and Categorization
 * Uses Transformers.js for completely local AI processing
 */

// Note: For enhanced AI processing, consider adding @xenova/transformers
// import { pipeline, env } from '@xenova/transformers';

// Configure for local processing only
// env.allowRemoteModels = false;
// env.allowLocalModels = true;

export interface ArticleSummary {
  summary: string;
  keyPoints: string[];
  readingTime: number; // in minutes
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface ArticleCategories {
  primaryCategory: string;
  categories: string[];
  tags: string[];
  confidence: number;
}

export interface ProcessingResult {
  summary: ArticleSummary;
  categories: ArticleCategories;
  processed: boolean;
  error?: string;
}

// Predefined categories based on common article types
const ARTICLE_CATEGORIES = [
  'Technology',
  'Programming',
  'Science',
  'Business',
  'Health',
  'Education',
  'Entertainment',
  'Sports',
  'Politics',
  'Travel',
  'Food',
  'Fashion',
  'Finance',
  'Personal Development',
  'News',
  'Tutorial',
  'Opinion',
  'Review'
];

/**
 * Extract key sentences using extractive summarization
 */
export function extractKeySentences(text: string, maxSentences: number = 3): string[] {
  // Simple sentence splitting and scoring
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  if (sentences.length <= maxSentences) {
    return sentences;
  }

  // Score sentences based on word frequency and position
  const wordFreq: Record<string, number> = {};
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  
  words.forEach(word => {
    if (word.length > 3) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  const scoredSentences = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    const score = sentenceWords.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
    const positionBonus = index < 3 ? 2 : 1; // Boost early sentences
    
    return {
      sentence,
      score: score * positionBonus,
      index
    };
  });

  return scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index)
    .map(item => item.sentence);
}

/**
 * Estimate reading time based on word count
 */
export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Simple sentiment analysis using keyword matching
 */
export function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'best', 'love', 'fantastic', 'awesome', 'brilliant'];
  const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'hate', 'horrible', 'disappointing', 'failed', 'problem', 'issue'];
  
  const words = text.toLowerCase().split(/\W+/);
  const positiveCount = words.filter(word => positiveWords.includes(word)).length;
  const negativeCount = words.filter(word => negativeWords.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * Categorize article based on content analysis
 */
export function categorizeArticle(title: string, content: string): ArticleCategories {
  const text = (title + ' ' + content).toLowerCase();
  const words = text.match(/\b\w+\b/g) || [];
  
  // Category keywords mapping
  const categoryKeywords: Record<string, string[]> = {
    'Technology': ['technology', 'tech', 'software', 'hardware', 'digital', 'computer', 'internet', 'ai', 'artificial intelligence'],
    'Programming': ['code', 'programming', 'developer', 'javascript', 'python', 'react', 'api', 'database', 'github', 'algorithm'],
    'Science': ['science', 'research', 'study', 'experiment', 'discovery', 'physics', 'chemistry', 'biology', 'medical'],
    'Business': ['business', 'company', 'startup', 'entrepreneur', 'market', 'sales', 'revenue', 'profit', 'investment'],
    'Health': ['health', 'medical', 'doctor', 'patient', 'treatment', 'medicine', 'wellness', 'fitness', 'nutrition'],
    'Education': ['education', 'learning', 'school', 'university', 'student', 'teacher', 'course', 'tutorial', 'knowledge'],
    'Entertainment': ['movie', 'film', 'music', 'game', 'entertainment', 'celebrity', 'show', 'series', 'fun'],
    'Tutorial': ['how to', 'tutorial', 'guide', 'step by step', 'learn', 'beginner', 'instructions', 'tips']
  };

  // Score each category
  const categoryScores: Record<string, number> = {};
  
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    const score = keywords.reduce((sum, keyword) => {
      const matches = text.split(keyword).length - 1;
      return sum + matches;
    }, 0);
    categoryScores[category] = score;
  });

  // Find best matching categories
  const sortedCategories = Object.entries(categoryScores)
    .sort(([,a], [,b]) => b - a)
    .filter(([,score]) => score > 0);

  const primaryCategory = sortedCategories[0]?.[0] || 'General';
  const categories = sortedCategories.slice(0, 3).map(([cat]) => cat);
  
  // Extract potential tags (frequent meaningful words)
  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    if (word.length > 4 && !['that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'].includes(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  const tags = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);

  return {
    primaryCategory,
    categories,
    tags,
    confidence: sortedCategories[0]?.[1] || 0
  };
}

/**
 * Process article for AI insights (without external AI models initially)
 */
export async function processArticleLocally(
  title: string,
  content: string,
  excerpt?: string
): Promise<ProcessingResult> {
  try {
    // Use excerpt if available and content is very long
    const textToAnalyze = content.length > 5000 && excerpt 
      ? excerpt 
      : content.slice(0, 3000); // Limit for performance

    // Extract key information
    const keyPoints = extractKeySentences(textToAnalyze, 3);
    const readingTime = estimateReadingTime(content);
    const sentiment = analyzeSentiment(textToAnalyze);
    const categories = categorizeArticle(title, textToAnalyze);

    // Create summary from key points
    const summary = keyPoints.length > 0 
      ? keyPoints.join(' ') 
      : excerpt || content.slice(0, 200) + '...';

    return {
      summary: {
        summary,
        keyPoints,
        readingTime,
        sentiment
      },
      categories,
      processed: true
    };

  } catch (error) {
    console.error('Error processing article:', error);
    return {
      summary: {
        summary: excerpt || content.slice(0, 200) + '...',
        keyPoints: [],
        readingTime: estimateReadingTime(content),
        sentiment: 'neutral'
      },
      categories: {
        primaryCategory: 'General',
        categories: ['General'],
        tags: [],
        confidence: 0
      },
      processed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Enhanced AI processing with Transformers.js (optional, requires model download)
 * Currently commented out - to enable, install @xenova/transformers and uncomment
 */
/*
export async function processArticleWithAI(
  title: string,
  content: string
): Promise<ProcessingResult> {
  try {
    // Initialize summarization pipeline (downloads model on first use)
    const summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
    
    // Limit content length for the model
    const maxLength = 1024;
    const textToSummarize = content.length > maxLength 
      ? content.slice(0, maxLength)
      : content;

    // Generate AI summary
    const summaryResult = await summarizer(textToSummarize, {
      max_length: 100,
      min_length: 30,
      do_sample: false,
    });

    const aiSummary = summaryResult[0]?.summary_text || '';

    // Combine AI summary with local processing
    const localResult = await processArticleLocally(title, content);
    
    return {
      ...localResult,
      summary: {
        ...localResult.summary,
        summary: aiSummary || localResult.summary.summary
      }
    };

  } catch (error) {
    console.warn('AI processing failed, falling back to local processing:', error);
    // Fallback to local processing
    return processArticleLocally(title, content);
  }
}
*/

/**
 * Batch process multiple articles
 */
export async function batchProcessArticles(
  articles: Array<{ id: string; title: string; textContent: string; excerpt?: string }>
): Promise<Record<string, ProcessingResult>> {
  const results: Record<string, ProcessingResult> = {};
  
  for (const article of articles) {
    results[article.id] = await processArticleLocally(
      article.title, 
      article.textContent, 
      article.excerpt || undefined
    );
    
    // Small delay to prevent blocking
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}
