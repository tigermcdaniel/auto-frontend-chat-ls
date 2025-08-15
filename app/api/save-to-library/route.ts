import { NextRequest } from 'next/server'
import { saveToLibrary, getLibraryComponents, deleteFromLibrary } from '@/lib/component-library'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { generatedFilename, componentName, autoExtract } = body
    
    if (!generatedFilename || !componentName) {
      return Response.json({ 
        error: 'Generated filename and component name are required' 
      }, { status: 400 })
    }
    
    let description = ''
    let category = 'general'
    let tags: string[] = []
    
    if (autoExtract) {
      // Auto-extract metadata from the component
      const extracted = await extractComponentMetadata(generatedFilename, componentName)
      description = extracted.description
      category = extracted.category
      tags = extracted.tags
    }
    
          const savedComponent = await saveToLibrary(
        generatedFilename,
        componentName,
        description,
        category,
        tags
      )
      
      // Check if the name was modified due to duplicates
      const nameWasModified = savedComponent.name !== componentName
      
      return Response.json({
        success: true,
        component: savedComponent,
        nameModified: nameWasModified,
        originalName: componentName,
        finalName: savedComponent.name
      })
    
  } catch (error) {
    console.error('Error saving to library:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Failed to save to library' 
    }, { status: 500 })
  }
}

async function extractComponentMetadata(filename: string, componentName: string) {
  const fs = require('fs')
  const path = require('path')
  
  // Read the component file
  const filePath = path.join(process.cwd(), 'components', 'generated', filename)
  const code = fs.readFileSync(filePath, 'utf8')
  
  // Extract description from component name and code
  const description = `A ${componentName.toLowerCase().replace(/([A-Z])/g, ' $1').trim()} component`
  
  // Determine category based on component name and imports
  let category = 'general'
  if (code.includes('Button') || code.includes('Card') || code.includes('Input')) {
    category = 'ui'
  } else if (code.includes('Form') || code.includes('Input') || code.includes('Select')) {
    category = 'forms'
  } else if (code.includes('Table') || code.includes('List') || code.includes('Grid')) {
    category = 'data-display'
  } else if (code.includes('Chart') || code.includes('Graph')) {
    category = 'charts'
  } else if (code.includes('Modal') || code.includes('Dialog')) {
    category = 'feedback'
  } else if (code.includes('Nav') || code.includes('Menu')) {
    category = 'navigation'
  }
  
  // Extract tags from imports and component features
  const tags: string[] = []
  
  // Add tags based on imports
  if (code.includes('useState')) tags.push('state')
  if (code.includes('useEffect')) tags.push('effect')
  if (code.includes('Button')) tags.push('button')
  if (code.includes('Card')) tags.push('card')
  if (code.includes('Input')) tags.push('input')
  if (code.includes('Form')) tags.push('form')
  if (code.includes('Table')) tags.push('table')
  if (code.includes('Chart')) tags.push('chart')
  if (code.includes('Modal')) tags.push('modal')
  if (code.includes('Dialog')) tags.push('dialog')
  if (code.includes('Nav')) tags.push('navigation')
  if (code.includes('Menu')) tags.push('menu')
  
  // Add component type tag
  tags.push(componentName.toLowerCase())
  
  return { description, category, tags }
}

export async function GET() {
  try {
    const components = await getLibraryComponents()
    return Response.json({ components })
  } catch (error) {
    console.error('Error getting library components:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Failed to get library components' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const componentId = searchParams.get('id')
    
    if (!componentId) {
      return Response.json({ error: 'Component ID is required' }, { status: 400 })
    }
    
    await deleteFromLibrary(componentId)
    
    return Response.json({ success: true })
    
  } catch (error) {
    console.error('Error deleting from library:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Failed to delete from library' 
    }, { status: 500 })
  }
} 