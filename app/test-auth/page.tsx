'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function AuthTestPage() {
  const { data: session, status } = useSession()
  const [cookies, setCookies] = useState<string>('')
  const [apiTest, setApiTest] = useState<any>(null)

  useEffect(() => {
    setCookies(document.cookie)
    
    // Test API with credentials
    fetch('/api/test-auth', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setApiTest(data))
      .catch(err => setApiTest({ error: err.message }))
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 Authentication Debug Page</h1>
      
      <div className="space-y-6">
        {/* Session Status */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Session Status</h2>
          <p className="mb-2">Status: <strong className={
            status === 'authenticated' ? 'text-green-600' : 
            status === 'loading' ? 'text-yellow-600' : 
            'text-red-600'
          }>{status}</strong></p>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        {/* Browser Cookies */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Browser Cookies</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {cookies || 'No cookies found'}
          </pre>
          <p className="mt-2 text-sm text-gray-600">
            Looking for: <code>next-auth.session-token</code> or <code>__Secure-next-auth.session-token</code>
          </p>
        </div>

        {/* API Test */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">API Auth Test</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(apiTest, null, 2)}
          </pre>
        </div>

        {/* Actions */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Actions</h2>
          {status === 'authenticated' ? (
            <div>
              <p className="text-green-600 mb-4">✅ You are logged in as: {session?.user?.email}</p>
              <a 
                href="/api/auth/signout"
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sign Out
              </a>
            </div>
          ) : (
            <div>
              <p className="text-red-600 mb-4">❌ You are NOT logged in</p>
              <a 
                href="/auth/login"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Go to Login
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
