import fs from 'fs'
import path from 'path'
import { validateAndFixComponent, createFallbackComponent } from './component-validator'

interface SavedComponent {
  id: string
  filename: string
  componentName: string
  analysis: any
  timestamp: string
}

function extractComponentName(code: string): string | null {
  const match = code.match(/export\s+default\s+function\s+(\w+)/);
  return match ? match[1] : null;
}


export async function saveComponentToFile(
  componentCode: string, 
  analysis: any, 
  baseDir: string = process.cwd()
): Promise<SavedComponent> {
  try {
    // Create a unique ID for the component
    const componentId = `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create components directory if it doesn't exist
    const componentsDir = path.join(baseDir, 'components', 'generated')
    if (!fs.existsSync(componentsDir)) {
      fs.mkdirSync(componentsDir, { recursive: true })
    }
    
    // Generate filename based on intent
    const intent = analysis.intent || 'component'
    const sanitizedIntent = intent
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 30)
    
    const filename = `${sanitizedIntent}_${componentId}.tsx`
    const filePath = path.join(componentsDir, filename)
    
    // Skip validation - use component code directly
    console.log('Using component code directly without validation...')
    let cleanedCode = componentCode
    
    // Find the actual component code by looking for import statements or 'use client'
    const lines = cleanedCode.split('\n')
    let startIndex = 0
    
    // Find where the actual component code starts
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('import ') || line.startsWith("'use client'") || line.startsWith('"use client"')) {
        startIndex = i
        break
      }
    }
    
    // Extract from the start of imports to the end
    cleanedCode = lines.slice(startIndex).join('\n')

    console.log('Cleaned code:', cleanedCode)
    const componentName = extractComponentName(cleanedCode);
    console.log('Extracted component name:', componentName)
    
    if (!componentName) {
      throw new Error('No component name found in component code')
    }
    
    // Also remove 'use client' directive if it exists
    cleanedCode = cleanedCode
      .replace(/^'use client';?\s*/g, '')
      .replace(/^"use client";?\s*/g, '')
      .trim()
    
    // Write the component to file
    fs.writeFileSync(filePath, cleanedCode, 'utf8')
    
    console.log(`Component saved to: ${filePath}`)
    
    return {
      id: componentId,
      filename,
      componentName: componentName,
      analysis,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('Error saving component:', error)
    throw new Error(`Failed to save component: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function getComponentPath(filename: string, baseDir: string = process.cwd()): string {
  return path.join(baseDir, 'components', 'generated', filename)
}

export function componentExists(filename: string, baseDir: string = process.cwd()): boolean {
  const filePath = getComponentPath(filename, baseDir)
  return fs.existsSync(filePath)
} 