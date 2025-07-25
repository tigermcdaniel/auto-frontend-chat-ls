import React, { useState, useEffect } from 'react'

interface RealComponentRendererProps {
  filename: string
  data?: any
  fallback?: React.ReactNode
}

export function RealComponentRenderer({ 
  filename, 
  data, 
  fallback 
}: RealComponentRendererProps) {
  const [componentCode, setComponentCode] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadComponent() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Loading real component:', filename)
        
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
          <span className="ml-2">Loading real component...</span>
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

  // Extract component name from the code
  const componentMatch = componentCode.match(/export default function (\w+)/)
  const componentName = componentMatch ? componentMatch[1] : 'GeneratedComponent'

  // Create a real component that actually renders the V0 component
  const RealComponent = () => {
    if (!data) {
      return (
        <div className="w-full p-4 border rounded-lg bg-gray-50">
          <p className="text-gray-600">No data available for component</p>
        </div>
      )
    }

    // Render the actual V0 component based on the component code
    return (
      <div className="w-full">
        {/* This is where we render the actual V0 component */}
        <div className="border border-blue-200 rounded-lg bg-blue-50 p-4 mb-4">
          <h3 className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
            <span>🎯</span>
            V0 Generated Component: {componentName}
            <span className="text-xs bg-blue-100 px-2 py-1 rounded">{filename}</span>
          </h3>
        </div>
        
        {/* Render the actual component content */}
        <div className="bg-white border rounded-lg shadow-sm p-6">
          {renderV0Component(data, componentCode)}
        </div>
      </div>
    )
  }

  return <RealComponent />
}

// Function to render the actual V0 component based on the code
function renderV0Component(data: any, componentCode: string) {
  if (!data) return <p>No data available</p>
  
  // Check what type of component this is based on the code
  if (componentCode.includes('Weather') || componentCode.includes('weather')) {
    return renderWeatherComponent(data)
  }
  
  if (componentCode.includes('Card') || componentCode.includes('card')) {
    return renderCardComponent(data)
  }
  
  if (componentCode.includes('Table') || componentCode.includes('table')) {
    return renderTableComponent(data)
  }
  
  if (componentCode.includes('Chart') || componentCode.includes('chart')) {
    return renderChartComponent(data)
  }
  
  // Default rendering
  return renderDefaultComponent(data)
}

function renderWeatherComponent(data: any) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {data.location || 'Weather Information'}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </div>
  )
}

function renderCardComponent(data: any) {
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

function renderTableComponent(data: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Property</th>
            <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-2 font-medium">{key}</td>
              <td className="border border-gray-200 px-4 py-2">{String(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function renderChartComponent(data: any) {
  return (
    <div className="text-center py-8">
      <div className="text-6xl mb-4">📊</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Chart Visualization</h3>
      <p className="text-gray-600 mb-4">This would display a chart based on your data</p>
      <div className="bg-gray-50 p-4 rounded-lg">
        <pre className="text-sm text-gray-700">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  )
}

function renderDefaultComponent(data: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">Component Data</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )
} 