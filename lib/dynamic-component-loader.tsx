import React, { Suspense, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

interface DynamicComponentProps {
  filename: string
  data?: any
  fallback?: React.ReactNode
}

interface ComponentInfo {
  filename: string
  analysis?: any
  error?: string
}

export function DynamicComponentLoader({ 
  filename, 
  data, 
  fallback 
}: DynamicComponentProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadComponent() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Loading component:', filename)
        

        
        // Dynamic import of the component
        const module = await import(`@/components/generated/${filename}`)
        console.log('Module loaded:', module)
        
        const ComponentModule = module.default || module.Component || module
        console.log('Component module:', ComponentModule)
        
        if (typeof ComponentModule === 'function') {
          console.log('Setting component successfully')
          setComponent(() => ComponentModule)
        } else {
          console.error('Component module is not a function:', typeof ComponentModule)
          throw new Error('Invalid component export')
        }
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
      <Card className="w-full border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Component Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">{error}</p>
          {fallback && <div className="mt-4">{fallback}</div>}
        </CardContent>
      </Card>
    )
  }

  if (!Component) {
    return fallback || (
      <Card className="w-full border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <p className="text-yellow-800 text-sm">Component not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Suspense fallback={
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-4 w-4 animate-spin" />
        </CardContent>
      </Card>
    }>
      <Component data={data} />
    </Suspense>
  )
}

// Fallback component for when dynamic loading fails
export function ComponentFallback({ 
  componentCode, 
  analysis, 
  filename 
}: { 
  componentCode: string
  analysis?: any
  filename?: string 
}) {
  // Clean up the component code
  let cleanedCode = componentCode
    .replace(/```jsx?/g, '')
    .replace(/```tsx?/g, '')
    .replace(/```/g, '')
    .trim()

  // Validate code: must contain a function export and not start with '<'
  if (
    !/export (default )?function Component/.test(cleanedCode) ||
    cleanedCode.trim().startsWith('<')
  ) {
    throw new Error('AI did not return valid React component code. Please try again or rephrase your request.');
  }

  return (
    <Card className="w-full border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center gap-2">
          <span>📄</span>
          Generated Component
          {filename && <Badge variant="outline" className="text-xs">{filename}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analysis && (
          <div className="mb-4 p-3 bg-white rounded border">
            <h4 className="font-medium text-blue-700 mb-2">Analysis:</h4>
            <div className="text-sm space-y-1">
              <p><strong>Intent:</strong> {analysis.intent}</p>
              <p><strong>Display Type:</strong> {analysis.displayType}</p>
              <p><strong>Instructions:</strong> {analysis.instructions}</p>
            </div>
          </div>
        )}
        
        <div>
          <h4 className="font-medium text-blue-700 mb-2">Component Code:</h4>
          <pre className="text-xs bg-gray-100 p-3 rounded border overflow-auto max-h-64">
            {componentCode}
          </pre>
        </div>
        
        <div className="mt-3 text-xs text-blue-600">
          <p>💡 This component has been saved to your codebase and can be imported and used in other parts of your application.</p>
        </div>
      </CardContent>
    </Card>
  )
} 