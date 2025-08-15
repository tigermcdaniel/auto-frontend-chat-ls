'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

// Simple toast implementation
const toast = ({ title, description, variant }: { title: string; description?: string; variant?: 'default' | 'destructive' }) => {
  console.log(`${variant === 'destructive' ? '❌' : '✅'} ${title}: ${description || ''}`)
}

interface SaveToLibraryDialogProps {
  generatedFilename: string
  componentName: string
  onSaved?: () => void
}

export function SaveToLibraryDialog({ 
  generatedFilename, 
  componentName, 
  onSaved 
}: SaveToLibraryDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/save-to-library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generatedFilename,
          componentName,
          autoExtract: true // Flag to auto-extract metadata
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (data.nameModified) {
          toast({
            title: "Component saved!",
            description: `${componentName} was renamed to ${data.finalName} due to duplicate name.`,
          })
        } else {
          toast({
            title: "Component saved!",
            description: `${componentName} has been saved to your component library.`,
          })
        }
        onSaved?.()
      } else {
        throw new Error(data.error || 'Failed to save component')
      }
    } catch (error) {
      toast({
        title: "Error saving component",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleSave}
      disabled={isLoading}
    >
      <Save className="w-4 h-4 mr-2" />
      {isLoading ? 'Saving...' : 'Save to Library'}
    </Button>
  )
} 