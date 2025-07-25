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

    // Make direct HTTP request to V0 API for component only
    const v0Response = await fetch("https://api.v0.dev/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${v0ApiKey}`,
      },
      body: JSON.stringify({
        model: "v0-1.0-md",
        messages: messages,
        stream: false,
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

    const componentCode = v0Data.choices[0].message.content
    console.log("Component code length:", componentCode?.length)
    console.log("Component code preview:", componentCode?.substring(0, 200) + "...")

    if (!componentCode) {
      console.error("No content in V0 response")
      return Response.json({ error: "Empty response from V0" }, { status: 500 })
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