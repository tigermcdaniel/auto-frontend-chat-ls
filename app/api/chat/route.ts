export const maxDuration = 30

export async function POST(req: Request) {
  try {
    console.log("=== API ROUTE STARTED ===")

    // Check for API key in environment variables
    const apiKey = process.env.API_KEY
    if (!apiKey) {
      console.error("API_KEY environment variable not found")
      return Response.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    console.log("API key found in environment variables")

    const body = await req.json()
    console.log("Request body received:", JSON.stringify(body, null, 2))

    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      console.error("Invalid messages format")
      return Response.json({ error: "Invalid messages format" }, { status: 400 })
    }

    console.log("Messages to process:", messages.length)
    console.log("Messages content:", JSON.stringify(messages, null, 2))

    // Try direct fetch to OpenAI API (like your working Python example)
    console.log("Making direct fetch to OpenAI API...")

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        stream: false, // Start with non-streaming for simplicity
      }),
    })

    console.log("OpenAI API response status:", openaiResponse.status)
    console.log("OpenAI API response headers:", Object.fromEntries(openaiResponse.headers.entries()))

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error("OpenAI API error response:", errorText)

      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { error: { message: errorText } }
      }

      return Response.json(
        {
          error: "OpenAI API Error",
          details: errorData.error?.message || errorText,
          status: openaiResponse.status,
        },
        { status: openaiResponse.status },
      )
    }

    const data = await openaiResponse.json()
    console.log("OpenAI API response data keys:", Object.keys(data))
    console.log("Choices length:", data.choices?.length)

    if (!data.choices || data.choices.length === 0) {
      console.error("No choices in OpenAI response")
      return Response.json({ error: "No response from OpenAI" }, { status: 500 })
    }

    const responseText = data.choices[0].message.content
    console.log("Response text length:", responseText?.length)
    console.log("Response preview:", responseText?.substring(0, 100) + "...")

    if (!responseText) {
      console.error("No content in OpenAI response")
      return Response.json({ error: "Empty response from OpenAI" }, { status: 500 })
    }

    console.log("=== API ROUTE SUCCESS ===")

    return Response.json({
      response: responseText,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("=== CRITICAL API ERROR ===")
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

    // Handle specific error types
    if (error instanceof TypeError) {
      console.error("TypeError - likely network or fetch issue")
    }
    if (error instanceof SyntaxError) {
      console.error("SyntaxError - likely JSON parsing issue")
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
