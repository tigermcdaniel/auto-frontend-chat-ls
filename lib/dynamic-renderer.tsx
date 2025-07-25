import React, { useState, useEffect, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DynamicRendererProps {
  filename: string
  componentName?: string
  data?: any
  showCode?: boolean
}

export function DynamicRenderer({ 
  filename, 
  componentName,
  data, 
  showCode = false 
}: DynamicRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [componentCode, setComponentCode] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRawCode, setShowRawCode] = useState(showCode)

  useEffect(() => {
    async function loadComponent() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('DynamicRenderer: Loading component:', filename)
        console.log('DynamicRenderer: Component name:', componentName)

        console.log('trying to load component from: ', `../components/generated/${filename}`)
        
        // Use dynamic import to load the component
        const module = await import(`../components/generated/${filename}`)

        // Get the component by name or default export
        let importedComponent = null
        if (componentName && module[componentName]) {
          importedComponent = module[componentName]
          console.log('DynamicRenderer: Found component by name:', componentName)
        } else if (module.default) {
          importedComponent = module.default
          console.log('DynamicRenderer: Using default export')
        } else {
          // Try to find any exported function
          const exports = Object.keys(module)
          const componentExport = exports.find(key => typeof module[key] === 'function')
          if (componentExport) {
            importedComponent = module[componentExport]
            console.log('DynamicRenderer: Found component export:', componentExport)
          }
        }
        
        if (!importedComponent) {
          throw new Error('No component found in module')
        }
        
        console.log('DynamicRenderer: Component loaded successfully')
        
        // Simply render the imported component directly
        setComponent(() => importedComponent)
        
      } catch (err) {
        console.error('DynamicRenderer: Error loading component:', err)
        setError(err instanceof Error ? err.message : 'Failed to load component')
      } finally {
        setLoading(false)
      }
    }

    if (filename) {
      loadComponent()
    }
  }, [filename, componentName])

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading component...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            Component Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          {componentCode && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Component Code:</span>
                <Badge variant="outline" className="text-xs">
                  {filename}
                </Badge>
              </div>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto max-h-96">
                {componentCode}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!Component) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No component to render</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Generated Component</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {filename}
            </Badge>
            {componentName && (
              <Badge variant="outline" className="text-xs">
                {componentName}
              </Badge>
            )}
            {showRawCode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRawCode(!showRawCode)}
                className="h-6 px-2"
              >
                <Code className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense fallback={
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2">Rendering component...</span>
          </div>
        }>
          <Component data={data?.sampleData || data} />
        </Suspense>
        {showRawCode && componentCode && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Component Code:</span>
              <Badge variant="outline" className="text-xs">
                {filename}
              </Badge>
            </div>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto max-h-96">
              {componentCode}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Lazy loader wrapper for better performance
export function LazyDynamicRenderer(props: DynamicRendererProps) {
  return (
    <Suspense fallback={
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading component...</span>
          </div>
        </CardContent>
      </Card>
    }>
      <DynamicRenderer {...props} />
    </Suspense>
  )
} 