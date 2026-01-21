import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { message, notebookId } = await req.json()
    const supabase = await createClient()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API Key missing' }, { status: 500 })
    }

    // 1. SAVE USER MESSAGE TO DB
    await supabase.from('chat_messages').insert({
        notebook_id: notebookId,
        role: 'user',
        content: message
    })

    // 2. Embed & Search (Standard RAG stuff)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" })
    
    const embeddingResult = await embeddingModel.embedContent(message)
    const queryEmbedding = embeddingResult.embedding.values

    const { data: chunks } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: 5,
      filter_notebook_id: notebookId
    })

    const context = chunks?.map((c: any) => c.content).join('\n---\n') || ""

    // 3. Generate Answer
    const prompt = `
      You are an enthusiastic and knowledgeable AI study companion.
      Context: ${context}
      User Question: ${message}
      
      Instructions:
      1. Answer clearly and concisely using the context.
      2. If the context is empty, use your general knowledge but mention that it's not in the notes.
      3. Use Markdown formatting.
    `

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // 4. SAVE AI RESPONSE TO DB
    await supabase.from('chat_messages').insert({
        notebook_id: notebookId,
        role: 'ai',
        content: responseText
    })

    return NextResponse.json({ answer: responseText })

  } catch (error: any) {
    console.error('Chat Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}