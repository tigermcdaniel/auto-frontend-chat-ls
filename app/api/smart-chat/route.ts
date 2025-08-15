import { saveComponentToFile } from '@/lib/component-saver'
import { validateAndFixComponent, createFallbackComponent } from '@/lib/component-validator'

export const maxDuration = 60

interface AnalysisResult {
  intent: string
  displayType: string
  dataStructure: any
  instructions: string
  response: string
}

export async function POST(req: Request) {
  try {
    console.log("=== SKINCARE EXPERT SMART CHAT API ROUTE STARTED ===")

    // Check for API keys
    const openaiKey = process.env.API_KEY
    const v0Key = process.env.V0_API_KEY
    
    if (!openaiKey) {
      return Response.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }
    
    if (!v0Key) {
      return Response.json({ error: "V0 API key not configured" }, { status: 500 })
    }

    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Invalid messages format" }, { status: 400 })
    }

    console.log("Messages to process:", messages.length)

    // Step 1: Use OpenAI to analyze the request and determine the best way to display the response
    console.log("Step 1: Analyzing skincare request with OpenAI...")
    
    const analysisPrompt = `You are a skincare expert AI assistant that analyzes user requests and provides expert skincare guidance. 

For each user request, analyze the intent and determine:
1. What type of skincare information is being requested (skin analysis, product recommendations, routine planning, ingredient analysis, etc.)
2. The best way to display this information (chart, table, list, card, form, dashboard, timeline, comparison, progress tracker, etc.)
3. The data structure needed for the response
4. Specific instructions for creating a skincare-focused UI component

Respond in this exact JSON format:
{
  "intent": "brief description of skincare-related request",
  "displayType": "chart|table|list|card|form|dashboard|timeline|comparison|progress|routine|ingredient-checker|product-comparison|skin-analysis|treatment-tracker",
  "dataStructure": {
    "type": "object|array|string|number|boolean",
    "properties": "describe the expected data structure for skincare information"
  },
  "instructions": "detailed instructions for creating a skincare-focused UI component",
  "response": "your expert skincare advice and recommendations"
}

User request: ${messages[messages.length - 1].content}`

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a certified skincare expert with deep knowledge of dermatology, ingredients, skin types, and product formulations. Provide accurate, safe, and personalized skincare advice. Always consider skin types, sensitivities, and individual needs. When recommending products or ingredients, explain the benefits and potential side effects. For any serious skin concerns, always recommend consulting with a dermatologist."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        stream: false,
      }),
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error("OpenAI API error:", errorText)
      return Response.json({ error: "OpenAI API Error" }, { status: openaiResponse.status })
    }

    const openaiData = await openaiResponse.json()
    const analysisText = openaiData.choices[0].message.content
    
    console.log("OpenAI skincare analysis response:", analysisText)

    // Parse the analysis result
    let analysis: AnalysisResult
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        let jsonString = jsonMatch[0]
        
        // Clean up the JSON string to handle common issues
        jsonString = jsonString
          // Remove single-line comments (// ...)
          .replace(/\/\/.*$/gm, '')
          // Remove multi-line comments (/* ... */)
          .replace(/\/\*[\s\S]*?\*\//g, '')
          // Remove trailing commas before closing braces/brackets
          .replace(/,(\s*[}\]])/g, '$1')
          // Clean up extra whitespace
          .replace(/\s+/g, ' ')
          .trim()
        
        console.log("Cleaned JSON string:", jsonString)
        analysis = JSON.parse(jsonString)
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError)
      // Fallback to a simple response
      analysis = {
        intent: "skincare_general_query",
        displayType: "text",
        dataStructure: { type: "string" },
        instructions: "Display as simple text response with skincare advice",
        response: analysisText
      }
    }

    console.log("Parsed skincare analysis:", analysis)

    // Step 2: Use V0 to generate a React component based on the analysis
    console.log("Step 2: Generating skincare UI component with V0...")
    console.log("V0 API Key (first 10 chars):", v0Key.substring(0, 10) + "...")
    
    const v0Prompt = `Create a React component for skincare expertise that displays the following information:

Intent: ${analysis.intent}
Display Type: ${analysis.displayType}
Data Structure: ${JSON.stringify(analysis.dataStructure)}
Instructions: ${analysis.instructions}
Response: ${analysis.response}

Create a modern, responsive React component using Tailwind CSS and shadcn/ui components. The component should:
- Be visually appealing with a skincare/beauty aesthetic (pink, purple, soft colors)
- Handle skincare data appropriately for the display type
- Include proper TypeScript types
- Use appropriate shadcn/ui components
- Be responsive and accessible
- Have proper JSX structure with all content wrapped in valid JSX elements
- Use proper data access patterns (e.g., data?.property instead of standalone {data.property})
- Include skincare-specific styling and icons where appropriate
- Be designed for skincare professionals and beauty enthusiasts

IMPORTANT: Return only valid React/TypeScript code. All JSX content must be properly wrapped in elements. Do not include any explanations, comments, or markdown.`

    console.log("Making V0 API request to: https://api.v0.dev/v1/chat/completions")
    
    // Try using the V0 API with a more standard approach
    const v0Response = await fetch("https://api.v0.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${v0Key}`,
      },
      body: JSON.stringify({
        model: "v0-1.0-md",
        messages: [
          {
            role: "system",
            content: "You are a React component generator specializing in skincare and beauty applications. Always return valid React/TypeScript code using Tailwind CSS and shadcn/ui components. Use skincare-appropriate colors (pink, purple, soft tones) and design elements. IMPORTANT: All JSX content must be properly wrapped in valid JSX elements. Never return standalone data access expressions like {data.property} - they must be wrapped in JSX elements. Return only the component code, no explanations or markdown."
          },
          {
            role: "user",
            content: v0Prompt
          }
        ],
        stream: false,
        max_tokens: 2000,
      }),
    })

    if (!v0Response.ok) {
      const errorText = await v0Response.text()
      console.error("V0 API error response:", errorText)
      console.error("V0 API status:", v0Response.status)
      // Fallback to just the OpenAI response
      return Response.json({
        response: analysis.response,
        component: null,
        analysis: analysis,
        timestamp: new Date().toISOString(),
        provider: "skincare-expert-fallback"
      })
    }

    let v0Data
    try {
      v0Data = await v0Response.json()
    } catch (parseError) {
      console.error("Failed to parse V0 response as JSON:", parseError)
      const responseText = await v0Response.text()
      console.error("V0 response text:", responseText)
      
      // Generate fallback component
      console.log("Generating skincare fallback component...")
      const fallbackComponent = createFallbackComponent(analysis)
      
      // Save the fallback component to file
      console.log("Saving fallback component to file...")
      try {
        const savedComponent = await saveComponentToFile(fallbackComponent, analysis)
        
        return Response.json({
          response: analysis.response,
          component: savedComponent.componentName,
          componentFile: savedComponent.filename,
          analysis: analysis,
          timestamp: new Date().toISOString(),
          provider: "skincare-expert-fallback"
        })
      } catch (saveError) {
        console.error("Failed to save fallback component:", saveError)
        
        return Response.json({
          response: analysis.response,
          component: fallbackComponent,
          componentFile: null,
          analysis: analysis,
          error: saveError instanceof Error ? saveError.message : 'Failed to save component',
          timestamp: new Date().toISOString(),
          provider: "skincare-expert-fallback"
        })
      }
    }

    if (!v0Data.choices || v0Data.choices.length === 0) {
      console.error("No choices in V0 response")
      
      // Generate fallback component
      console.log("Generating skincare fallback component...")
      const fallbackComponent = createFallbackComponent(analysis)
      
      // Save the fallback component to file
      console.log("Saving fallback component to file...")
      try {
        const savedComponent = await saveComponentToFile(fallbackComponent, analysis)
        
        return Response.json({
          response: analysis.response,
          component: fallbackComponent,
          componentFile: savedComponent.filename,
          analysis: analysis,
          timestamp: new Date().toISOString(),
          provider: "skincare-expert-fallback"
        })
      } catch (saveError) {
        console.error("Failed to save fallback component:", saveError)
        
        return Response.json({
          response: analysis.response,
          component: fallbackComponent,
          componentFile: null,
          analysis: analysis,
          error: saveError instanceof Error ? saveError.message : 'Failed to save component',
          timestamp: new Date().toISOString(),
          provider: "skincare-expert-fallback"
        })
      }
    }
    const componentCode = v0Data.choices[0].message.content

    console.log("V0 skincare component generated successfully")

    // Skip validation - use V0 component directly
    console.log("Using V0 component directly without validation...")
    const finalComponentCode = componentCode

    // Save the component to file
    console.log("Saving skincare component to file...")
    try {
      const savedComponent = await saveComponentToFile(finalComponentCode, analysis)
      
              return Response.json({
          response: analysis.response,
          component: savedComponent.componentName,
          componentFile: savedComponent.filename,
          analysis: analysis,
          timestamp: new Date().toISOString(),
          provider: "skincare-expert-smart-chat"
        })
      } catch (saveError) {
        console.error("Failed to save component:", saveError)
        
        return Response.json({
          response: analysis.response,
          component: finalComponentCode,
          componentFile: null,
          analysis: analysis,
          error: saveError instanceof Error ? saveError.message : 'Failed to save component',
          timestamp: new Date().toISOString(),
          provider: "skincare-expert-smart-chat-fallback"
        })
    }

  } catch (error) {
    console.error("=== SKINCARE EXPERT SMART CHAT API ERROR ===")
    console.error("Error:", error)

    return Response.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
} 