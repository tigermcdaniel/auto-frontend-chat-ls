import React, { useState, useEffect } from 'react'

interface ExecuteV0ComponentProps {
  filename: string
  data?: any
  fallback?: React.ReactNode
}

export function ExecuteV0Component({ 
  filename, 
  data, 
  fallback 
}: ExecuteV0ComponentProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function executeComponent() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Executing V0 component:', filename)
        
        // Get the component code
        const response = await fetch(`/api/get-component?filename=${filename}`)
        if (!response.ok) {
          throw new Error('Failed to load component file')
        }
        
        const result = await response.json()
        const componentCode = result.code
        
        console.log('Component code loaded, executing...')
        
        // Create a function that can execute the component code
        const executeCode = (code: string, props: any) => {
          try {
            // Create a safe execution environment
            const React = require('react')
            
            // Extract the component function from the code
            const functionMatch = code.match(/export default function (\w+)/)
            if (!functionMatch) {
              throw new Error('No default export function found')
            }
            
            const functionName = functionMatch[1]
            
            // Create the component function
            const componentFunction = new Function(
              'React',
              'props',
              `
                ${code.replace(/export default function \w+/, 'function GeneratedComponent')}
                return React.createElement(GeneratedComponent, props);
              `
            )
            
            // Execute the component
            return componentFunction(React, props)
          } catch (err) {
            console.error('Error executing component:', err)
            throw err
          }
        }
        
        // Create a React component that executes the V0 code
        const ExecutableComponent = (props: any) => {
          try {
            const result = executeCode(componentCode, props)
            return result
          } catch (err) {
            return React.createElement('div', { 
              className: 'p-4 border border-red-200 bg-red-50' 
            }, 
              React.createElement('p', { className: 'text-red-600' }, 
                'Error executing V0 component: ' + (err instanceof Error ? err.message : 'Unknown error')
              )
            )
          }
        }
        
        setComponent(() => ExecutableComponent)
        
      } catch (err) {
        console.error('Error setting up component execution:', err)
        setError(err instanceof Error ? err.message : 'Failed to execute component')
      } finally {
        setLoading(false)
      }
    }

    if (filename) {
      executeComponent()
    }
  }, [filename])

  if (loading) {
    return (
      <div className="w-full p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
          <span className="ml-2">Executing V0 component...</span>
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
        <p className="text-yellow-800 text-sm">V0 component not executable</p>
      </div>
    )
  }

  // Execute the V0 component with the data
  return (
    <div className="w-full">
      <Component data={data} />
    </div>
  )
} 