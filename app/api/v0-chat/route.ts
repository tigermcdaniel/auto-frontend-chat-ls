import { saveComponentToFile } from '@/lib/component-saver'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    console.log("=== V0 API ROUTE STARTED ===")

    // Check for API keys
    const v0ApiKey = process.env.V0_API_KEY
    const openaiApiKey = process.env.OPENAI_API_KEY
    
    if (!v0ApiKey) {
      console.error("V0_API_KEY environment variable not found")
      return Response.json({ error: "V0 API key not configured" }, { status: 500 })
    }
    
    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY environment variable not found")
      return Response.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    console.log("API keys found in environment variables")

    const body = await req.json()
    console.log("Request body received:", JSON.stringify(body, null, 2))

    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      console.error("Invalid messages format")
      return Response.json({ error: "Invalid messages format" }, { status: 400 })
    }

    console.log("Messages to process:", messages.length)
    console.log("Messages content:", JSON.stringify(messages, null, 2))

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1]?.content || ""
    
    console.log("Making request to V0 API for component...")

    // Create enhanced messages with documentation requirements
    const enhancedMessages = [
      {
        role: "system",
        content: `You are a React component generator that creates well-documented, production-ready components.

CRITICAL: Generate COMPLETE components - do not truncate or cut off the code. Ensure all components have proper closing tags, complete functions, and full implementations.

IMPORTANT: If the component is complex and might exceed token limits, prioritize completeness over documentation. Focus on the core functionality first, then add documentation if space allows.

IMPORTANT REQUIREMENTS:
1. Always include comprehensive JSDoc comments for the main component function
2. Define clear TypeScript interfaces for all props
3. Include detailed descriptions of what the component does
4. Document all prop types with examples
5. Add inline comments for complex logic
6. Use descriptive variable names
7. Include error handling where appropriate
8. TEST THE COMPONENT before returning it
9. ALWAYS include the complete export default statement
10. Ensure all JSX elements have proper closing tags

DOCUMENTATION FORMAT:
- Use JSDoc comments with @param, @returns, @example tags
- Define interfaces with detailed descriptions
- Include usage examples in comments
- Document any special behavior or edge cases`
      },
      ...messages
    ]

    // Make direct HTTP request to V0 API for component only
    const v0Response = await fetch("https://api.v0.dev/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${v0ApiKey}`,
      },
      body: JSON.stringify({
        model: "v0-1.0-lg", // Try the large model for bigger components
        messages: enhancedMessages,
        stream: false,
        max_tokens: 50000, // Very high limit to prevent truncation
      }),
    })

    console.log("V0 API response status:", v0Response.status)

    if (!v0Response.ok) {
      const errorText = await v0Response.text()
      console.error("V0 API error response:", errorText)

      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { error: { message: errorText } }
      }

      return Response.json(
        {
          error: "V0 API Error",
          details: errorData.error?.message || errorText,
          status: v0Response.status,
        },
        { status: v0Response.status },
      )
    }

    const v0Data = await v0Response.json()
    console.log("V0 API response data keys:", Object.keys(v0Data))
    console.log("Choices length:", v0Data.choices?.length)

    if (!v0Data.choices || v0Data.choices.length === 0) {
      console.error("No choices in V0 response")
      return Response.json({ error: "No response from V0" }, { status: 500 })
    }

    let componentCode = v0Data.choices[0].message.content
    console.log("Component code length:", componentCode?.length)
    console.log("Component code preview:", componentCode?.substring(0, 200) + "...")
    console.log("Component code end:", componentCode?.substring(componentCode.length - 200))
    
    // Check V0 API response details
    console.log("V0 API response details:")
    console.log("- Usage tokens:", v0Data.usage?.total_tokens)
    console.log("- Prompt tokens:", v0Data.usage?.prompt_tokens)
    console.log("- Completion tokens:", v0Data.usage?.completion_tokens)
    console.log("- Finish reason:", v0Data.choices?.[0]?.finish_reason)
    
    // Check if V0 stopped early
    if (v0Data.choices?.[0]?.finish_reason === 'length') {
      console.warn("⚠️ V0 stopped due to length limit - component may be truncated")
    }
    
    // Check if the response seems truncated
    if (componentCode && componentCode.length > 0) {
      const lines = componentCode.split('\n')
      const lastLine = lines[lines.length - 1] || ''
      const secondLastLine = lines[lines.length - 2] || ''
      
      // Check for various truncation indicators
      const isTruncated = 
        !lastLine.trim() || 
        lastLine.includes('...') || 
        lastLine.includes('truncated') ||
        lastLine.includes('// ...') ||
        secondLastLine.includes('// ...') ||
        componentCode.length < 500 || // Very short responses might be truncated
        !componentCode.includes('export default') || // Missing export suggests truncation
        lines.length < 200 || // Components should typically be longer than 200 lines
        (lines.length > 150 && !componentCode.includes('}')) // Long components without closing braces
      
      if (isTruncated) {
        console.warn("⚠️ Component response appears to be truncated!")
        console.warn("Component length:", componentCode.length, "lines:", lines.length)
        console.warn("Last few lines:", lines.slice(-3).join('\n'))
        
        // If truncated, log the issue but don't retry with simpler version
        console.warn("⚠️ Component appears to be truncated by V0 API")
        console.warn("This may be due to V0's internal limits")
        console.warn("Consider breaking down complex requests into smaller parts")
      } else {
        console.log("✅ Component appears complete (length:", componentCode.length, "lines:", lines.length, ")")
      }
    }

    if (!componentCode) {
      console.error("No content in V0 response")
      return Response.json({ error: "Empty response from V0" }, { status: 500 })
    }

    // Validate the generated component
    console.log("Validating generated component...")
    const validationResult = validateComponent(componentCode)
    
    if (!validationResult.isValid) {
      console.warn("Component validation issues found:", validationResult.issues)
      // Continue anyway but log the issues
    } else {
      console.log("✅ Component validation passed")
    }

    // Now make a ChatGPT call to generate sample data
    console.log("Making request to ChatGPT for sample data...")
    
    const chatGptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates realistic sample data for React components. Return ONLY valid JSON with no explanations or markdown."
          },
          {
            role: "user",
            content: `Based on this user request: "${lastUserMessage}"

Generate realistic sample data that would be appropriate for the component they want. Return ONLY a JSON object with the sample data.

For example:
- Weather component: {"location": "New York", "temperature": 72, "humidity": 65, "forecast": [...]}
- Todo list: {"todos": [{"id": 1, "text": "Buy groceries", "completed": false}, ...]}
- Dashboard: {"stats": {"users": 1234, "revenue": 56789}, "chartData": [...]}

Return ONLY the JSON object.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    })

    let sampleData = {}
    
    if (chatGptResponse.ok) {
      const chatGptData = await chatGptResponse.json()
      const sampleDataText = chatGptData.choices?.[0]?.message?.content
      
      if (sampleDataText) {
        try {
          sampleData = JSON.parse(sampleDataText)
          console.log("Successfully generated sample data:", sampleData)
        } catch (parseError) {
          console.error("Failed to parse ChatGPT sample data:", parseError)
          console.log("Raw sample data text:", sampleDataText)
        }
      }
    } else {
      console.error("ChatGPT API error:", await chatGptResponse.text())
    }

    // Save the component to file
    let savedComponent = null
    try {
      // Create analysis object with component code and sample data
      const analysis = {
        intent: 'v0-generated',
        displayType: 'custom',
        dataStructure: { type: 'object' },
        instructions: 'V0 generated component',
        response: 'Component generated by V0 API',
        sampleData: sampleData
      }
      
      savedComponent = await saveComponentToFile(componentCode, analysis)
    } catch (saveError) {
      console.error("Failed to save component:", saveError)
      return Response.json({
        response: componentCode,
        component: componentCode,
        componentFile: null,
        error: saveError instanceof Error ? saveError.message : 'Failed to save component',
        timestamp: new Date().toISOString(),
        provider: "v0"
      })
    }

    console.log("=== V0 API ROUTE SUCCESS ===")

    return Response.json({
      response: componentCode,
      component: componentCode,
      componentFile: savedComponent?.filename,
      componentName: savedComponent?.componentName,
      analysis: {
        ...savedComponent?.analysis,
        sampleData: sampleData
      },
      timestamp: new Date().toISOString(),
      provider: "v0"
    })
  } catch (error) {
    console.error("=== CRITICAL V0 API ERROR ===")
    console.error("Error type:", typeof error)
    console.error("Error constructor:", error?.constructor?.name)
    console.error("Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack")
    console.error("Error toString:", String(error))

    // Log the full error object
    if (error instanceof Error) {
      console.error("Full error object:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      })
    } else {
      console.error("Non-Error object:", error)
    }

    return Response.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.name : typeof error,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Component validation function
function validateComponent(componentCode: string) {
  const issues: string[] = []
  let isValid = true

  // Check for basic React component structure
  if (!componentCode.includes('export default function') && !componentCode.includes('export default const')) {
    issues.push('Missing default export function')
    isValid = false
  }

  // Check for TypeScript interfaces
  if (!componentCode.includes('interface') && !componentCode.includes('type')) {
    issues.push('Missing TypeScript interface definitions')
  }

  // Check for JSDoc comments
  if (!componentCode.includes('/**') || !componentCode.includes('@param')) {
    issues.push('Missing JSDoc documentation')
  }

  // Check for proper imports
  if (!componentCode.includes('import')) {
    issues.push('Missing import statements')
    isValid = false
  }

  // Check for return statement
  if (!componentCode.includes('return')) {
    issues.push('Missing return statement')
    isValid = false
  }

  // Check for JSX
  if (!componentCode.includes('<') || !componentCode.includes('>')) {
    issues.push('Missing JSX elements')
    isValid = false
  }

  // Check for error handling
  if (!componentCode.includes('try') && !componentCode.includes('catch') && !componentCode.includes('error')) {
    issues.push('No error handling detected')
  }

  // Check for accessibility
  if (!componentCode.includes('aria-') && !componentCode.includes('role=')) {
    issues.push('No accessibility attributes detected')
  }

  return {
    isValid,
    issues,
    score: Math.max(0, 10 - issues.length) // Score out of 10
  }
} 