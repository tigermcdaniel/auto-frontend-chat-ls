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
    
    // Extract the component name
    const componentMatch = componentCode.match(/export default function (\w+)/)
    const componentName = componentMatch ? componentMatch[1] : 'GeneratedComponent'
    
    // For now, return the component code and data so the client can render it
    // In a real implementation, you might use a server-side React renderer
    return Response.json({ 
      componentCode,
      componentName,
      filename,
      data,
      message: 'Component loaded successfully. Rendering on client side.'
    })
  } catch (error) {
    console.error('Error executing component:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
} 