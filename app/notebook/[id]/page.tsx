import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UploadDocDialog } from '@/components/UploadDocDialog'
import { SourceList } from '@/components/SourceList'
import { ChatInterface } from '@/components/ChatInterface'
import { ModeToggle } from '@/components/ModeToggle'
import { ShareButton } from '@/components/ShareButton'
import { Button } from '@/components/ui/button'
// FIX: Import the new component
import { TopicBoard } from '@/components/TopicBoard'

function BackButton() {
  return (
    <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
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
  
  // Redirect to login if not authenticated
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

  if (!isOwner && !notebook.is_public) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <div className="text-4xl">🔒</div>
          <h1 className="text-2xl font-bold text-foreground">Private Notebook</h1>
          <p className="text-muted-foreground">
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

  // 5. FIX: Fetch Exam Topics
  const { data: topics } = await supabase
    .from('exam_topics')
    .select('*')
    .eq('notebook_id', id)

  return (
    <div className="flex h-screen flex-col bg-background text-foreground transition-colors duration-300">
      
      {/* HEADER */}
      <header className="flex h-14 items-center justify-between border-b border-border px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="h-6 w-px bg-border"></div>
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
           <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-medium">
                {user?.email?.[0].toUpperCase()}
            </div>
        </div>
      </header>

      {/* MAIN CONTENT SPLIT (3 COLUMNS) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 1. LEFT PANEL: Sources */}
        <div className="w-[350px] min-w-[280px] border-r border-border bg-muted/40 flex flex-col">
            <div className="p-4 border-b border-border bg-background flex justify-between items-center shadow-sm z-10">
                <span className="font-medium text-sm text-muted-foreground">Sources ({documents?.length || 0})</span>
                <div className="scale-90 origin-right">
                  {isOwner && <UploadDocDialog notebookId={notebook.id} />}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
                {documents.length > 0 ? (
                  <SourceList documents={documents} notebookId={notebook.id} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                      <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                         <svg className="w-6 h-6 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                      <h3 className="text-xs font-medium text-foreground">No sources</h3>
                      {isOwner && <div className="mt-2"><UploadDocDialog notebookId={notebook.id} /></div>}
                  </div>
                )}
            </div>
        </div>

        {/* 2. MIDDLE PANEL: AI Chat */}
        <div className="flex-1 flex flex-col bg-background min-w-[400px]">
            <ChatInterface notebookId={notebook.id} />
        </div>

        {/* 3. RIGHT PANEL: Studio */}
        <div className="w-[350px] min-w-[300px] border-l border-border bg-muted/40 flex flex-col">
            <div className="p-4 border-b border-border bg-background flex justify-between items-center shadow-sm z-10 h-[69px]">
                <span className="font-medium text-sm text-muted-foreground">Studio</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                
                {/* FIX: Inserted TopicBoard Card at the top */}
                <TopicBoard 
                    topics={topics || []} 
                    notebookId={notebook.id} 
                    currentUserId={user.id} 
                />

                {/* Existing Studio Cards */}
                <div className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow cursor-pointer group">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        🎙️
                      </div>
                      <span className="font-medium text-sm text-foreground">Audio Overview</span>
                   </div>
                   <p className="text-xs text-muted-foreground">Generate a deep-dive podcast about your notes.</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow cursor-pointer group">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        ⚡
                      </div>
                      <span className="font-medium text-sm text-foreground">Flashcards</span>
                   </div>
                   <p className="text-xs text-muted-foreground">Test your knowledge with AI-generated cards.</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow cursor-pointer group">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                        🧠
                      </div>
                      <span className="font-medium text-sm text-foreground">Mind Map</span>
                   </div>
                   <p className="text-xs text-muted-foreground">Visualize connections between topics.</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow cursor-pointer group">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        📊
                      </div>
                      <span className="font-medium text-sm text-foreground">Reports</span>
                   </div>
                   <p className="text-xs text-muted-foreground">Create a structured summary of your materials.</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow cursor-pointer group">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                        ❓
                      </div>
                      <span className="font-medium text-sm text-foreground">Quiz</span>
                   </div>
                   <p className="text-xs text-muted-foreground">Challenge yourself with multiple choice questions.</p>
                </div>
                
                <div className="p-4 rounded-xl border border-dashed border-border bg-transparent flex flex-col items-center justify-center text-center py-4">
                      <span className="text-[10px] text-muted-foreground">More tools coming soon...</span>
                </div>

            </div>
        </div>

      </div>
    </div>
  )
}