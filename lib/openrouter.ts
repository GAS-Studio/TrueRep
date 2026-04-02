import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

const venice = createOpenAI({
  apiKey: process.env.VENICE_API_KEY!,
  baseURL: 'https://api.venice.ai/api/v1',
})

export const MODELS = {
  reasoning: 'deepseek-v3.2',
  drafting: 'llama-3.3-70b',
  scoring: 'llama-3.3-70b',
} as const

export async function generate(
  model: keyof typeof MODELS,
  system: string,
  user: string,
  maxTokens = 4096,
): Promise<string> {
  const modelId = MODELS[model]

  try {
    const { text } = await generateText({
      model: venice.chat(modelId),
      system,
      prompt: user,
      maxOutputTokens: maxTokens,
    })
    return text
  } catch (err) {
    console.warn(`[venice] First attempt failed for ${modelId}, retrying once...`, err)
    await delay(5000)
    try {
      const { text } = await generateText({
        model: venice.chat(modelId),
        system: system + '\n\nIMPORTANT: Your response MUST be valid JSON only. No markdown fences, no explanation.',
        prompt: user,
        maxOutputTokens: maxTokens,
      })
      return text
    } catch (retryErr) {
      throw new Error(`[venice] Both attempts failed for ${modelId}: ${retryErr}`)
    }
  }
}

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
