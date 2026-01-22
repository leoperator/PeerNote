'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import ReactMarkdown from 'react-markdown'

type Message = {
    id: string
    role: 'user' | 'ai'
    content: string
    created_at: string
}

export function ChatInterface({ notebookId }: { notebookId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Ref for the scrollable container
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const supabase = createClient()

  // 1. Fetch initial history
  useEffect(() => {
    const fetchHistory = async () => {
        const { data } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('notebook_id', notebookId)
            .order('created_at', { ascending: true })
        
        if (data) setMessages(data)
    }
    fetchHistory()
  }, [notebookId, supabase])

  // 2. Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: input,
        created_at: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, notebookId }),
      })
      
      if (!response.ok) throw new Error(await response.text())

      const data = await response.json()
      
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'ai',
        content: data.answer,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, aiMsg])

    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // Added overflow-hidden to the parent to contain the scroll area
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      
      {/* FIXED: Native div with overflow-y-auto handles scrolling reliably */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="space-y-6 pb-4 max-w-3xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'ai' && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center border border-border flex-shrink-0">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
              
              <div
                className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white' 
                    : 'bg-muted text-foreground prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-950/50 prose-pre:border-slate-800'
                }`}
              >
                {msg.role === 'ai' ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                    msg.content
                )}
              </div>

              {msg.role === 'user' && (
                 <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center border border-blue-500 flex-shrink-0">
                   <User className="h-5 w-5 text-white" />
                 </div>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex gap-3 justify-start animate-pulse">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center border border-border">
                    <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
                </div>
                <div className="rounded-2xl px-4 py-2.5 bg-muted text-muted-foreground text-sm flex items-center">
                    Thinking...
                </div>
             </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2 relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your notes..."
            className="pr-12 py-6 text-base bg-muted/50 border-border focus-visible:ring-primary"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className="absolute right-1.5 top-1.5 h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="text-center mt-2">
            <span className="text-[10px] text-muted-foreground">AI can make mistakes. Check important info.</span>
        </div>
      </div>
    </div>
  )
}