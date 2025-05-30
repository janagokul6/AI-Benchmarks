import { type NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai"
import { anthropic } from "@ai-sdk/anthropic"
import { google } from "@ai-sdk/google"
import { deepseek } from '@ai-sdk/deepseek';
// import { llama } from '@ai-sdk/llama';
import { perplexity } from '@ai-sdk/perplexity';
import { mistral } from '@ai-sdk/mistral';
import { AIModels } from "@/lib/models";

// Mock responses for development - in production, you would use real API calls
const mockResponses: Record<string, string> = {
  gpt: "As an advanced language model, I analyze this prompt from multiple perspectives. First, I consider the factual aspects, then the conceptual implications, and finally the practical applications. My response is structured to provide a comprehensive understanding while maintaining clarity and precision.",
  // "gpt-4-turbo":
  //   "I'll address this question by breaking it down into key components. The core concepts here involve [analysis of key elements]. Based on current understanding, there are several approaches to consider. Let me walk you through the most relevant ones with their respective advantages and limitations.",
  claude:
    "I'd like to explore this topic thoroughly. There are several dimensions to consider:\n\n1. Historical context\n2. Current understanding\n3. Future implications\n\nLet me address each of these in turn, while being mindful of nuance and avoiding oversimplification.",
  // "claude-3-sonnet":
  //   "Thank you for this interesting prompt. I'll provide a balanced perspective that considers multiple viewpoints. My goal is to be helpful while remaining accurate and thoughtful in my analysis.",
  // "claude-3-haiku":
  //   "Here's a concise response to your question. I've focused on the most important aspects while ensuring accuracy and clarity.",
  gemini:
    "This is a fascinating question! Let me think about this systematically:\n\n- First, let's establish what we know\n- Then, I'll explore some possibilities\n- Finally, I'll suggest some practical applications\n\nMy analysis is based on current understanding, though this is an evolving field.",
  "gemini-ultra":
    "I appreciate this thought-provoking question. Let me provide a comprehensive response that balances depth with accessibility. I'll incorporate relevant examples and analogies to illustrate complex concepts.",
  "deepseek-coder":
    "From a technical perspective, this question involves several interconnected systems. Let me break down the architecture and explain how each component functions, with particular attention to efficiency and scalability considerations.",
  "llama-3-70b":
    "I'll approach this question by considering multiple perspectives. There are valid arguments on different sides of this issue, and I'll try to represent them fairly while providing useful context and information.",
  "mistral-large":
    "Let me address this question directly. Based on current understanding, the key factors to consider are [relevant factors]. I'll explain each one and how they interact, focusing on practical implications.",
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, modelIds } = await request.json();

    if (!modelIds || modelIds.length === 0) {
      return NextResponse.json({ error: "Model ID is required" }, { status: 400 });
    }

    const models = AIModels.filter(model => modelIds.includes(model.id));

    if (models.length === 0) {
      return NextResponse.json({ error: "Invalid model ID" }, { status: 400 });
    }

    const providerMap: Record<string, any> = {
      OpenAI: openai,
      Anthropic: anthropic,
      Google: google,
      xAI: xai,
      DeepSeek: deepseek,
      Perplexity: perplexity,
      Mistral: mistral,
    };

    const response: Record<string, any> = {};
    let erroredModel = 0;

    const tasks = models.map(async (model) => {
      if (!model.apiEnvVar) return;

      const providerFn = providerMap[model.provider];
      if (!providerFn) return;

      try {
        const result = await generateText({
          model: providerFn(model.id as any),
          prompt,
          maxTokens: 1000,
        });

        response[model.id] = {
          id: model.id,
          prompt,
          res: result.text,
        };

        saveToHistory(prompt, model.id, result.text);
      } catch (error) {
        console.error(`Error for model ${model.id}:`, error);
        erroredModel++;

        response[model.id] = {
          id: model.id,
          prompt,
          res: mockResponses[model.id] || "No response available",
        };
      }
    });

    // Wait for all model calls to complete (in parallel)
    await Promise.all(tasks);

    return NextResponse.json({
      response,
      erroredModel,
      models,
      prompt,
    });
  } catch (error: any) {
    console.error("API route error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate response",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

// In a real app, this would save to a database
function saveToHistory(prompt: string, modelId: string, response: string) {
  console.log(
    `Saving to history: ${modelId} response to "${prompt.substring(0, 30)}..."`
  );

  // In a real implementation, you would use something like:
  // await db.collection('history').insertOne({
  //   prompt,
  //   modelId,
  //   response,
  //   timestamp: new Date()
  // })
}
