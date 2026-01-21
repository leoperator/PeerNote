# PeerNote 🧠

![Next.js 15](https://img.shields.io/badge/Next.js-15-black) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green) ![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-blue) ![Tailwind](https://img.shields.io/badge/Style-Tailwind-38bdf8)

**PeerNote** is an intelligent, collaborative study companion. It allows students to upload PDFs, organize them into notebooks, and chat with their notes using RAG (Retrieval-Augmented Generation).

Built with the **Google Gemini 2.5** models, it features context-aware AI that can read your documents *and* search the web for up-to-date information.

## ✨ Features

* **📚 RAG-Powered Chat:** Upload 500+ page PDFs and ask specific questions. The AI cites your notes.
* **🌐 Live Web Grounding:** The AI knows the current date and can search Google for info not in your notes (e.g., "Latest Next.js version").
* **🤝 Instant Sharing:** Generate a public link to share your notebook with friends. They can view and chat with your materials without an account.
* **🔐 Dual Auth:** Secure login via **Google OAuth** or **Email OTP**

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (App Router & Server Actions)
* **Database & Auth:** Supabase (PostgreSQL + Auth + Storage)
* **Vector Store:** pgvector (Supabase)
* **AI Model:** Google Gemini 2.5 Flash (via Google AI SDK)
* **Styling:** Tailwind CSS + Shadcn UI
* **PDF Parsing:** unpdf

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone [https://github.com/yourusername/peernote.git](https://github.com/yourusername/peernote.git)
cd peernote
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_ai_studio_key
```

### 3. Database Setup (Supabase)

Go to your Supabase SQL Editor and run these commands to set up the schema and vector search:

```
-- 1. Enable Vector Extension
create extension if not exists vector;

-- 2. Create Tables
create table notebooks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table documents (
  id uuid default gen_random_uuid() primary key,
  notebook_id uuid references notebooks on delete cascade not null,
  name text not null,
  storage_path text not null,
  content text, -- Stores extracted text for context
  embedding vector(768), -- Gemini Embedding Dimensions
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table chat_messages (
  id uuid default gen_random_uuid() primary key,
  notebook_id uuid references notebooks on delete cascade not null,
  role text not null check (role in ('user', 'ai')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS (Security)
alter table notebooks enable row level security;
alter table documents enable row level security;
alter table chat_messages enable row level security;

-- 4. Create Policies (Owner + Public Access)
-- Notebooks
create policy "Users can view own notebooks" on notebooks for select using (auth.uid() = user_id);
create policy "Users can update own notebooks" on notebooks for update using (auth.uid() = user_id);
create policy "Users can delete own notebooks" on notebooks for delete using (auth.uid() = user_id);
create policy "Anyone can view public notebooks" on notebooks for select using (is_public = true);

-- Documents (Inherit access from Notebook)
create policy "Users can manage own documents" on documents for all using (exists (select 1 from notebooks where id = documents.notebook_id and user_id = auth.uid()));
create policy "Anyone can view public documents" on documents for select using (exists (select 1 from notebooks where id = documents.notebook_id and is_public = true));

-- Chat (Inherit access from Notebook)
create policy "Users can manage own chats" on chat_messages for all using (exists (select 1 from notebooks where id = chat_messages.notebook_id and user_id = auth.uid()));
create policy "Public view chat" on chat_messages for select using (exists (select 1 from notebooks where id = chat_messages.notebook_id and is_public = true));
create policy "Public insert chat" on chat_messages for insert with check (exists (select 1 from notebooks where id = chat_messages.notebook_id and is_public = true));

-- 5. Create Vector Search Function
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_notebook_id uuid
)
returns table (
  id uuid,
  content text,
  similarity float
)
language plpgsql
stable
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where documents.notebook_id = filter_notebook_id
  and 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
```


### 4. Storage Setup
1. Go to Supabase Storage -> New Bucket.

2. Name it: documents.

3. Set it to Private (but add a policy to allow authenticated uploads).

### 5. Run

```npm run dev```
