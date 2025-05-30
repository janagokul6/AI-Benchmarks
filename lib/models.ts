export interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  apiEnvVar: string
  apiSecretKey?:string
}

export const AIModels: AIModel[] = [
  {
    id: "gpt",
    name: "GPT",
    provider: "OpenAI",
    description: "OpenAI's most advanced model, optimized for both vision and language tasks.",
    apiEnvVar: "OPENAI_API_KEY",
  },
  {
    id: "claude",
    name: "Claude",
    provider: "Anthropic",
    description: "Anthropic's most powerful model for complex reasoning and content generation.",
    apiEnvVar: "ANTHROPIC_API_KEY",
  },
  // {
  //   id: "claude-3-sonnet",
  //   name: "Claude 3 Sonnet",
  //   provider: "Anthropic",
  //   description: "A balanced model for a wide range of tasks with good performance.",
  //   apiEnvVar: "ANTHROPIC_API_KEY",
  // },
  // {
  //   id: "claude-3-haiku",
  //   name: "Claude 3 Haiku",
  //   provider: "Anthropic",
  //   description: "Anthropic's fastest and most compact model for quick responses.",
  //   apiEnvVar: "ANTHROPIC_API_KEY",
  // },
  {
    id: "gemini",
    name: "Gemini",
    provider: "Google",
    description: "Google's advanced model for text generation and reasoning.",
    apiEnvVar: "GOOGLE_API_KEY",
  },
  // {
  //   id: "gemini-ultra",
  //   name: "Gemini Ultra",
  //   provider: "Google",
  //   description: "Google's most capable model for complex tasks.",
  //   apiEnvVar: "GOOGLE_API_KEY",
  // },
  {
    id: "deepseek",
    name: "DeepSeek",
    provider: "DeepSeek",
    description: "Specialized model for code generation and understanding.",
    apiEnvVar: "DEEPSEEK_API_KEY",
  },
  {
    id: "llama",
    name: "Llama",
    provider: "Meta",
    description: "Meta's largest open model with strong reasoning capabilities.",
    apiEnvVar: "META_API_KEY",
  },
  // {
  //   id: "llama",
  //   name: "Llama",
  //   provider: "Meta",
  //   description: "Meta's largest open model with strong reasoning capabilities.",
  //   apiEnvVar: "META_API_KEY",
  // },
  {
    id: "grok",
    name: "Grok",
    provider: "xAI",
    description: "xAI's conversational model developed by Elon Musk's team, integrated with X (formerly Twitter).",
    apiEnvVar: "XAI_API_KEY",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    provider: "Perplexity AI",
    description: "An AI research assistant that combines a language model with real-time web search.",
    apiEnvVar: "PERPLEXITY_API_KEY",
  }
  // {
  //   id: "mistral-large",
  //   name: "Mistral Large",
  //   provider: "Mistral AI",
  //   description: "Mistral AI's most powerful model for complex reasoning.",
  //   apiEnvVar: "MISTRAL_API_KEY",
  // },
]
