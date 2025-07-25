import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    
    if (!filename) {
      return Response.json({ error: 'Filename parameter is required' }, { status: 400 })
    }
    
    const filePath = path.join(process.cwd(), 'components', 'generated', filename)
    
    if (!fs.existsSync(filePath)) {
      return Response.json({ error: 'Component file not found' }, { status: 404 })
    }
    
    const code = fs.readFileSync(filePath, 'utf8')
    
    return Response.json({ 
      code,
      filename,
      exists: true
    })
  } catch (error) {
    console.error('Error getting component:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
} 