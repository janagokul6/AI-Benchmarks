"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, Eraser } from "lucide-react"
import { savePromptToHistory } from "@/lib/history"

export default function PromptForm() {
  const [prompt, setPrompt] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Initialize prompt from URL if available
  useEffect(() => {
    const urlPrompt = searchParams.get("prompt")
    if (urlPrompt) {
      setPrompt(urlPrompt)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to continue.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Get selected models from URL or use default
      const modelParam = searchParams.get("models")
      const selectedModels = modelParam ? modelParam.split(",") : []

      // Save to history
      savePromptToHistory(prompt, selectedModels)

      // Use searchParams to pass the prompt to the page
      const params = new URLSearchParams(searchParams.toString())
      params.set("prompt", prompt)

      // Refresh the page with the new prompt
      router.push(`/?${params.toString()}`)
      router.refresh()
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Failed to process your prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClear = () => {
    setPrompt("")
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid gap-4">
        <Textarea
          placeholder="Enter your prompt here..."
          className="min-h-32 p-4 text-base"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isSubmitting}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClear} disabled={isSubmitting || !prompt.trim()}>
            <Eraser className="mr-2 h-4 w-4" />
            Clear
          </Button>
          <Button type="submit" disabled={isSubmitting || !prompt.trim()} className="px-6">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
