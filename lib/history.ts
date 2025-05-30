// This is a client-side history manager
// In a production app, this would be backed by a database

export interface HistoryItem {
  id: string
  prompt: string
  timestamp: number
  modelIds: string[]
}

const HISTORY_KEY = "ai-comparison-history"
const MAX_HISTORY_ITEMS = 20

export function savePromptToHistory(prompt: string, modelIds: string[]): HistoryItem {
  const history = getHistory()

  // Create new history item
  const newItem: HistoryItem = {
    id: Date.now().toString(),
    prompt,
    timestamp: Date.now(),
    modelIds,
  }

  // Add to beginning of array
  history.unshift(newItem)

  // Limit history size
  if (history.length > MAX_HISTORY_ITEMS) {
    history.pop()
  }

  // Save to localStorage
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))

  return newItem
}

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return []

  const historyJson = localStorage.getItem(HISTORY_KEY)
  if (!historyJson) return []

  try {
    return JSON.parse(historyJson)
  } catch (e) {
    console.error("Failed to parse history", e)
    return []
  }
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY)
}

export function deleteHistoryItem(id: string): void {
  const history = getHistory()
  const newHistory = history.filter((item) => item.id !== id)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
}
