import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { filename, data } = await request.json()
    
    if (!filename) {
      return Response.json({ error: 'Filename parameter is required' }, { status: 400 })
    }
    
    const filePath = path.join(process.cwd(), 'components', 'generated', filename)
    
    if (!fs.existsSync(filePath)) {
      return Response.json({ error: 'Component file not found' }, { status: 404 })
    }
    
    const componentCode = fs.readFileSync(filePath, 'utf8')
    
    // Extract the component name from the code
    const componentMatch = componentCode.match(/export default function (\w+)/)
    const componentName = componentMatch ? componentMatch[1] : 'GeneratedComponent'
    
    // Create a renderable component by wrapping it with necessary imports and data
    const renderableComponent = `
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer } from "lucide-react"

${componentCode}

// Create a wrapper component that provides the data
function ComponentWrapper() {
  const componentData = ${JSON.stringify(data || {})}
  
  try {
    const Component = ${componentName}
    return React.createElement(Component, { data: componentData })
  } catch (error) {
    return React.createElement('div', { 
      className: 'p-4 border border-red-200 bg-red-50' 
    }, 
      React.createElement('p', { className: 'text-red-600' }, 
        'Error rendering component: ' + error.message
      )
    )
  }
}

export default ComponentWrapper
`
    
    return Response.json({ 
      componentCode: renderableComponent,
      componentName,
      filename,
      data
    })
  } catch (error) {
    console.error('Error rendering component:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
} 