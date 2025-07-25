import React, { useState, useEffect } from 'react'

interface SimpleComponentLoaderProps {
  filename: string
  data?: any
  fallback?: React.ReactNode
}

export function SimpleComponentLoader({ 
  filename, 
  data, 
  fallback 
}: SimpleComponentLoaderProps) {
  const [componentCode, setComponentCode] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadComponent() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Loading component code for:', filename)
        
        // Fetch the component code from the API
        const response = await fetch(`/api/get-component?filename=${filename}`)
        
        if (!response.ok) {
          throw new Error(`Failed to load component: ${response.statusText}`)
        }
        
        const result = await response.json()
        console.log('Component code loaded:', result.code?.substring(0, 100) + '...')
        
        setComponentCode(result.code || '')
      } catch (err) {
        console.error('Error loading component code:', err)
        setError(err instanceof Error ? err.message : 'Failed to load component')
      } finally {
        setLoading(false)
      }
    }

    if (filename) {
      loadComponent()
    }
  }, [filename])

  if (loading) {
    return (
      <div className="w-full p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading component...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full p-4 border border-red-200 rounded-lg bg-red-50">
        <h3 className="text-red-800 font-semibold mb-2">Component Error</h3>
        <p className="text-red-600 text-sm">{error}</p>
        {fallback && <div className="mt-4">{fallback}</div>}
      </div>
    )
  }

  if (!componentCode) {
    return fallback || (
      <div className="w-full p-4 border border-yellow-200 rounded-lg bg-yellow-50">
        <p className="text-yellow-800 text-sm">Component not found</p>
      </div>
    )
  }

  // Try to render the component using a different approach
  try {
    // Create a simple component that renders the data
    const SimpleComponent = () => {
      if (!data) {
        return (
          <div className="w-full p-4 border rounded-lg bg-gray-50">
            <p className="text-gray-600">No data available for component</p>
          </div>
        )
      }

      // Render a basic component based on the data structure
      return (
        <div className="w-full border border-blue-200 rounded-lg bg-blue-50 p-4">
          <h3 className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
            <span>📄</span>
            Generated Component
            <span className="text-xs bg-blue-100 px-2 py-1 rounded">{filename}</span>
          </h3>
          
          <div className="mb-4">
            <h4 className="font-medium text-blue-700 mb-2">Component Data:</h4>
            <div className="bg-white p-3 rounded border">
              <pre className="text-xs overflow-auto max-h-64">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium text-blue-700 mb-2">Component Code:</h4>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-64">
              {componentCode}
            </pre>
          </div>
          
          <div className="text-xs text-blue-600">
            <p>💡 This component has been saved to your codebase and can be imported and used in other parts of your application.</p>
          </div>
        </div>
      )
    }

    return <SimpleComponent />
  } catch (err) {
    console.error('Error rendering component:', err)
    return fallback || (
      <div className="w-full p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600 text-sm">Error rendering component: {err instanceof Error ? err.message : 'Unknown error'}</p>
      </div>
    )
  }
} 