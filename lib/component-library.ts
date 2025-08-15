import fs from 'fs'
import path from 'path'

interface LibraryComponent {
  id: string
  name: string
  description: string
  category: string
  filename: string
  code: string
  createdAt: string
  tags: string[]
}

export async function saveToLibrary(
  generatedFilename: string,
  componentName: string,
  description: string = '',
  category: string = 'general',
  tags: string[] = []
): Promise<LibraryComponent> {
  try {
    // Read the component from generated folder
    const generatedPath = path.join(process.cwd(), 'components', 'generated', generatedFilename)
    
    if (!fs.existsSync(generatedPath)) {
      throw new Error('Generated component file not found')
    }
    
    const code = fs.readFileSync(generatedPath, 'utf8')
    
    // Create library directory if it doesn't exist
    const libraryDir = path.join(process.cwd(), 'components', 'library')
    if (!fs.existsSync(libraryDir)) {
      fs.mkdirSync(libraryDir, { recursive: true })
    }
    
    // Create category directory
    const categoryDir = path.join(libraryDir, category)
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true })
    }
    
    // Generate library filename with duplicate handling
    let libraryFilename = `${componentName}.tsx`
    let libraryPath = path.join(categoryDir, libraryFilename)
    let finalComponentName = componentName
    
    // Check if component already exists and add suffix if needed
    let counter = 1
    while (fs.existsSync(libraryPath)) {
      finalComponentName = `${componentName}_${counter}`
      libraryFilename = `${finalComponentName}.tsx`
      libraryPath = path.join(categoryDir, libraryFilename)
      counter++
    }
    
    // Write to library
    fs.writeFileSync(libraryPath, code, 'utf8')
    
    // Create library metadata
    const libraryComponent: LibraryComponent = {
      id: `lib_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: finalComponentName,
      description,
      category,
      filename: libraryFilename,
      code,
      createdAt: new Date().toISOString(),
      tags
    }
    
    // Save metadata to library index
    await saveLibraryMetadata(libraryComponent)
    
    console.log(`Component saved to library: ${libraryPath}`)
    
    return libraryComponent
    
  } catch (error) {
    console.error('Error saving to library:', error)
    throw new Error(`Failed to save to library: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getLibraryComponents(): Promise<LibraryComponent[]> {
  try {
    const metadataPath = path.join(process.cwd(), 'components', 'library', 'metadata.json')
    
    if (!fs.existsSync(metadataPath)) {
      return []
    }
    
    const metadata = fs.readFileSync(metadataPath, 'utf8')
    return JSON.parse(metadata)
  } catch (error) {
    console.error('Error reading library metadata:', error)
    return []
  }
}

async function saveLibraryMetadata(component: LibraryComponent): Promise<void> {
  try {
    const metadataPath = path.join(process.cwd(), 'components', 'library', 'metadata.json')
    
    let existingComponents: LibraryComponent[] = []
    if (fs.existsSync(metadataPath)) {
      const metadata = fs.readFileSync(metadataPath, 'utf8')
      existingComponents = JSON.parse(metadata)
    }
    
    // Add new component
    existingComponents.push(component)
    
    // Save updated metadata
    fs.writeFileSync(metadataPath, JSON.stringify(existingComponents, null, 2), 'utf8')
  } catch (error) {
    console.error('Error saving library metadata:', error)
    throw error
  }
}

export async function deleteFromLibrary(componentId: string): Promise<void> {
  try {
    const components = await getLibraryComponents()
    const component = components.find(c => c.id === componentId)
    
    if (!component) {
      throw new Error('Component not found in library')
    }
    
    // Delete file
    const filePath = path.join(process.cwd(), 'components', 'library', component.category, component.filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    
    // Update metadata
    const updatedComponents = components.filter(c => c.id !== componentId)
    const metadataPath = path.join(process.cwd(), 'components', 'library', 'metadata.json')
    fs.writeFileSync(metadataPath, JSON.stringify(updatedComponents, null, 2), 'utf8')
    
    console.log(`Component deleted from library: ${component.name}`)
  } catch (error) {
    console.error('Error deleting from library:', error)
    throw error
  }
} 