import { fixCommonJSXErrors, validateJSXStructure } from './jsx-fixer'

export interface ComponentValidationResult {
  isValid: boolean
  errors: string[]
  fixedCode?: string
  warnings: string[]
}

export interface ComponentFormat {
  hasValidImports: boolean
  hasValidExport: boolean
  hasValidJSX: boolean
  hasValidTypeScript: boolean
  hasNoUseClient: boolean
  hasProperStructure: boolean
}

export function validateComponentFormat(code: string): ComponentFormat {
  const lines = code.split('\n')
  
  return {
    hasValidImports: validateImports(lines),
    hasValidExport: validateExport(code),
    hasValidJSX: validateJSX(code),
    hasValidTypeScript: validateTypeScript(code),
    hasNoUseClient: !code.includes("'use client'") && !code.includes('"use client"'),
    hasProperStructure: validateStructure(code)
  }
}

function validateImports(lines: string[]): boolean {
  const importLines = lines.filter(line => line.trim().startsWith('import'))
  
  // Check for React import
  const hasReactImport = importLines.some(line => 
    line.includes('import React') || line.includes('import * as React')
  )
  
  // Check for valid import syntax
  const validImports = importLines.every(line => {
    const trimmed = line.trim()
    return trimmed.startsWith('import') && 
           (trimmed.includes('from') || trimmed.includes('{') || trimmed.includes('*'))
  })
  
  return hasReactImport && validImports
}

function validateExport(code: string): boolean {
  // Check for default export
  const hasDefaultExport = code.includes('export default') || 
                          code.includes('export default function') ||
                          code.includes('export default const')
  
  // Check for named export (alternative)
  const hasNamedExport = code.includes('export function') || 
                        code.includes('export const')
  
  return hasDefaultExport || hasNamedExport
}

function validateJSX(code: string): boolean {
  // Check for JSX return statement
  const hasJSXReturn = code.includes('return (') || code.includes('return(')
  
  // Check for JSX elements
  const hasJSXElements = code.includes('<') && code.includes('>')
  
  // Check for proper JSX closing
  const hasJSXClosing = code.includes('</') || code.includes('/>')
  
  // Check for meaningful content (not just empty divs or comments)
  const hasMeaningfulContent = !code.includes('{/*') || 
                              (code.includes('<div') || code.includes('<Card') || code.includes('<span') || code.includes('<p') || code.includes('<h'))
  
  return hasJSXReturn && hasJSXElements && hasJSXClosing && hasMeaningfulContent
}

function validateTypeScript(code: string): boolean {
  // Check for TypeScript syntax
  const hasTypeScript = code.includes(':') && 
                       (code.includes('interface') || code.includes('type') || code.includes('Props'))
  
  // Check for proper function/component declaration
  const hasFunctionDeclaration = code.includes('function') || code.includes('const') || code.includes('=>')
  
  return hasTypeScript || hasFunctionDeclaration
}

function validateStructure(code: string): boolean {
  // Check for proper component structure
  const hasComponentFunction = code.includes('function') || code.includes('const')
  const hasReturnStatement = code.includes('return')
  const hasJSXContent = code.includes('<') && code.includes('>')
  
  return hasComponentFunction && hasReturnStatement && hasJSXContent
}

