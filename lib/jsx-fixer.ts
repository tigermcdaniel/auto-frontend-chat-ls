export function fixCommonJSXErrors(code: string): string {
  let fixedCode = code
  
  // Fix standalone data access expressions by wrapping them in divs
  const lines = fixedCode.split('\n')
  const fixedLines = lines.map(line => {
    const trimmedLine = line.trim()
    
    // If line is just a standalone data access like {data.property}
    if (trimmedLine.match(/^\s*\{[^}]*\}\s*$/)) {
      const content = trimmedLine.slice(1, -1).trim()
      // Wrap in a div if it's a simple data access
      if (content.includes('.') && !content.includes('(')) {
        return `        <div>{${content}}</div>`
      }
    }
    
    // If line starts with { but doesn't have proper JSX structure
    if (trimmedLine.startsWith('{') && !trimmedLine.includes('<') && !trimmedLine.includes('>')) {
      const content = trimmedLine.slice(1, -1).trim()
      if (content.includes('.') && !content.includes('(')) {
        return `        <div>{${content}}</div>`
      }
    }
    
    return line
  })
  
  fixedCode = fixedLines.join('\n')
  
  // Ensure the return statement has proper JSX structure
  if (fixedCode.includes('return (') && !fixedCode.includes('<div>') && !fixedCode.includes('<Card>')) {
    // If return statement doesn't have proper JSX, wrap content in a div
    fixedCode = fixedCode.replace(
      /return\s*\(\s*([^)]*)\s*\)/g,
      (match, content) => {
        if (!content.includes('<')) {
          return `return (\n    <div className="p-4">\n      ${content.trim()}\n    </div>\n  )`
        }
        return match
      }
    )
  }
  
  return fixedCode
}

export function validateJSXStructure(code: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check for basic JSX structure
  if (!code.includes('return (') && !code.includes('return(')) {
    errors.push('Missing return statement')
  }
  
  // Check for proper JSX opening/closing
  const hasOpeningJSX = code.includes('<') && (code.includes('>') || code.includes('/>'))
  const hasClosingJSX = code.includes('</') || code.includes('/>')
  
  if (!hasOpeningJSX) {
    errors.push('Missing JSX opening tags')
  }
  
  // Check for standalone data access
  const lines = code.split('\n')
  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    if (trimmedLine.match(/^\s*\{[^}]*\}\s*$/) && !trimmedLine.includes('<')) {
      const content = trimmedLine.slice(1, -1).trim()
      if (content.includes('.') && !content.includes('(')) {
        errors.push(`Line ${index + 1}: Standalone data access "${trimmedLine}"`)
      }
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
} 