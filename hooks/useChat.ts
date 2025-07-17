"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"

interface UseChatOptions {
  api: string
  body?: any
  onError?: (error: any) => void
  onFinish?: (message: any) => void
}

const useChat = (options: UseChatOptions) => {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!input.trim()) return

      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: input,
      }

      setMessages((prevMessages) => [...prevMessages, userMessage])
      setInput("")
      setIsLoading(true)
      setError(null)

      abortControllerRef.current = new AbortController()

      try {
        const response = await fetch(options.api, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...options.body, messages: [...messages, userMessage] }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error("Response body is empty")
        }

        let partialResponse = ""
        let done = false

        while (!done) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          const chunkValue = new TextDecoder().decode(value)
          partialResponse += chunkValue

          setMessages((prevMessages) => {
            const existingAssistantMessage = prevMessages.find(
              (m) => m.role === "assistant" && m.id === "assistant-message",
            )

            if (existingAssistantMessage) {
              return prevMessages.map((m) => (m.id === "assistant-message" ? { ...m, content: partialResponse } : m))
            } else {
              return [
                ...prevMessages,
                {
                  id: "assistant-message",
                  role: "assistant",
                  content: partialResponse,
                },
              ]
            }
          })
        }

        if (options.onFinish) {
          options.onFinish({ role: "assistant", content: partialResponse })
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("Fetch aborted")
        } else {
          setError(err)
          if (options.onError) {
            options.onError(err)
          }
        }
      } finally {
        setIsLoading(false)
      }
    },
    [messages, input, options.api, options.body, options.onError, options.onFinish],
  )

  const reload = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
  }
}

export default useChat
