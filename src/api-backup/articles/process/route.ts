import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { processArticleLocally } from '@/lib/ai-processor';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, useAI = false } = body;

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Get the article
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Process the article
    const result = await processArticleLocally(
      article.title,
      article.textContent,
      article.excerpt || undefined
    );

    if (!result.processed) {
      return NextResponse.json(
        { error: result.error || 'Processing failed' },
        { status: 500 }
      );
    }

    // Update the article with AI processing results
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        summary: result.summary.summary,
        keyPoints: JSON.stringify(result.summary.keyPoints),
        readingTime: result.summary.readingTime,
        sentiment: result.summary.sentiment,
        primaryCategory: result.categories.primaryCategory,
        categories: JSON.stringify(result.categories.categories),
        tags: JSON.stringify(result.categories.tags),
        aiProcessed: true,
      },
    });

    return NextResponse.json({
      success: true,
      article: updatedArticle,
      processing: result,
    });

  } catch (error) {
    console.error('Error processing article:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchSize = parseInt(searchParams.get('batchSize') || '10');
    
    // Get unprocessed articles
    const unprocessedArticles = await prisma.article.findMany({
      where: {
        aiProcessed: false,
      },
      take: batchSize,
      select: {
        id: true,
        title: true,
        textContent: true,
        excerpt: true,
      },
    });

    if (unprocessedArticles.length === 0) {
      return NextResponse.json({
        message: 'No unprocessed articles found',
        processed: 0,
      });
    }

    // Process articles in batch
    const results = [];
    for (const article of unprocessedArticles) {
      try {
        const result = await processArticleLocally(
          article.title,
          article.textContent,
          article.excerpt || undefined
        );

        if (result.processed) {
          await prisma.article.update({
            where: { id: article.id },
            data: {
              summary: result.summary.summary,
              keyPoints: JSON.stringify(result.summary.keyPoints),
              readingTime: result.summary.readingTime,
              sentiment: result.summary.sentiment,
              primaryCategory: result.categories.primaryCategory,
              categories: JSON.stringify(result.categories.categories),
              tags: JSON.stringify(result.categories.tags),
              aiProcessed: true,
            },
          });

          results.push({ id: article.id, success: true });
        } else {
          results.push({ id: article.id, success: false, error: result.error });
        }
      } catch (error) {
        console.error(`Error processing article ${article.id}:`, error);
        results.push({ 
          id: article.id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }

      // Small delay between processing
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      processed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });

  } catch (error) {
    console.error('Error in batch processing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
