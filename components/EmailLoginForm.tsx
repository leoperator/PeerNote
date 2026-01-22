'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendOtp, verifyOtp } from '@/app/login/actions'
import { Loader2, Mail } from 'lucide-react'

export function EmailLoginForm({ nextUrl }: { nextUrl: string }) {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 1. Handle Sending the Code
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const res = await sendOtp(email)
    
    setLoading(false)
    if (res?.error) {
      setError(res.error)
    } else {
      setStep('otp')
    }
  }

  // 2. Handle Verifying the Code
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await verifyOtp(email, otp, nextUrl)
    
    setLoading(false)
    if (res?.error) {
      setError(res.error)
    }
  }

  return (
    <div className="space-y-4">
      {step === 'email' ? (
        <form onSubmit={handleSend} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
            Sign in with Email
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4 animate-in fade-in slide-in-from-right-5">
           <div className="space-y-2">
            <Label htmlFor="otp">Enter Code</Label>
            <Input 
              id="otp" 
              type="text" 
              placeholder="" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={loading}
              className="text-center text-lg tracking-widest"
            />
            <p className="text-xs text-slate-500 text-center">
                We sent a code to <span className="font-bold">{email}</span>
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify Code"}
          </Button>
          <button 
            type="button"
            onClick={() => setStep('email')}
            className="w-full text-xs text-slate-500 hover:underline"
          >
            Wrong email? Go back
          </button>
        </form>
      )}

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
            {error}
        </div>
      )}
    </div>
  )
}