export function fixComponentFormat(code: string): string {
  let fixedCode = code
  
  // Remove 'use client' directive
  fixedCode = fixedCode
    .replace(/^'use client';?\s*/g, '')
    .replace(/^"use client";?\s*/g, '')
    .trim()
  
  // Remove markdown and code blocks
  fixedCode = fixedCode
    .replace(/```jsx?/g, '')
    .replace(/```tsx?/g, '')
    .replace(/```/g, '')
    .trim()
  
  // Remove thinking/planning content
  fixedCode = fixedCode
    .replace(/<Thinking>[\s\S]*?<\/Thinking>/g, '')
    .replace(/<Thinking>[\s\S]*?(?=import|export|interface|const|function)/g, '')
    .trim()
  
  // Ensure React import
  if (!fixedCode.includes('import React') && !fixedCode.includes('import * as React')) {
    fixedCode = `import React from 'react'\n\n${fixedCode}`
  }
  
  // Ensure default export
  if (!fixedCode.includes('export default')) {
    // Try to convert named export to default export
    fixedCode = fixedCode.replace(
      /export (function|const) (\w+)/g,
      'export default $1 $2'
    )
  }
  
  // Fix common JSX errors
  fixedCode = fixCommonJSXErrors(fixedCode)
  
  // Ensure proper component structure
  if (!fixedCode.includes('return (') && !fixedCode.includes('return(')) {
    // Try to add return statement if missing
    const functionMatch = fixedCode.match(/(function \w+|const \w+\s*=\s*\([^)]*\)\s*=>)/)
    if (functionMatch) {
      const functionStart = fixedCode.indexOf(functionMatch[0])
      const functionEnd = fixedCode.indexOf('{', functionStart)
      if (functionEnd !== -1) {
        const beforeFunction = fixedCode.substring(0, functionEnd + 1)
        const afterFunction = fixedCode.substring(functionEnd + 1)
        fixedCode = `${beforeFunction}\n  return (\n    <div>\n      {/* Component content */}\n    </div>\n  )\n}${afterFunction}`
      }
    }
  }
  
  return fixedCode.trim()
}

export function validateAndFixComponent(code: string): ComponentValidationResult {
  const originalCode = code
  let currentCode = code
  let attempts = 0
  const maxAttempts = 3
  const errors: string[] = []
  const warnings: string[] = []
  
  while (attempts < maxAttempts) {
    attempts++
    console.log(`Component validation attempt ${attempts}/${maxAttempts}`)
    
    // Validate current code
    const format = validateComponentFormat(currentCode)
    const jsxValidation = validateJSXStructure(currentCode)
    
    // Collect errors
    const currentErrors: string[] = []
    
    if (!format.hasValidImports) {
      currentErrors.push('Missing or invalid React imports')
    }
    
    if (!format.hasValidExport) {
      currentErrors.push('Missing or invalid export statement')
    }
    
    if (!format.hasValidJSX) {
      currentErrors.push('Invalid JSX structure')
    }
    
    if (!format.hasNoUseClient) {
      currentErrors.push('Contains use client directive')
    }
    
    if (!format.hasProperStructure) {
      currentErrors.push('Invalid component structure')
    }
    
    if (!jsxValidation.isValid) {
      currentErrors.push(...jsxValidation.errors)
    }
    
    // If no errors, we're done
    if (currentErrors.length === 0) {
      console.log('Component validation successful')
      return {
        isValid: true,
        errors: [],
        fixedCode: currentCode,
        warnings
      }
    }
    
    // If this is the last attempt, return with errors
    if (attempts === maxAttempts) {
      errors.push(...currentErrors)
      break
    }
    
    // Try to fix the code
    console.log('Attempting to fix component format...')
    const fixedCode = fixComponentFormat(currentCode)
    
    // If the code didn't change, we can't fix it
    if (fixedCode === currentCode) {
      errors.push(...currentErrors)
      warnings.push('Unable to fix component format automatically')
      break
    }
    
    currentCode = fixedCode
  }
  
  console.log('Component validation failed after all attempts')
  return {
    isValid: false,
    errors,
    fixedCode: currentCode,
    warnings
  }
}

export function createFallbackComponent(analysis: any): string {
  const componentName = analysis.intent 
    ? analysis.intent.replace(/[^a-zA-Z0-9]/g, '').replace(/^[0-9]/, '') || 'Component'
    : 'Component'
  
  // Create a more functional component based on the display type
  let componentContent = ''
  
  switch (analysis.displayType) {
    case 'chart':
      componentContent = `
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">${analysis.intent || 'Chart'}</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-600">Chart visualization would go here</p>
              {data && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-700">Data: {JSON.stringify(data).substring(0, 100)}...</p>
                </div>
              )}
            </div>
          </div>
        </div>`
      break
      
    case 'table':
      componentContent = `
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">${analysis.intent || 'Table'}</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Key</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Value</th>
                </tr>
              </thead>
              <tbody>
                {data ? Object.entries(data).map(([key, value]) => (
                  <tr key={key}>
                    <td className="border border-gray-200 px-4 py-2 font-medium">{key}</td>
                    <td className="border border-gray-200 px-4 py-2">{String(value)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={2} className="border border-gray-200 px-4 py-2 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>`
      break
      
    case 'card':
      componentContent = `
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">${analysis.intent || 'Card'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data ? Object.entries(data).map(([key, value]) => (
              <div key={key} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">{key}</h4>
                <p className="text-gray-900">{String(value)}</p>
              </div>
            )) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                No data available
              </div>
            )}
          </div>
        </div>`
      break
      
    default:
      componentContent = `
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">${analysis.intent || 'Component'}</h3>
          <p className="text-gray-600 mb-4">${analysis.response || 'Component content'}</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            {data ? (
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
        </div>`
  }
  
  return `import React from 'react'

interface ${componentName}Props {
  data?: any
}

export default function ${componentName}({ data }: ${componentName}Props) {
  return (
    ${componentContent}
  )
}`
} 