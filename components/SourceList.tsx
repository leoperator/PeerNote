'use client'

import { Button } from "@/components/ui/button"
import { useState } from "react"

export function SourceList({ documents, notebookId }: { documents: any[], notebookId: string }) {
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleProcess = async (doc: any) => {
    setProcessingId(doc.id)
    try {
      const res = await fetch('/api/docProcess', {
        method: 'POST',
        body: JSON.stringify({ 
          fileUrl: doc.storage_path, 
          notebookId: notebookId 
        })
      })
      if (!res.ok) throw new Error('Failed')
      alert('AI Finished reading ' + doc.name)
    } catch (e) {
      alert('Error processing document')
    } finally {
      setProcessingId(null)
    }
  }

  if (documents.length === 0) return null

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        // DARK MODE FIX: bg-white -> dark:bg-slate-900, border -> dark:border-slate-800
        <div key={doc.id} className="flex items-center p-3 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg hover:shadow-sm transition-shadow group">
          
          {/* Icon Box */}
          <div className="h-10 w-10 rounded bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center mr-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
          </div>
          
          <div className="flex-1 min-w-0 overflow-hidden">
             <a 
              href={doc.url || '#'} 
              target="_blank" 
              rel="noopener noreferrer" 
              // Text colors updated for dark mode
              className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate hover:text-blue-600 dark:hover:text-blue-400 hover:underline block"
            >
              {doc.name}
            </a>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {/* FIX: suppressHydrationWarning added here */}
              <span suppressHydrationWarning>
                {new Date(doc.created_at).toLocaleDateString()}
              </span>
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-amber-600 dark:text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                onClick={() => handleProcess(doc)}
                disabled={processingId === doc.id}
            >
                {processingId === doc.id ? <span className="animate-spin">⏳</span> : "⚡"}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400">
                🗑️
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}