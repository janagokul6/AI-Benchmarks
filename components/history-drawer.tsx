"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Trash2, Clock, X } from "lucide-react"
import { getHistory, deleteHistoryItem, clearHistory, type HistoryItem } from "@/lib/history"
import { Badge } from "@/components/ui/badge"
import { AIModels } from "@/lib/models"
import { formatDistanceToNow } from "date-fns"

export default function HistoryDrawer() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setHistory(getHistory())
    }
  }, [open])

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteHistoryItem(id)
    setHistory(getHistory())
  }

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      clearHistory()
      setHistory([])
    }
  }

  const handleSelectPrompt = (item: HistoryItem) => {
    const params = new URLSearchParams()
    params.set("prompt", item.prompt)
    params.set("models", item.modelIds.join(","))
    router.push(`/?${params.toString()}`)
    setOpen(false)
  }

  const getModelName = (modelId: string) => {
    const model = AIModels.find((m) => m.id === modelId)
    return model?.name || modelId
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <History className="h-5 w-5" />
          {history.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {history.length>10? "10+": history.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Prompt History</SheetTitle>
          <Button variant="ghost" size="sm" onClick={handleClearHistory} disabled={history.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </SheetHeader>

        <div className="mt-6">
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No history yet</p>
              <p className="text-sm mt-2">Your prompt history will appear here</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-3 hover:bg-accent cursor-pointer group"
                    onClick={() => handleSelectPrompt(item)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteItem(item.id, e)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm line-clamp-2 mb-2">{item.prompt}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.modelIds.map((modelId) => (
                        <Badge key={modelId} variant="outline" className="text-xs">
                          {getModelName(modelId)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
