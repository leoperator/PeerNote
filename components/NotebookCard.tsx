'use client'

import Link from "next/link"
import { MoreVertical, Pencil, Trash } from "lucide-react"
import { useState, useEffect } from "react"
import { deleteNotebook, renameNotebook } from "@/app/actions"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function NotebookCard({ notebook }: { notebook: any }) {
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [newTitle, setNewTitle] = useState(notebook.title)
  // OPTIMISTIC UI: We show this local state immediately
  const [displayTitle, setDisplayTitle] = useState(notebook.title)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Keep local state in sync if the server eventually sends new props
  useEffect(() => {
    setDisplayTitle(notebook.title)
  }, [notebook.title])

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    // 1. Update UI INSTANTLY (Optimistic update)
    const oldTitle = displayTitle
    setDisplayTitle(newTitle) 
    setIsRenameOpen(false)
    setLoading(true)

    try {
      // 2. Send to Server
      await renameNotebook(notebook.id, newTitle)
      router.refresh()
    } catch (error) {
      // 3. Revert if it fails
      setDisplayTitle(oldTitle)
      alert("Failed to rename")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this notebook?")) return
    try {
      await deleteNotebook(notebook.id)
    } catch (error) {
      alert("Failed to delete")
    }
  }

  return (
    <>
      <div className="group relative block h-40 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all">
        
        <Link href={`/notebook/${notebook.id}`} className="absolute inset-0 z-0" />

        <div className="relative z-10 flex flex-col h-full justify-between pointer-events-none">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              
              <div className="pointer-events-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsRenameOpen(true)}>
                      <Pencil className="mr-2 h-4 w-4" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                {displayTitle} {/* Use LOCAL state here */}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
             <span suppressHydrationWarning>
               {new Date(notebook.created_at).toLocaleDateString()}
             </span>
          </p>
        </div>
      </div>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Notebook</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRename}>
            <div className="py-4">
                <Input 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    placeholder="Notebook Name"
                />
            </div>
            <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsRenameOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}