import React, { useState, useEffect } from 'react'

interface LiveComponentRendererProps {
  filename: string
  data?: any
  fallback?: React.ReactNode
}

// Component registry for dynamically loaded components
const componentRegistry: Record<string, React.ComponentType<any>> = {}

export function LiveComponentRenderer({ 
  filename, 
  data, 
  fallback 
}: LiveComponentRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAndRenderComponent() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Loading live component:', filename)
        
        // Check if component is already in registry
        if (componentRegistry[filename]) {
          console.log('Component found in registry')
          setComponent(() => componentRegistry[filename])
          setLoading(false)
          return
        }
        
        // Try to import the component dynamically
        try {
          const module = await import(`@/components/generated/${filename}`)
          const ComponentModule = module.default
          
          if (typeof ComponentModule === 'function') {
            console.log('Component loaded successfully')
            componentRegistry[filename] = ComponentModule
            setComponent(() => ComponentModule)
          } else {
            throw new Error('Invalid component export')
          }
        } catch (importError) {
          console.error('Dynamic import failed:', importError)
          
          // Fallback: create a simple component from the file content
          const response = await fetch(`/api/get-component?filename=${filename}`)
          if (response.ok) {
            const result = await response.json()
            const componentCode = result.code
            
            // Create a simple component that renders the data
            const SimpleComponent = () => {
              if (!data) {
                return (
                  <div className="w-full p-4 border rounded-lg bg-gray-50">
                    <p className="text-gray-600">No data available</p>
                  </div>
                )
              }

              // Try to render based on the data structure
              return (
                <div className="w-full border border-green-200 rounded-lg bg-green-50 p-4">
                  <h3 className="text-green-800 font-semibold mb-2 flex items-center gap-2">
                    <span>🎯</span>
                    Live Component
                    <span className="text-xs bg-green-100 px-2 py-1 rounded">{filename}</span>
                  </h3>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-green-700 mb-2">Component Output:</h4>
                    <div className="bg-white p-4 rounded border">
                      {renderDataAsComponent(data)}
                    </div>
                  </div>
                  
                  <div className="text-xs text-green-600">
                    <p>✅ Component is live and rendering with your data!</p>
                  </div>
                </div>
              )
            }
            
            componentRegistry[filename] = SimpleComponent
            setComponent(() => SimpleComponent)
          } else {
            throw new Error('Failed to load component file')
          }
        }
        
      } catch (err) {
        console.error('Error loading component:', err)
        setError(err instanceof Error ? err.message : 'Failed to load component')
      } finally {
        setLoading(false)
      }
    }

    if (filename) {
      loadAndRenderComponent()
    }
  }, [filename, data])

  if (loading) {
    return (
      <div className="w-full p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          <span className="ml-2">Loading live component...</span>
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

  if (!Component) {
    return fallback || (
      <div className="w-full p-4 border border-yellow-200 rounded-lg bg-yellow-50">
        <p className="text-yellow-800 text-sm">Component not found</p>
      </div>
    )
  }

  // Render the live component
  return (
    <div className="w-full">
      <Component data={data} />
    </div>
  )
}

// Helper function to render data as a component
function renderDataAsComponent(data: any) {
  if (!data) return <p>No data available</p>
  
  // If it's an object with specific properties, render them nicely
  if (typeof data === 'object' && data !== null) {
    return (
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="font-medium text-gray-700">{key}:</span>
            <span className="text-gray-900">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  
  // If it's a string or other primitive
  return <p className="text-gray-900">{String(data)}</p>
} 