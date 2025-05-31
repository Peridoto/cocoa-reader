import { NextRequest, NextResponse } from 'next/server'

/**
 * Test endpoint to verify API is working
 */
export async function GET() {
  return NextResponse.json({ message: 'API is working', timestamp: new Date().toISOString() })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({ 
      message: 'POST endpoint working', 
      received: body,
      timestamp: new Date().toISOString() 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to parse request body',
      timestamp: new Date().toISOString() 
    }, { status: 400 })
  }
}
