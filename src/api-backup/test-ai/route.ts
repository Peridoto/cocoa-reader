import { NextRequest, NextResponse } from 'next/server';
import { processArticleLocally } from '@/lib/ai-processor';

export async function GET() {
  try {
    const sampleArticle = {
      title: "Getting Started with React Hooks",
      content: `React Hooks are a powerful feature that allow you to use state and other React features without writing a class component. The useState hook is the most commonly used hook that lets you add state to functional components. 

      To use useState, you import it from React and call it inside your function component. It returns an array with two elements: the current state value and a function to update it. This makes it easy to manage component state in a clean and readable way.

      Another important hook is useEffect, which lets you perform side effects in function components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined in React class lifecycle methods.

      When using hooks, there are important rules to follow. Always call hooks at the top level of your React function, never inside loops, conditions, or nested functions. This ensures that hooks are called in the same order every time the component renders.

      React Hooks have revolutionized how we write React components, making them more functional and easier to test. They promote better code reuse and make complex state logic more manageable.`
    };

    const result = await processArticleLocally(
      sampleArticle.title, 
      sampleArticle.content
    );

    return NextResponse.json({
      success: true,
      test: 'AI Processing Test',
      input: {
        title: sampleArticle.title,
        contentLength: sampleArticle.content.length
      },
      result: {
        summary: result.summary.summary,
        keyPoints: result.summary.keyPoints,
        readingTime: result.summary.readingTime,
        sentiment: result.summary.sentiment,
        primaryCategory: result.categories.primaryCategory,
        categories: result.categories.categories,
        tags: result.categories.tags,
        processed: result.processed
      }
    });

  } catch (error) {
    console.error('AI processing test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
