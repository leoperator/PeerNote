import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UploadDocDialog } from '@/components/UploadDocDialog'
import { SourceList } from '@/components/SourceList'
import { ChatInterface } from '@/components/ChatInterface'
import { ModeToggle } from '@/components/ModeToggle'
import { ShareButton } from '@/components/ShareButton'
import { Button } from '@/components/ui/button' // <--- ADDED THIS IMPORT

function BackButton() {
  return (
    <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-200 flex items-center gap-1">
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
      Back
    </Link>
  )
}

export default async function NotebookPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  
  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser()
  
  // Redirect to login if not authenticated, passing the current URL as 'next'
  if (!user) {
    redirect(`/login?next=/notebook/${id}`)
  }

  // 2. Fetch Notebook
  const { data: notebook } = await supabase
    .from('notebooks')
    .select('*')
    .eq('id', id)
    .single()

  if (!notebook) redirect('/')

  // 3. ACCESS CONTROL
  const isOwner = notebook.user_id === user.id

  // If access denied, SHOW ERROR instead of redirecting
  if (!isOwner && !notebook.is_public) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="text-center space-y-4">
          <div className="text-4xl">🔒</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Private Notebook</h1>
          <p className="text-slate-500 dark:text-slate-400">
            This notebook is private and you do not have permission to view it.
          </p>
          <Link href="/" className="inline-block">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  // 4. Fetch Documents
  const { data: rawDocuments } = await supabase
    .from('documents')
    .select('*')
    .eq('notebook_id', id)
    .order('created_at', { ascending: true })

  const documents = rawDocuments ? await Promise.all(rawDocuments.map(async (doc) => {
     const { data } = await supabase.storage.from('documents').createSignedUrl(doc.storage_path, 3600)
     return { ...doc, url: data?.signedUrl }
  })) : []

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      
      {/* HEADER */}
      <header className="flex h-14 items-center justify-between border-b px-4 bg-white dark:bg-slate-950 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
          <h1 className="font-semibold text-lg truncate max-w-[300px] flex items-center gap-2">
            {notebook.title}
            {!isOwner && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                    Shared
                </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-2">
           {isOwner && <ShareButton notebookId={notebook.id} initialIsPublic={notebook.is_public} />}
           <ModeToggle />
           <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-medium">
                {user?.email?.[0].toUpperCase()}
            </div>
        </div>
      </header>

      {/* MAIN CONTENT SPLIT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANEL: Sources */}
        <div className="w-1/2 border-r bg-slate-50 flex flex-col dark:bg-slate-900 dark:border-slate-800">
            <div className="p-4 border-b bg-white flex justify-between items-center shadow-sm z-10 dark:bg-slate-950 dark:border-slate-800">
                <span className="font-medium text-sm text-slate-600 dark:text-slate-400">Sources ({documents?.length || 0})</span>
                <div className="scale-90 origin-right">
                  {isOwner && <UploadDocDialog notebookId={notebook.id} />}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
                {documents.length > 0 ? (
                  <SourceList documents={documents} notebookId={notebook.id} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                      <div className="mx-auto h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4">
                         <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-200">No sources yet</h3>
                      <p className="text-xs max-w-[200px] mx-auto mt-1 mb-4 dark:text-slate-400">
                          {isOwner ? "Upload a PDF to start chatting with your notebook." : "The owner hasn't uploaded any documents yet."}
                      </p>
                      {isOwner && <UploadDocDialog notebookId={notebook.id} />}
                  </div>
                )}
            </div>
        </div>

        {/* RIGHT PANEL: AI Chat */}
        <div className="w-1/2 flex flex-col bg-white border-l dark:bg-slate-950 dark:border-slate-800">
            <ChatInterface notebookId={notebook.id} />
        </div>

      </div>
    </div>
  )
}