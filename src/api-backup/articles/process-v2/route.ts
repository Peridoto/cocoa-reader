import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processArticleLocally } from '@/lib/ai-processor';

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json();

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    console.log('Processing article:', articleId);

    // Get the article using raw SQL to avoid type issues
    const articles = await prisma.$queryRaw`
      SELECT * FROM articles WHERE id = ${articleId}
    ` as Array<{
      id: string;
      title: string;
      textContent: string;
      excerpt: string | null;
      aiProcessed: boolean | null;
      summary: string | null;
      keyPoints: string | null;
      readingTime: number | null;
      sentiment: string | null;
      primaryCategory: string | null;
      categories: string | null;
      tags: string | null;
    }>;

    if (articles.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const article = articles[0];

    // Check if already processed
    if (article.aiProcessed) {
      return NextResponse.json({
        success: true,
        message: 'Article already processed',
        processing: {
          summary: {
            summary: article.summary,
            keyPoints: article.keyPoints ? JSON.parse(article.keyPoints) : [],
            readingTime: article.readingTime,
            sentiment: article.sentiment
          }
        },
        categories: {
          primaryCategory: article.primaryCategory,
          categories: article.categories ? JSON.parse(article.categories) : [],
          tags: article.tags ? JSON.parse(article.tags) : []
        }
      });
    }

    console.log('Starting AI processing for article:', article.title);

    // Process the article
    const result = await processArticleLocally(
      article.title,
      article.textContent,
      article.excerpt || undefined
    );

    if (!result.processed) {
      console.error('AI processing failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Processing failed' },
        { status: 500 }
      );
    }

    console.log('AI processing completed successfully');

    // Update the article using raw SQL
    await prisma.$executeRaw`
      UPDATE articles SET 
        summary = ${result.summary.summary},
        keyPoints = ${JSON.stringify(result.summary.keyPoints)},
        readingTime = ${result.summary.readingTime},
        sentiment = ${result.summary.sentiment},
        primaryCategory = ${result.categories.primaryCategory},
        categories = ${JSON.stringify(result.categories.categories)},
        tags = ${JSON.stringify(result.categories.tags)},
        aiProcessed = true,
        processedAt = datetime('now')
      WHERE id = ${articleId}
    `;

    console.log('Article updated in database');

    return NextResponse.json({
      success: true,
      message: 'Article processed successfully',
      processing: result,
      categories: result.categories
    });

  } catch (error) {
    console.error('Error processing article:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchSize = parseInt(searchParams.get('batchSize') || '5');

    console.log('Starting batch processing with batch size:', batchSize);

    // Get unprocessed articles using raw SQL
    const unprocessedArticles = await prisma.$queryRaw`
      SELECT id, title, textContent, excerpt, aiProcessed
      FROM articles 
      WHERE aiProcessed = false OR aiProcessed IS NULL
      LIMIT ${batchSize}
    ` as Array<{
      id: string;
      title: string;
      textContent: string;
      excerpt: string | null;
      aiProcessed: boolean | null;
    }>;

    console.log('Found unprocessed articles:', unprocessedArticles.length);

    if (unprocessedArticles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No unprocessed articles found',
        processed: 0,
        total: 0
      });
    }

    let processedCount = 0;
    const errors: string[] = [];

    for (const article of unprocessedArticles) {
      try {
        console.log(`Processing article: ${article.title}`);
        
        const result = await processArticleLocally(
          article.title,
          article.textContent,
          article.excerpt || undefined
        );

        if (result.processed) {
          // Update using raw SQL
          await prisma.$executeRaw`
            UPDATE articles SET 
              summary = ${result.summary.summary},
              keyPoints = ${JSON.stringify(result.summary.keyPoints)},
              readingTime = ${result.summary.readingTime},
              sentiment = ${result.summary.sentiment},
              primaryCategory = ${result.categories.primaryCategory},
              categories = ${JSON.stringify(result.categories.categories)},
              tags = ${JSON.stringify(result.categories.tags)},
              aiProcessed = true,
              processedAt = datetime('now')
            WHERE id = ${article.id}
          `;
          
          processedCount++;
          console.log(`Successfully processed: ${article.title}`);
        } else {
          errors.push(`Failed to process article: ${article.title} - ${result.error}`);
          console.error(`Failed to process: ${article.title}`, result.error);
        }
      } catch (error) {
        const errorMsg = `Error processing "${article.title}": ${error}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Batch processing completed. Processed: ${processedCount}/${unprocessedArticles.length}`);

    return NextResponse.json({
      success: true,
      message: `Batch processing completed`,
      processed: processedCount,
      total: unprocessedArticles.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error in batch processing:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
