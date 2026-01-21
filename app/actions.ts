'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- EXISTING: Create Notebook ---
export async function addNotebook(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string

  const { error } = await supabase.from('notebooks').insert({
    title,
    // description, // Uncomment if you have a description column
    user_id: user.id
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

// --- NEW: Delete Notebook ---
export async function deleteNotebook(id: string) {
  const supabase = await createClient()
  
  // RLS policies in Supabase will automatically ensure 
  // users can only delete their own notebooks.
  const { error } = await supabase
    .from('notebooks')
    .delete()
    .eq('id', id)
  
  if (error) throw new Error(error.message)
  
  revalidatePath('/')
}

export async function renameNotebook(id: string, newTitle: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notebooks')
    .update({ title: newTitle })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
  
  revalidatePath('/')
}

export async function toggleNotebookShare(id: string, isPublic: boolean) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notebooks')
    .update({ is_public: isPublic })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
  
  revalidatePath(`/notebook/${id}`)
  return { success: true }
}