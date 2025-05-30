import { Suspense } from "react"
import PromptForm from "@/components/prompt-form"
import ModelSelector from "@/components/model-selector"
import ResponseComparison from "@/components/response-comparison"
import HistoryDrawer from "@/components/history-drawer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AIModels } from "@/lib/models"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-10 max-w-7xl">
      <div className="flex flex-col items-center justify-center mb-10 text-center">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-4xl font-bold tracking-tight">Multi-AI Comparison Tool</h1>
          <HistoryDrawer />
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Enter a prompt and compare responses from multiple AI models side-by-side. See how different models interpret
          and respond to the same input.
        </p>
      </div>

      <div className="grid gap-8">
        <div className="grid gap-4">
          <PromptForm />
          <ModelSelector models={AIModels} />
        </div>

        <Tabs defaultValue="cards" className="w-full">
          <div className="flex justify-end mb-4"> 
            
            <TabsList>
              <TabsTrigger value="cards">Cards view</TabsTrigger>
              <TabsTrigger value="tabs">Tabs view</TabsTrigger>
            </TabsList>
          </div>

          <Suspense fallback={<ResponseSkeleton />}>
            <TabsContent value="cards" className="mt-0">
              <ResponseComparison view="cards" />
            </TabsContent>
            <TabsContent value="tabs" className="mt-0">
              <ResponseComparison view="tabs" />
            </TabsContent>
          </Suspense>
        </Tabs>
      </div>
    </main>
  )
}

function ResponseSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="border rounded-lg p-4">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  )
}
