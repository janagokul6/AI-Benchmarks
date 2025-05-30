"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ThumbsUp, ThumbsDown, Copy, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AIModels } from "@/lib/models"

interface ResponseComparisonProps {
  view: "cards" | "tabs"
}

interface ModelResponse {
  modelId: string
  response: string
  latency: number
  error?: string
  loading: boolean
  source?: "api" | "mock"
}

export default function ResponseComparison({ view }: ResponseComparisonProps) {
  const [responses, setResponses] = useState<ModelResponse[]>([])
  const [activeTab, setActiveTab] = useState<string>("")
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const prompt = searchParams.get("prompt") || ""
  const modelIds = searchParams.get("models")?.split(",") || AIModels.slice(0, 4).map((m) => m.id)

  useEffect(() => {
    if (!prompt) return

    // Reset responses when prompt changes
    setResponses(
      modelIds.map((id) => ({
        modelId: id,
        response: "",
        latency: 0,
        loading: true,
        source: undefined,
      })),
    )

    // Set first model as active tab
    if (modelIds.length > 0 && view === "tabs") {
      setActiveTab(modelIds[0])
    }

    // Fetch responses from each model
    modelIds.forEach(async (modelId) => {
      const startTime = Date.now()

      try {
        const { response, source } = await fetchModelResponse(modelId, prompt)
        const latency = Date.now() - startTime

        setResponses((prev) =>
          prev.map((item) =>
            item.modelId === modelId
              ? {
                  ...item,
                  response,
                  latency,
                  loading: false,
                  source,
                }
              : item,
          ),
        )
      } catch (error) {
        setResponses((prev) =>
          prev.map((item) =>
            item.modelId === modelId
              ? {
                  ...item,
                  error: "Failed to get response",
                  loading: false,
                  latency: Date.now() - startTime,
                }
              : item,
          ),
        )
      }
    })
  }, [prompt, modelIds.join(",")])

  const fetchModelResponse = async (
    modelId: string,
    prompt: string,
  ): Promise<{ response: string; source?: "api" | "mock" }> => {
    // In a real app, this would call your API routes
    const response = await fetch(`/api/generate?model=${modelId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      response: data.response,
      source: data.source,
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The response has been copied to your clipboard.",
    })
  }

  const handleFeedback = (modelId: string, isPositive: boolean) => {
    // In a real app, this would send feedback to your backend
    toast({
      title: `Feedback recorded`,
      description: `${isPositive ? "Positive" : "Negative"} feedback for ${
        AIModels.find((m) => m.id === modelId)?.name || modelId
      }`,
    })
  }

  if (!prompt) {
    return (
      <div className="text-center p-10 border rounded-lg bg-muted/50">
        <p className="text-muted-foreground">Enter a prompt above to see AI model responses</p>
      </div>
    )
  }

  if (view === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {responses.map((item) => {
          const model = AIModels.find((m) => m.id === item.modelId)

          return (
            <Card key={item.modelId} className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {model?.name || item.modelId}
                      <Badge variant="outline" className="text-xs font-normal">
                        {model?.provider}
                      </Badge>
                    </CardTitle>
                  </div>
                  <div className="flex gap-1">
                    {item.source && (
                      <Badge variant={item.source === "api" ? "default" : "secondary"} className="text-xs">
                        {item.source === "api" ? "API" : "Mock"}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.loading ? "..." : `${item.latency}ms`}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                {item.loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : item.error ? (
                  <div className="text-destructive">{item.error}</div>
                ) : (
                  <div className="whitespace-pre-wrap">{item.response}</div>
                )}
              </CardContent>
              <CardFooter className="pt-2 flex justify-between border-t">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(item.modelId, true)}
                    disabled={item.loading}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(item.modelId, false)}
                    disabled={item.loading}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(item.response)}
                  disabled={item.loading || !!item.error}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    )
  }

  // Tabs view
  return (
    <Tabs value={activeTab || modelIds[0]} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4 flex flex-wrap h-auto">
        {responses.map((item) => {
          const model = AIModels.find((m) => m.id === item.modelId)
          return (
            <TabsTrigger
              key={item.modelId}
              value={item.modelId}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {model?.name || item.modelId}
            </TabsTrigger>
          )
        })}
      </TabsList>

      {responses.map((item) => {
        const model = AIModels.find((m) => m.id === item.modelId)

        return (
          <TabsContent key={item.modelId} value={item.modelId} className="mt-0">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {model?.name || item.modelId}
                      <Badge variant="outline" className="text-xs font-normal">
                        {model?.provider}
                      </Badge>
                    </CardTitle>
                  </div>
                  <div className="flex gap-1">
                    {item.source && (
                      <Badge variant={item.source === "api" ? "default" : "secondary"} className="text-xs">
                        {item.source === "api" ? "API" : "Mock"}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.loading ? "..." : `${item.latency}ms`}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {item.loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : item.error ? (
                  <div className="text-destructive">{item.error}</div>
                ) : (
                  <div className="whitespace-pre-wrap min-h-[200px]">{item.response}</div>
                )}
              </CardContent>
              <CardFooter className="pt-2 flex justify-between border-t">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(item.modelId, true)}
                    disabled={item.loading}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(item.modelId, false)}
                    disabled={item.loading}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(item.response)}
                  disabled={item.loading || !!item.error}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
