'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTopic(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const topic = formData.get('topic') as string
  const note = formData.get('note') as string
  const priority = formData.get('priority') as string
  const notebookId = formData.get('notebookId') as string

  await supabase.from('exam_topics').insert({
    notebook_id: notebookId,
    user_id: user.id,
    topic,
    note,
    priority,
    upvotes: [] 
  })

  revalidatePath(`/notebook/${notebookId}`)
}

export async function toggleUpvote(topicId: string, notebookId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: topic } = await supabase.from('exam_topics').select('upvotes').eq('id', topicId).single()
  if (!topic) return

  let newUpvotes: string[] = topic.upvotes || []
  if (newUpvotes.includes(user.id)) {
    newUpvotes = newUpvotes.filter(id => id !== user.id)
  } else {
    newUpvotes.push(user.id)
  }

  await supabase.from('exam_topics').update({ upvotes: newUpvotes }).eq('id', topicId)
  revalidatePath(`/notebook/${notebookId}`)
}