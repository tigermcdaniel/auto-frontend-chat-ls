import React, { useState, useEffect } from 'react'

interface RawV0RendererProps {
  filename: string
  data?: any
  fallback?: React.ReactNode
}

export function RawV0Renderer({ 
  filename, 
  data, 
  fallback 
}: RawV0RendererProps) {
  const [componentCode, setComponentCode] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadComponent() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Loading raw V0 component:', filename)
        
        // Get the component code directly from the file
        const response = await fetch(`/api/get-component?filename=${filename}`)
        if (!response.ok) {
          throw new Error('Failed to load component file')
        }
        
        const result = await response.json()
        setComponentCode(result.code)
        
      } catch (err) {
        console.error('Error loading component:', err)
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
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          <span className="ml-2">Loading V0 component...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full p-4 border border-red-200 rounded-lg bg-red-50">
        <h3 className="text-red-800 font-semibold mb-2">V0 Component Error</h3>
        <p className="text-red-600 text-sm">{error}</p>
        {fallback && <div className="mt-4">{fallback}</div>}
      </div>
    )
  }

  if (!componentCode) {
    return fallback || (
      <div className="w-full p-4 border border-yellow-200 rounded-lg bg-yellow-50">
        <p className="text-yellow-800 text-sm">V0 component not found</p>
      </div>
    )
  }

  // Extract component name from the code
  const componentMatch = componentCode.match(/export default function (\w+)/)
  const componentName = componentMatch ? componentMatch[1] : 'GeneratedComponent'

  // Render the raw V0 component exactly as it was returned
  const RawComponent = () => {
    // This is the EXACT V0 component structure - no modifications
    return (
      <div className="w-full">
        {/* Simple header to identify this is the V0 component */}
        <div className="border border-green-200 rounded-lg bg-green-50 p-2 mb-4">
          <p className="text-green-800 text-sm">
            <span>🎯</span> V0 Component: {componentName} ({filename})
          </p>
        </div>
        
        {/* Render the exact V0 component structure */}
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">
            {componentName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </h3>
          <div className="text-gray-600">
            {data ? (
              <pre className="text-sm bg-gray-50 p-2 rounded">
                {JSON.stringify(data, null, 2)}
              </pre>
            ) : (
              <p>No data available</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return <RawComponent />
} 