'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

// 1. We accept userId here
export function CreateNotebookDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notebooks')
        .insert({ 
            title, 
            user_id: userId // 2. Use it here
        })
        .select()
        .single()

      if (error) throw error

      setOpen(false)
      setTitle('')
      router.refresh()
      // Optional: Redirect to new notebook immediately
      // router.push(`/notebook/${data.id}`)
    } catch (error) {
      console.error('Error creating notebook:', error)
      alert('Failed to create notebook')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ New Notebook</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Notebook</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Notebook Name</Label>
            <Input
              id="name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Data Structures"
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}