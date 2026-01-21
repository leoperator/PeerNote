import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { extractText, getDocumentProxy } from 'unpdf'

export async function POST(req: Request) {
  try {
    const { fileUrl, notebookId } = await req.json()
    const supabase = await createClient()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API Key missing' }, { status: 500 })
    }

    // 1. Download PDF from Supabase
    const { data, error } = await supabase.storage
      .from('documents')
      .download(fileUrl)

    if (error) throw new Error(error.message)

    // 2. Extract Text using unpdf (The robust way)
    const arrayBuffer = await data.arrayBuffer()
    const pdfBuffer = new Uint8Array(arrayBuffer)
    
    // Load the PDF
    const pdf = await getDocumentProxy(pdfBuffer)
    // Extract all text (mergePages: true joins it all into one string)
    const { text } = await extractText(pdf, { mergePages: true })

    // 3. Clean and Chunk
    // Replace newlines with spaces to help the AI context
    const cleanText = Array.isArray(text) ? text.join(' ') : text
    const sanitizedText = cleanText.replace(/\s+/g, ' ').trim()
    
    // Chunking (approx 1000 chars per chunk)
    const chunks = sanitizedText.match(/[\s\S]{1,1000}/g) || []

    // 4. Generate Embeddings using Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" })

    let processedChunks = 0;
    
    for (const chunk of chunks) {
      if (!chunk || chunk.length < 10) continue; // Skip garbage chunks

      const result = await model.embedContent(chunk)
      const embedding = result.embedding.values

      // 5. Save to Database
      await supabase.from('document_sections').insert({
        notebook_id: notebookId,
        content: chunk,
        embedding: embedding,
      })
      processedChunks++
    }

    return NextResponse.json({ success: true, chunks: processedChunks })

  } catch (error: any) {
    console.error('Processing Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}