'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Check, Globe, Lock } from 'lucide-react'
import { toggleNotebookShare } from '@/app/actions'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function ShareButton({ notebookId, initialIsPublic }: { notebookId: string, initialIsPublic: boolean }) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  // Generate the full URL (browser only)
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/notebook/${notebookId}`
    : ''

  const handleToggle = async (checked: boolean) => {
    setLoading(true)
    try {
      await toggleNotebookShare(notebookId, checked)
      setIsPublic(checked)
    } catch (error) {
      console.error(error)
      // Revert if failed
      setIsPublic(!checked)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {isPublic ? <Globe className="h-4 w-4 text-blue-500" /> : <Lock className="h-4 w-4 text-slate-500" />}
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Share Notebook</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Anyone with the link can view and chat.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
                id="public-mode" 
                checked={isPublic} 
                onCheckedChange={handleToggle}
                disabled={loading}
            />
            <Label htmlFor="public-mode">Public Access</Label>
          </div>

          {isPublic && (
            <div className="flex items-center space-x-2">
              <Input value={shareUrl} readOnly className="h-8 text-xs" />
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}