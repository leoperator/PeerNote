import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CreateNotebookDialog } from '@/components/CreateNotebookDialog'
import { NotebookCard } from '@/components/NotebookCard'
import { ModeToggle } from '@/components/ModeToggle'
import { BookOpen, FileText, Image as ImageIcon, Video } from 'lucide-react'

export default async function Home() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch notebooks if user is logged in
    const notebooks = user ? await supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        : null

    return (
        <main className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">

            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-900/75 dark:border-neutral-800">
                <div className="container mx-auto flex h-14 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">P</span>
                        </div>
                        <span className="font-bold text-xl hidden md:inline-block dark:text-neutral-100">PeerNote</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-neutral-500 hidden md:inline-block dark:text-neutral-400">{user.email}</span>
                                <form action="/auth/signout" method="post">
                                    <Button variant="outline" size="sm" className="dark:border-neutral-700 dark:text-neutral-300">Sign Out</Button>
                                </form>
                            </div>
                        ) : (
                            <Link href="/login">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Sign In</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section*/}
            {!user && (
                <section className="flex-1 flex flex-col items-center justify-center text-center p-4 -mt-14">
                    <div className="max-w-3xl space-y-8">
                        <div className="inline-flex items-center gap-2 p-2 px-4 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4 dark:bg-blue-900/30 dark:text-blue-400">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Your AI Study Companion
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-neutral-900 dark:text-neutral-50">
                            The smartest way to <br className="hidden md:block" />
                            <span className="text-blue-600">prepare for exams.</span>
                        </h1>

                        <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-[700px] mx-auto leading-relaxed">
                            Consolidate your chaos. Upload PDFs, lecture slides, screenshots, or textbooks and share them with peers.
                            PeerNote turns your study materials into instant summaries, quizzes, and answers so you're ready for test day.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link href="/login">
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base shadow-lg shadow-blue-900/20">
                                    Get Started
                                </Button>
                            </Link>
                            <Link
                                href="https://github.com/leoperator/PeerNote"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="outline" size="lg" className="h-12 px-8 text-base dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
                                    <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                                    Learn More
                                </Button>
                            </Link>
                        </div>

                        <div className="pt-12 flex flex-wrap justify-center gap-8 text-neutral-400 dark:text-neutral-500">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                <span className="text-sm font-medium">PDFs & Docs</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Video className="h-5 w-5" />
                                <span className="text-sm font-medium">Lecture Videos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                <span className="text-sm font-medium">Screenshots & Images</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                <span className="text-sm font-medium">Textbooks</span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Dashboard Section (Only shown if logged in) */}
            {user && (
                <section className="container mx-auto p-4 py-8 flex-1">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Your Notebooks</h2>
                            <p className="text-neutral-500 dark:text-neutral-400">Manage and chat with your study materials.</p>
                        </div>
                        <CreateNotebookDialog userId={user.id} />
                    </div>

                    {notebooks && notebooks.data && notebooks.data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {notebooks.data.map((notebook) => (
                                <NotebookCard key={notebook.id} notebook={notebook} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-50 mb-2">No notebooks yet</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-6">Create your first notebook to get started.</p>
                            <CreateNotebookDialog userId={user.id} />
                        </div>
                    )}
                </section>
            )}

        </main>
    )
}