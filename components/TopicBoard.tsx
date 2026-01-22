'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowBigUp, Target } from 'lucide-react'
import { addTopic, toggleUpvote } from '@/app/notebook/[id]/topic-actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

type Topic = {
  id: string
  topic: string
  note: string
  priority: 'high' | 'medium' | 'low'
  upvotes: string[]
}

export function TopicBoard({ topics, notebookId, currentUserId }: { topics: Topic[], notebookId: string, currentUserId: string }) {
  const [isAdding, setIsAdding] = useState(false)

  // Sort by Weight
  const getWeight = (t: Topic) => {
    let base = t.priority === 'high' ? 5 : t.priority === 'medium' ? 3 : 1
    return base + (t.upvotes?.length || 0)
  }
  const sortedTopics = [...topics].sort((a, b) => getWeight(b) - getWeight(a))

  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* FIX: Updated structure to match other Studio cards */}
        <div className="p-4 w-full text-left rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:shadow-md transition-shadow cursor-pointer group">
           {/* Row for Icon + Title */}
           <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center">
                 <Target className="h-4 w-4" />
              </div>
              <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">Weighted Topics</span>
           </div>
           {/* Description below */}
           <p className="text-xs text-neutral-500 dark:text-neutral-400">See what's likely to come in the exam.</p>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 p-0 gap-0">
        <DialogHeader className="p-6 border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div className="flex justify-between items-center pr-8">
                <div>
                    <DialogTitle className="text-xl dark:text-neutral-100">Exam Strategy Board</DialogTitle>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Topics ranked by probability and peer votes.
                    </p>
                </div>
                <Button size="sm" onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isAdding ? "Cancel" : "Add Topic"}
                </Button>
            </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-neutral-50 dark:bg-neutral-900/50">
            {isAdding && (
                <form action={async (fd) => { await addTopic(fd); setIsAdding(false) }} className="mb-6 p-4 rounded-xl border border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 space-y-4">
                    <input type="hidden" name="notebookId" value={notebookId} />
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-xs font-semibold uppercase text-neutral-500">Topic</label>
                            <Input name="topic" required placeholder="e.g. Naviers Stokes Equation" className="bg-white dark:bg-neutral-950 dark:border-neutral-800" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase text-neutral-500">Priority</label>
                            <Select name="priority" defaultValue="medium">
                                <SelectTrigger className="bg-white dark:bg-neutral-950 dark:border-neutral-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high">High (Def coming)</SelectItem>
                                    <SelectItem value="medium">Medium (Likely)</SelectItem>
                                    <SelectItem value="low">Low (Just read)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase text-neutral-500">Quick Tip / Note</label>
                        <Textarea name="note" placeholder="Prof mentioned this 3 times in class..." className="bg-white dark:bg-neutral-950 dark:border-neutral-800 resize-none h-20" />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Post to Board</Button>
                </form>
            )}

            <div className="space-y-3">
                {sortedTopics.length === 0 && !isAdding && (
                    <div className="text-center py-12 text-neutral-400 dark:text-neutral-600 italic">
                        No topics listed yet. Be the first to drop a hint!
                    </div>
                )}

                {sortedTopics.map((item) => {
                    const isHigh = item.priority === 'high'
                    const hasUpvoted = item.upvotes?.includes(currentUserId)
                    return (
                        <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm">
                            <div className="flex flex-col items-center gap-1 pt-1">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => toggleUpvote(item.id, notebookId)}
                                    className={`h-8 w-8 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-900 ${hasUpvoted ? 'text-blue-600' : 'text-neutral-400'}`}
                                >
                                    <ArrowBigUp className={`h-6 w-6 ${hasUpvoted ? 'fill-current' : ''}`} />
                                </Button>
                                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">{item.upvotes?.length || 0}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant={isHigh ? "destructive" : "secondary"} className="uppercase text-[10px] tracking-wider px-1.5">
                                        {item.priority}
                                    </Badge>
                                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{item.topic}</h4>
                                </div>
                                {item.note && (
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mt-1">
                                        {item.note}
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}