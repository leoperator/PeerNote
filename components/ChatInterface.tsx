'use client'

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ReactMarkdown from 'react-markdown'
import { createClient } from '@/utils/supabase/client' // Import client

interface Message {
  role: 'user' | 'ai'
  content: string
}

export function ChatInterface({ notebookId }: { notebookId: string }) {
  const [messages, setMessages] = useState<Message[]>([]) // Start empty
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient() // Initialize Supabase client

  // 1. FETCH HISTORY ON LOAD
  useEffect(() => {
    const fetchMessages = async () => {
        const { data } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('notebook_id', notebookId)
            .order('created_at', { ascending: true })

        if (data && data.length > 0) {
            setMessages(data.map(msg => ({ role: msg.role as 'user' | 'ai', content: msg.content })))
        } else {
            // Default welcome message if no history
            setMessages([{ role: 'ai', content: "Hello! I'm ready to answer questions about your documents." }])
        }
    }
    fetchMessages()
  }, [notebookId])

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input
    setInput("")
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage, notebookId })
      })
      
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setMessages(prev => [...prev, { role: 'ai', content: data.answer }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`h-8 w-8 rounded flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${
                msg.role === 'ai' ? 'bg-blue-600' : 'bg-slate-500'
            }`}>
                {msg.role === 'ai' ? 'AI' : 'You'}
            </div>
            
            <div className={`p-4 rounded-xl text-sm leading-relaxed max-w-[85%] shadow-sm ${
                msg.role === 'ai' 
                  ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-tl-none' 
                  : 'bg-blue-600 text-white rounded-tr-none'
            }`}>
                {msg.role === 'ai' ? (
                  <ReactMarkdown 
                    components={{
                      ul: ({...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                      ol: ({...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                      li: ({...props}) => <li className="pl-1" {...props} />,
                      h1: ({...props}) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0 text-slate-900 dark:text-white" {...props} />,
                      h2: ({...props}) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0 text-slate-900 dark:text-white" {...props} />,
                      h3: ({...props}) => <h3 className="text-sm font-bold mb-1 mt-2 text-slate-900 dark:text-white" {...props} />,
                      strong: ({...props}) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                      p: ({...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      code: ({...props}) => <code className="bg-slate-200 dark:bg-slate-900 px-1 py-0.5 rounded text-xs font-mono text-pink-600" {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                   msg.content
                )}
            </div>
          </div>
        ))}
        {loading && (
             <div className="flex gap-4">
                <div className="h-8 w-8 rounded bg-blue-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">AI</div>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl rounded-tl-none text-sm text-slate-500 dark:text-slate-400 italic">
                    Thinking...
                </div>
            </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t bg-white dark:bg-slate-950 dark:border-slate-800">
        <form onSubmit={handleSend} className="flex gap-2 relative">
            <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your notes..." 
                className="pr-20 bg-white dark:bg-slate-900 dark:text-white dark:border-slate-700 placeholder:text-slate-400"
                disabled={loading}
            />
            <Button type="submit" className="absolute right-1 top-1 h-8">
                Send
            </Button>
        </form>
      </div>
    </div>
  )
}