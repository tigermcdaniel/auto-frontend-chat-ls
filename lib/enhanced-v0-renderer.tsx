import React, { useState, useEffect } from 'react'

interface EnhancedV0RendererProps {
  filename: string
  data?: any
  fallback?: React.ReactNode
}

export function EnhancedV0Renderer({ 
  filename, 
  data, 
  fallback 
}: EnhancedV0RendererProps) {
  const [componentCode, setComponentCode] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadComponent() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Loading enhanced V0 component:', filename)
        
        // Get the component code
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
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading enhanced V0 component...</span>
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

  // Create an enhanced component that renders the V0 component with better data visualization
  const EnhancedComponent = () => {
    return (
      <div className="w-full">
        {/* Header showing this is the V0 component */}
        <div className="border border-blue-200 rounded-lg bg-blue-50 p-3 mb-4">
          <h3 className="text-blue-800 font-semibold text-sm flex items-center gap-2">
            <span>🎯</span>
            V0 Generated Component: {componentName}
            <span className="text-xs bg-blue-100 px-2 py-1 rounded">{filename}</span>
          </h3>
        </div>
        
        {/* Render the actual V0 component structure but with enhanced data display */}
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">
            {componentName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </h3>
          <div className="text-gray-600">
            {data ? (
              <div>
                {/* Enhanced data visualization instead of just JSON */}
                {renderEnhancedData(data)}
                
                {/* Also show the original JSON for reference */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    View Raw Data (JSON)
                  </summary>
                  <pre className="text-sm bg-gray-50 p-2 rounded mt-2 overflow-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <p>No data available</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return <EnhancedComponent />
}

// Function to render data in an enhanced way instead of just JSON
function renderEnhancedData(data: any) {
  if (!data) return <p>No data available</p>
  
  // Check if it's weather-related data
  if (data.location || data.temperature || data.condition || data.humidity || data.windSpeed) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {data.location || 'Weather Dashboard'}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.temperature && (
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 font-medium">Temperature</p>
                  <p className="text-3xl font-bold text-red-800">{data.temperature}°C</p>
                </div>
                <div className="text-4xl">🌡️</div>
              </div>
            </div>
          )}
          
          {data.condition && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 font-medium">Condition</p>
                  <p className="text-lg font-semibold text-blue-800">{data.condition}</p>
                </div>
                <div className="text-4xl">
                  {data.condition?.toLowerCase().includes('sunny') ? '☀️' : 
                   data.condition?.toLowerCase().includes('rain') ? '🌧️' : 
                   data.condition?.toLowerCase().includes('cloud') ? '☁️' : '🌤️'}
                </div>
              </div>
            </div>
          )}
          
          {data.humidity && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 font-medium">Humidity</p>
                  <p className="text-2xl font-bold text-green-800">{data.humidity}%</p>
                </div>
                <div className="text-4xl">💧</div>
              </div>
            </div>
          )}
          
          {data.windSpeed && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 font-medium">Wind Speed</p>
                  <p className="text-2xl font-bold text-gray-800">{data.windSpeed} km/h</p>
                </div>
                <div className="text-4xl">💨</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Forecast section if available */}
        {data.forecast && Array.isArray(data.forecast) && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Forecast</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {data.forecast.map((day: any, index: number) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                  <p className="font-medium text-gray-800">{day.date}</p>
                  <p className="text-sm text-gray-600">{day.condition}</p>
                  <p className="text-lg font-bold text-gray-900">{day.high}° / {day.low}°</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
  
  // For other types of data, render as cards
  if (typeof data === 'object' && data !== null) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-2 capitalize">{key}</h3>
            <p className="text-purple-900">{String(value)}</p>
          </div>
        ))}
      </div>
    )
  }
  
  // For simple values
  return <p className="text-gray-900">{String(data)}</p>
} 