import React, { useState, useEffect } from 'react'

interface DynamicComponentRendererProps {
  filename: string
  data?: any
  fallback?: React.ReactNode
}

export function DynamicComponentRenderer({ 
  filename, 
  data, 
  fallback 
}: DynamicComponentRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAndExecuteComponent() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Loading and executing V0 component:', filename)
        
        // Get the component code
        const response = await fetch(`/api/get-component?filename=${filename}`)
        if (!response.ok) {
          throw new Error('Failed to load component file')
        }
        
        const result = await response.json()
        const componentCode = result.code
        
        // Create a dynamic component from the code
        const dynamicComponent = createDynamicComponent(componentCode, filename)
        setComponent(() => dynamicComponent)
        
      } catch (err) {
        console.error('Error loading component:', err)
        setError(err instanceof Error ? err.message : 'Failed to load component')
      } finally {
        setLoading(false)
      }
    }

    if (filename) {
      loadAndExecuteComponent()
    }
  }, [filename])

  function createDynamicComponent(code: string, filename: string): React.ComponentType<any> {
    try {
      // Create a function that returns the component JSX
      const componentFunction = new Function(
        'React',
        'useState',
        'useEffect',
        'Button',
        'Input', 
        'Checkbox',
        'Card',
        'CardContent',
        'CardHeader',
        'CardTitle',
        'Trash2',
        'Plus',
        'props',
        `
        ${code}
        return React.createElement(React.Fragment, null, 
          React.createElement('div', { className: 'w-full' },
            React.createElement('div', { className: 'border border-green-200 rounded-lg bg-green-50 p-2 mb-4' },
              React.createElement('p', { className: 'text-green-800 text-sm' },
                React.createElement('span', null, '🎯'),
                ' V0 Component: ',
                React.createElement('span', { className: 'font-semibold' }, '${filename.replace('.tsx', '')}')
              )
            ),
            React.createElement('div', { className: 'p-4' },
              React.createElement(GeneratedComponent || (() => React.createElement('div', null, 'Component not found')), props)
            )
          )
        )
        `
      )

      // Return the dynamic component
      return (props: any) => {
        try {
          // Import required components dynamically
          const React = require('react')
          const { useState, useEffect } = React
          
          // These would need to be imported properly in a real implementation
          const Button = () => <button>Button</button>
          const Input = () => <input />
          const Checkbox = () => <input type="checkbox" />
          const Card = ({ children }: any) => <div className="card">{children}</div>
          const CardContent = ({ children }: any) => <div className="card-content">{children}</div>
          const CardHeader = ({ children }: any) => <div className="card-header">{children}</div>
          const CardTitle = ({ children }: any) => <h3 className="card-title">{children}</h3>
          const Trash2 = () => <span>🗑️</span>
          const Plus = () => <span>➕</span>

          return componentFunction(
            React, useState, useEffect, Button, Input, Checkbox, 
            Card, CardContent, CardHeader, CardTitle, Trash2, Plus, props
          )
        } catch (err) {
          console.error('Error executing dynamic component:', err)
          return <div className="text-red-500">Error executing component: {err instanceof Error ? err.message : 'Unknown error'}</div>
        }
      }
    } catch (err) {
      console.error('Error creating dynamic component:', err)
      return () => <div className="text-red-500">Error creating component: {err instanceof Error ? err.message : 'Unknown error'}</div>
    }
  }

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

  if (!Component) {
    return fallback || (
      <div className="w-full p-4 border border-yellow-200 rounded-lg bg-yellow-50">
        <p className="text-yellow-800 text-sm">V0 component not found</p>
      </div>
    )
  }

  return <Component data={data} />
} 