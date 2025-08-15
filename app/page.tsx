"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Send, Plus, MessageSquare, User, Bot, Menu, Settings, Trash2, AlertCircle, RefreshCw, Zap, Sparkles } from "lucide-react"
import { DynamicComponentLoader, ComponentFallback } from "@/lib/dynamic-component-loader"
import { SimpleComponentLoader } from "@/lib/simple-component-loader"
import { LiveComponentRenderer } from "@/lib/live-component-renderer"
import { V0ComponentRenderer } from "@/lib/v0-component-renderer"
import { DirectComponentRenderer } from "@/lib/direct-component-renderer"
import { RealComponentRenderer } from "@/lib/real-component-renderer"
import { V0ComponentExecutor } from "@/lib/v0-component-executor"
import { EnhancedV0Renderer } from "@/lib/enhanced-v0-renderer"
import { IframeComponentRenderer } from "@/lib/iframe-component-renderer"
import { DynamicRenderer } from "@/lib/dynamic-renderer"
import { LazyDynamicRenderer } from "@/lib/lazy-loader"
import { SaveToLibraryDialog } from "@/components/save-to-library-dialog"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  component?: string
  analysis?: any
  componentFile?: string // Added for DynamicComponentLoader
  componentName?: string // Added for component name
  error?: string // Added for error handling
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

