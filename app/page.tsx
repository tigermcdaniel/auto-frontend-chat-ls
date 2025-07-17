"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Send, Plus, MessageSquare, User, Bot, Menu, Settings, Trash2, AlertCircle, RefreshCw, Zap } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

export default function ChatGPTClone() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-generate conversation title from first message
  useEffect(() => {
    if (messages.length === 2 && currentConversationId) {
      const firstUserMessage = messages.find((m) => m.role === "user")?.content || "New Chat"
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
      title: "New Chat",
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
      console.log("Making fetch request...")

      const response = await fetch("/api/chat", {
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
      }

      const finalMessages = [...newMessages, assistantMessage]
      setMessages(finalMessages)

      // Update conversation
      if (currentConversationId) {
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 bg-gray-900 text-white overflow-hidden`}
      >
        <div className="p-4">
          <Button
            onClick={startNewConversation}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2">
          {conversations.map((conversation) => (
            <div key={conversation.id} className="group relative">
              <Button
                variant="ghost"
                className={`w-full justify-start text-left p-3 mb-1 hover:bg-gray-800 ${
                  currentConversationId === conversation.id ? "bg-gray-800" : ""
                }`}
                onClick={() => loadConversation(conversation)}
              >
                <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{conversation.title}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 hover:bg-gray-700"
                onClick={() => deleteConversation(conversation.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </ScrollArea>

        <div className="p-4 border-t border-gray-700">
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-800">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-4">
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">ChatGPT Clone</h1>
          <div className="ml-auto flex items-center space-x-3">
            <Badge variant="default" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              OpenAI GPT-4o Mini
            </Badge>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">How can I help you today?</h2>
                <p className="text-gray-500">Connected to OpenAI's GPT-4o Mini API for real AI responses.</p>
                <div className="mt-6 grid grid-cols-1 gap-2 max-w-md mx-auto">
                  <Button
                    variant="outline"
                    className="text-left justify-start bg-transparent"
                    onClick={() => handleSuggestedPrompt("Hello! How are you?")}
                  >
                    "Hello! How are you?"
                  </Button>
                  <Button
                    variant="outline"
                    className="text-left justify-start bg-transparent"
                    onClick={() => handleSuggestedPrompt("What is 2+2?")}
                  >
                    "What is 2+2?"
                  </Button>
                  <Button
                    variant="outline"
                    className="text-left justify-start bg-transparent"
                    onClick={() => handleSuggestedPrompt("Tell me a joke")}
                  >
                    "Tell me a joke"
                  </Button>
                  <Button
                    variant="outline"
                    className="text-left justify-start bg-transparent"
                    onClick={() => handleSuggestedPrompt("Explain AI in simple terms")}
                  >
                    "Explain AI in simple terms"
                  </Button>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  <p>🚀 Powered by OpenAI's GPT-4o Mini API</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-4">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={message.role === "user" ? "bg-blue-500" : "bg-green-500"}>
                      {message.role === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-700 mb-1">
                      {message.role === "user" ? "You" : "ChatGPT"}
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-start space-x-4">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-green-500">
                      <Bot className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-700 mb-1">ChatGPT</div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
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
                  placeholder="Message ChatGPT..."
                  className="pr-12 py-3 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              ChatGPT can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
