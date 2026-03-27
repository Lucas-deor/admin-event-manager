'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginWithOtp, verifyOtp } from './actions/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSendOtp(formData: FormData) {
    setLoading(true)
    setError(null)

    try {
      const result = await loginWithOtp(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setToken('') // reset token clear
        setStep('otp')
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(formData: FormData) {
    setLoading(true)
    setError(null)
    
    formData.append('email', email)

    try {
      const result = await verifyOtp(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-stone-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-stone-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-stone-800">Fazenda Conectada</h1>
          <p className="text-stone-500 mt-2">Acesse a área de gerenciamento</p>
        </div>

        {step === 'email' ? (
          <form action={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Administrativo</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={email || ''}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Receber Código PIN'}
            </Button>
          </form>
        ) : (
          <form action={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2 text-center">
              <Label htmlFor="token" className="text-left block">Código PIN ({process.env.NEXT_PUBLIC_OTP_LENGTH || '6'} dígitos)</Label>
              <Input
                id="token"
                name="token"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={token || ''}
                onChange={(e) => setToken(e.target.value)}
                autoComplete="one-time-code"
                required
                className="w-full text-center tracking-[0.5em] text-lg font-mono"
              />
              <p className="text-xs text-stone-500 mt-2">
                Enviado para {email}
              </p>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verificando...' : 'Entrar no Dashboard'}
            </Button>
            
            <button
              type="button"
              onClick={() => {
                setStep('email')
                setError(null)
                setToken('')
              }}
              className="w-full text-sm text-stone-500 hover:text-stone-800 mt-4"
            >
              Voltar e usar outro e-mail
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