export default function SkincareExpertChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState<"openai" | "v0" | "smart">("smart")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Debug component rendering
  useEffect(() => {
    messages.forEach(message => {
      if (message.componentFile) {
        console.log('Message has componentFile:', message.componentFile, 'analysis:', message.analysis)
      }
      if (message.component) {
        console.log('Message has component:', message.component.substring(0, 100))
      }
      if (message.componentName) {
        console.log('Message has component:', message.componentName)
      }
    })
  }, [messages])

  // Auto-generate conversation title from first message
  useEffect(() => {
    if (messages.length === 2 && currentConversationId) {
      const firstUserMessage = messages.find((m) => m.role === "user")?.content || "New Skincare Chat"
      const title = firstUserMessage.length > 30 ? firstUserMessage.substring(0, 30) + "..." : firstUserMessage

      setConversations((prev) =>
        prev.map((conv) => (conv.id === currentConversationId ? { ...conv, title, messages } : conv)),
      )
    }
  }, [messages, currentConversationId])

  const startNewConversation = () => {
    const newId = Date.now().toString()
    const newConversation: Conversation = {
      id: newId,
      title: "New Skincare Chat",
      messages: [],
      createdAt: new Date(),
    }
    setConversations((prev) => [newConversation, ...prev])
    setCurrentConversationId(newId)
    setMessages([])
    setError(null)
  }

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id))
    if (currentConversationId === id) {
      setCurrentConversationId(null)
      setMessages([])
    }
  }

  const loadConversation = (conversation: Conversation) => {
    setCurrentConversationId(conversation.id)
    setMessages(conversation.messages)
    setError(null)
  }

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return

    console.log("=== SENDING MESSAGE ===")
    console.log("Message:", messageContent)

    setError(null)
    setIsLoading(true)

    // If no current conversation, start a new one
    if (!currentConversationId) {
      startNewConversation()
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")

    // Prepare messages for API
    const apiMessages = newMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    console.log("API Messages:", apiMessages)

    try {
      const endpoint = selectedProvider === "openai" ? "/api/chat" : 
                      selectedProvider === "v0" ? "/api/v0-chat" : "/api/smart-chat"
      console.log("Making fetch request to:", endpoint)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
        }),
      })

      console.log("Response received:")
      console.log("- Status:", response.status)
      console.log("- Status Text:", response.statusText)
      console.log("- Headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        console.error("Response not OK!")

        let errorText
        try {
          errorText = await response.text()
          console.log("Error response body:", errorText)
        } catch (e) {
          console.error("Could not read error response body")
          errorText = `HTTP ${response.status}: ${response.statusText}`
        }

        let errorData
        try {
          errorData = JSON.parse(errorText)
          console.log("Parsed error data:", errorData)
        } catch (e) {
          console.log("Error response is not JSON")
          errorData = { error: errorText }
        }

        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      console.log("Parsing successful response...")
      const data = await response.json()
      console.log("Response data keys:", Object.keys(data))
      console.log("Response preview:", data.response?.substring(0, 100) + "...")
      console.log("Component file:", data.componentFile)
      console.log("Component:", data.component)
      console.log("Analysis:", data.analysis)

      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.response) {
        throw new Error("No response content received from API")
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        component: data.component,
        analysis: data.analysis,
        componentFile: data.componentFile,
        componentName: data.componentName,
        error: data.error,
      }

      const finalMessages = [...newMessages, assistantMessage]
      setMessages(finalMessages)

      // Update conversation
      if (currentConversationId) {
        console.log('updating conversation', finalMessages)
        setConversations((prev) =>
          prev.map((conv) => (conv.id === currentConversationId ? { ...conv, messages: finalMessages } : conv)),
        )
      }

      console.log("=== MESSAGE SENT SUCCESSFULLY ===")
    } catch (err: any) {
      console.error("=== FRONTEND ERROR ===")
      console.error("Error type:", typeof err)
      console.error("Error message:", err.message)
      console.error("Full error:", err)

      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage(input)
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt)
  }

  const retry = () => {
    if (messages.length > 0) {
      const lastUserMessage = messages.filter((m) => m.role === "user").pop()
      if (lastUserMessage) {
        const userMessages = messages.filter((m) => m.role === "user")
        setMessages(userMessages)
        sendMessage(lastUserMessage.content)
      }
    }
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 bg-gray-50 border-r border-gray-200 text-gray-800 overflow-hidden`}
      >
        <div className="p-4">
          <Button
            onClick={startNewConversation}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 border border-yellow-300 font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Skincare Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2">
          {conversations.map((conversation) => (
            <div key={conversation.id} className="group relative">
              <Button
                variant="ghost"
                                  className={`w-full justify-start text-left p-3 mb-1 hover:bg-lavender-100 ${
                    currentConversationId === conversation.id ? "bg-lavender-200 text-follain-green-800" : "text-gray-700"
                  }`}
                onClick={() => loadConversation(conversation)}
              >
                <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{conversation.title}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 text-gray-500"
                onClick={() => deleteConversation(conversation.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </ScrollArea>

        <div className="p-4 border-t border-gray-200">
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:bg-gray-100">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-4 text-gray-600">
            <Menu className="w-5 h-5" />
          </Button>
                      <div className="flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-follain-green-700" />
              <h1 className="text-lg font-semibold text-follain-green-800">
                Skincare Expert AI
              </h1>
            </div>
          <div className="ml-auto flex items-center space-x-3">
            {/* Provider Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Provider:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={selectedProvider === "openai" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedProvider("openai")}
                  className={`text-xs ${selectedProvider === "openai" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                >
                  OpenAI
                </Button>
                <Button
                  variant={selectedProvider === "v0" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedProvider("v0")}
                  className={`text-xs ${selectedProvider === "v0" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                >
                  V0
                </Button>
                <Button
                  variant={selectedProvider === "smart" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedProvider("smart")}
                  className={`text-xs ${selectedProvider === "smart" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                >
                  Smart
                </Button>
              </div>
            </div>
            <Badge variant="default" className="text-xs bg-yellow-400 text-gray-800">
              <Zap className="w-3 h-3 mr-1" />
              {selectedProvider === "openai" ? "OpenAI GPT-4o Mini" : 
               selectedProvider === "v0" ? "V0 AI" : "Smart AI"}
            </Badge>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <div className="w-2 h-2 bg-follain-green-600 rounded-full animate-pulse"></div>
              <span>Ready</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Error: {error}</span>
                <Button variant="outline" size="sm" onClick={retry}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-lavender-200 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-follain-green-700" />
                </div>
                <h2 className="text-2xl font-semibold text-follain-green-800 mb-2">Your Personal Skincare Expert</h2>
                <p className="text-gray-600 mb-6">Build your routine with our elevated essentials and expert guidance.</p>
                <div className="mt-6 grid grid-cols-1 gap-3 max-w-md mx-auto">
                  <Button
                    variant="outline"
                    className="text-left justify-start bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                    onClick={() => handleSuggestedPrompt("Analyze my skin type and recommend a daily skincare routine")}
                  >
                    "Analyze my skin type and recommend a daily skincare routine"
                  </Button>
                  <Button
                    variant="outline"
                    className="text-left justify-start bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                    onClick={() => handleSuggestedPrompt("Create a skincare ingredient compatibility checker")}
                  >
                    "Create a skincare ingredient compatibility checker"
                  </Button>
                  <Button
                    variant="outline"
                    className="text-left justify-start bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                    onClick={() => handleSuggestedPrompt("Show me a skincare progress tracker for my acne treatment")}
                  >
                    "Show me a skincare progress tracker for my acne treatment"
                  </Button>
                  <Button
                    variant="outline"
                    className="text-left justify-start bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                    onClick={() => handleSuggestedPrompt("Build a skincare product comparison dashboard")}
                  >
                    "Build a skincare product comparison dashboard"
                  </Button>
                </div>
                <div className="mt-6 text-xs text-gray-400">
                  <p>✨ Powered by {selectedProvider === "openai" ? "OpenAI's GPT-4o Mini" : 
                    selectedProvider === "v0" ? "V0 AI" : "Smart AI (OpenAI + V0)"} for expert skincare guidance</p>
                </div>

              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-4">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={message.role === "user" ? "bg-follain-green-700 text-white" : "bg-lavender-200 text-follain-green-700"}>
                      {message.role === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-follain-green-800 mb-1">
                      {message.role === "user" ? "You" : "Skincare Expert"}
                    </div>
                        <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap text-gray-700">{message.content}</p>
                        
                        {message.componentFile && (
                          <div className="mt-4">
                            <LazyDynamicRenderer filename={message.componentFile} />
                            <div className="mt-4 flex justify-end">
                              <SaveToLibraryDialog 
                                generatedFilename={message.componentFile}
                                componentName={message.componentName || 'Component'}
                                onSaved={() => {
                                  console.log('Component saved to library')
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-start space-x-4">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-lavender-200 text-follain-green-700">
                      <Sparkles className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-follain-green-800 mb-1">Skincare Expert</div>
                    <div className="flex space-x-1">
                                              <div className="w-2 h-2 bg-follain-green-600 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-lavender-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-follain-green-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="flex space-x-4">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your skincare expert..."
                  className="pr-12 py-3 text-base border-gray-300 focus:border-follain-green-600 focus:ring-follain-green-600 bg-white"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-yellow-400 hover:bg-yellow-500 text-gray-800"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              💡 Ask about skin types, ingredients, routines, or product recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
