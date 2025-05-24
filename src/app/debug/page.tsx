export default function DebugPage() {
  console.log('DebugPage component is rendering')
  
  return (
    <html>
      <head>
        <title>Debug Test</title>
      </head>
      <body style={{ margin: 0, padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
          <h1 style={{ color: '#333', margin: '0 0 10px 0' }}>🔍 Debug Test Page</h1>
          <p style={{ color: '#666', margin: '0 0 20px 0' }}>
            This is a minimal test page to verify Next.js is working.
          </p>
          <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '4px', border: '1px solid #4caf50' }}>
            <strong style={{ color: '#2e7d32' }}>✅ SUCCESS:</strong>
            <span style={{ color: '#2e7d32', marginLeft: '8px' }}>
              If you can see this page, Next.js is rendering components correctly.
            </span>
          </div>
          <div style={{ marginTop: '20px' }}>
            <a 
              href="/" 
              style={{ 
                display: 'inline-block',
                padding: '10px 16px',
                backgroundColor: '#007acc',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px'
              }}
            >
              Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
