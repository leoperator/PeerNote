'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function UploadDocDialog({ notebookId }: { notebookId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    
    // 1. Upload file to Supabase Storage
    // We name the file: user_id/notebook_id/random_name.pdf
    const fileExt = file.name.split('.').pop()
    const filePath = `${notebookId}/${Math.random()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      alert('Error uploading file: ' + uploadError.message)
      setLoading(false)
      return
    }

    // 2. Insert record into Database
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        name: file.name,
        storage_path: filePath,
        notebook_id: notebookId
      })

    if (dbError) {
      alert('Error saving document: ' + dbError.message)
    } else {
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white">Add Source</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Source Material</DialogTitle>
          <DialogDescription>Upload resoruces to study.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleUpload} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">Select PDF</Label>
            <Input 
              id="file" 
              type="file" 
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required 
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !file}>
                {loading && <span className="mr-2 animate-spin">⏳</span>}
                {loading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}