import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CreateNotebookDialog } from '@/components/CreateNotebookDialog'
import { ModeToggle } from '@/components/ModeToggle'
import { NotebookCard } from '@/components/NotebookCard'

export default async function Home() {
  const supabase = await createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch notebooks
  const { data: notebooks } = await supabase
    .from('notebooks')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* HEADER */}
      <header className="px-6 h-16 border-b flex items-center justify-between bg-white dark:bg-slate-950 dark:border-slate-800">
        <div className="flex items-center gap-2">
           <div className="h-6 w-6 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">P</div>
           <span className="font-bold text-lg tracking-tight">PeerNote</span>
        </div>
        <div className="flex items-center gap-4">
           <ModeToggle />
           <form action="/auth/signout" method="post">
             <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
               Sign out
             </Button>
           </form>
           <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-100 flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-slate-800">
              {user.email?.[0].toUpperCase()}
           </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-5xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Notebooks</h1>
           <CreateNotebookDialog userId={user.id} />
        </div>

        {notebooks && notebooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* UPDATED LOOP: Uses the component instead of hardcoded HTML */}
            {notebooks.map((notebook) => (
              <NotebookCard key={notebook.id} notebook={notebook} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
             <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 mb-6">
                <span className="text-4xl">📚</span>
             </div>
             <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">No notebooks yet</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first notebook to get started.</p>
             <CreateNotebookDialog userId={user.id} />
          </div>
        )}
      </main>
    </div>
  )
}