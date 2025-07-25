import React, { useState, useEffect } from 'react'

interface V0ComponentRendererProps {
  filename: string
  data?: any
  fallback?: React.ReactNode
}

export function V0ComponentRenderer({ 
  filename, 
  data, 
  fallback 
}: V0ComponentRendererProps) {
  const [renderedComponent, setRenderedComponent] = useState<React.ReactNode>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function renderComponent() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Rendering V0 component:', filename)
        
        // Get the component code from the API
        const response = await fetch(`/api/get-component?filename=${filename}`)
        if (!response.ok) {
          throw new Error('Failed to load component file')
        }
        
        const result = await response.json()
        const componentCode = result.code
        
        console.log('Component code loaded, creating renderable component...')
        
        // Create a renderable component by creating a blob URL
        const renderableCode = `
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer } from "lucide-react"

${componentCode}

// Create a wrapper that provides the data
function V0ComponentWrapper(props) {
  try {
    // Extract the component name
    const componentMatch = \`${componentCode}\`.match(/export default function (\\w+)/)
    const componentName = componentMatch ? componentMatch[1] : 'GeneratedComponent'
    
    // Create the component dynamically
    const Component = eval(\`(${componentCode.replace(/export default function \w+/, 'function GeneratedComponent')})\`)
    return React.createElement(Component, props)
  } catch (error) {
    console.error('Error rendering V0 component:', error)
    return React.createElement('div', { 
      className: 'p-4 border border-red-200 bg-red-50' 
    }, 
      React.createElement('p', { className: 'text-red-600' }, 
        'Error rendering component: ' + error.message
      )
    )
  }
}

export default V0ComponentWrapper
`
        
        // Create a blob URL for the component
        const blob = new Blob([renderableCode], { type: 'application/javascript' })
        const componentUrl = URL.createObjectURL(blob)
        
        try {
          // Import the component
          const module = await import(componentUrl)
          const Component = module.default
          
          if (typeof Component === 'function') {
            console.log('V0 component loaded successfully, rendering...')
            const rendered = React.createElement(Component, { data })
            setRenderedComponent(rendered)
          } else {
            throw new Error('Invalid component export')
          }
        } finally {
          // Clean up the blob URL
          URL.revokeObjectURL(componentUrl)
        }
        
      } catch (err) {
        console.error('Error rendering V0 component:', err)
        setError(err instanceof Error ? err.message : 'Failed to render component')
      } finally {
        setLoading(false)
      }
    }

    if (filename) {
      renderComponent()
    }
  }, [filename, data])

  if (loading) {
    return (
      <div className="w-full p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
          <span className="ml-2">Rendering V0 component...</span>
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

  if (!renderedComponent) {
    return fallback || (
      <div className="w-full p-4 border border-yellow-200 rounded-lg bg-yellow-50">
        <p className="text-yellow-800 text-sm">V0 component not rendered</p>
      </div>
    )
  }

  // Return the rendered component
  return (
    <div className="w-full">
      {renderedComponent}
    </div>
  )
} 