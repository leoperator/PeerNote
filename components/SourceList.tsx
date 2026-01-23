'use client'

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

export function SourceList({ documents, notebookId }: { documents: any[], notebookId: string }) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

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

  const handleDelete = async (docId: string, storagePath: string) => {
    if (!confirm("Are you sure you want to delete this source?")) return

    setDeletingId(docId)
    try {
        // 1. Delete from Storage
        const { error: storageError } = await supabase
            .storage
            .from('documents')
            .remove([storagePath])
        
        if (storageError) console.error('Storage delete error:', storageError)

        // 2. Delete from Database
        const { error: dbError } = await supabase
            .from('documents')
            .delete()
            .eq('id', docId)

        if (dbError) throw dbError

        router.refresh()
    } catch (error) {
        console.error(error)
        alert('Failed to delete document')
    } finally {
        setDeletingId(null)
    }
  }

  if (!documents || documents.length === 0) return null

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:shadow-sm transition-shadow group">
          
          <div className="h-10 w-10 rounded bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center mr-3 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
          </div>
          
          <div className="flex-1 min-w-0 overflow-hidden">
             <a 
              href={doc.url || '#'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate hover:text-blue-600 dark:hover:text-blue-400 hover:underline block"
              title={doc.name}
            >
              {doc.name}
            </a>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              <span suppressHydrationWarning>
                {new Date(doc.created_at).toLocaleDateString()}
              </span>
            </p>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Process Button */}
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-amber-600 dark:text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                onClick={() => handleProcess(doc)}
                disabled={processingId === doc.id || deletingId === doc.id}
                title="Process with AI"
            >
                {processingId === doc.id ? <span className="animate-spin">⏳</span> : "⚡"}
            </Button>

            {/* Delete Button */}
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => handleDelete(doc.id, doc.storage_path)}
                disabled={processingId === doc.id || deletingId === doc.id}
                title="Delete file"
            >
                {deletingId === doc.id ? <span className="animate-spin">⏳</span> : "🗑️"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}