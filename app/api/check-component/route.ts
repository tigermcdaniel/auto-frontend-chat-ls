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
    const exists = fs.existsSync(filePath)
    
    if (exists) {
      return Response.json({ exists: true, filename })
    } else {
      return Response.json({ exists: false, filename }, { status: 404 })
    }
  } catch (error) {
    console.error('Error checking component:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
} 