'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Book, Clock, MoreVertical, Trash } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function NotebookCard({ notebook }: { notebook: any }) {
  const supabase = createClient()
  const router = useRouter()
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await supabase.from('notebooks').delete().eq('id', notebook.id)
    router.refresh()
    setIsDeleting(false)
    setShowDeleteAlert(false)
  }

  const formattedDate = new Date(notebook.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return (
    <>
      <Link href={`/notebook/${notebook.id}`} className="block group">
        {/* FIX: 
            - Changed bg-card to bg-white dark:bg-neutral-900 (Matches homepage)
            - Changed border to dark:border-neutral-800 (Subtle separation)
        */}
        <Card className="relative overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-lg transition-all duration-200 hover:border-blue-500/50 h-full flex flex-col">
            
            {/* Top colored accent bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
            
            <CardHeader className="pb-3 pt-5">
            <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg font-semibold leading-tight flex items-start gap-2 pr-6">
                    <Book className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    {/* Text changed to neutral-100 for crisp white on dark grey */}
                    <span className="text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {notebook.title}
                    </span>
                </CardTitle>

                <div 
                    className="absolute top-4 right-4" 
                    onClick={(e) => e.preventDefault()}
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dark:bg-neutral-900 dark:border-neutral-800">
                            <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
                                onClick={() => setShowDeleteAlert(true)}
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            
            {/* Description text updated to neutral-500/400 */}
            <CardDescription className="flex items-center gap-1 text-xs pt-1 text-neutral-500 dark:text-neutral-400">
                <Clock className="h-3.5 w-3.5" />
                Created {formattedDate}
            </CardDescription>
            </CardHeader>

            <CardFooter className="mt-auto pt-3 pb-4">
               {notebook.is_public && (
                  <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                     Public
                  </span>
               )}
            </CardFooter>
        </Card>
      </Link>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="dark:bg-neutral-900 dark:border-neutral-800">
            <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-neutral-100">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-neutral-400">
                This action cannot be undone. This will permanently delete the notebook
                <span className="font-medium text-neutral-900 dark:text-neutral-100"> "{notebook.title}" </span>
                and all associated documents.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-700">Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
                disabled={isDeleting}
            >
                {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}