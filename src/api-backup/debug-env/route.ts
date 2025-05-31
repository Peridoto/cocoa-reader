// Test API endpoint to check environment variables
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔍 Environment Variable Debug');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  return NextResponse.json({
    database_url: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    database_url_value: process.env.DATABASE_URL,
    node_env: process.env.NODE_ENV,
    all_env_keys: Object.keys(process.env).filter(key => 
      key.includes('DATABASE') || key.includes('URL')
    )
  });
}
