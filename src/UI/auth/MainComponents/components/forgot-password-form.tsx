import { ArrowLeft, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api-client'
import {
  forgotPasswordApi,
  resetPasswordApi,
  verifyOtpApi,
} from '@/UI/auth/MainComponents/core/auth-api'

type Step = 'email' | 'otp' | 'reset' | 'success'

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const titles: Record<Step, string> = {
    email: 'Forgot password',
    otp: 'Verify OTP',
    reset: 'Reset password',
    success: 'Password updated',
  }

  const descriptions: Record<Step, string> = {
    email: 'Enter your email to receive a one-time password.',
    otp: `Enter the OTP sent to ${email}.`,
    reset: 'Choose a strong new password for your account.',
    success: 'You can now sign in with your new password.',
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await forgotPasswordApi({ Email: email })
      setStep('otp')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to send OTP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await verifyOtpApi({ Email: email, Otp: otp })
      setStep('reset')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid OTP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      await resetPasswordApi({ Email: email, NewPassword: newPassword })
      setStep('success')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to reset password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        {step !== 'success' && (
          <button
            type="button"
            onClick={step === 'email' ? onBack : () => setStep(step === 'otp' ? 'email' : 'otp')}
            className="text-onee-earth hover:text-onee-gold mb-4 inline-flex items-center gap-1 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        )}
        <h2 className="text-onee-black text-2xl font-bold">{titles[step]}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{descriptions[step]}</p>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {step === 'email' && (
        <form className="space-y-5" onSubmit={handleEmailSubmit}>
          <div className="space-y-2">
            <label className="text-onee-black text-sm font-medium" htmlFor="forgot-email">
              Email address
            </label>
            <Input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              disabled={isSubmitting}
              className="h-11"
            />
          </div>
          <Button
            type="submit"
            className="bg-onee-gold text-onee-black hover:bg-onee-gold/90 h-11 w-full text-sm font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Send OTP'}
          </Button>
        </form>
      )}

      {step === 'otp' && (
        <form className="space-y-5" onSubmit={handleOtpSubmit}>
          <div className="space-y-2">
            <label className="text-onee-black text-sm font-medium" htmlFor="otp">
              One-time password
            </label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Enter 6-digit OTP"
              required
              disabled={isSubmitting}
              className="h-11"
            />
          </div>
          <Button
            type="submit"
            className="bg-onee-gold text-onee-black hover:bg-onee-gold/90 h-11 w-full text-sm font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Verify OTP'}
          </Button>
        </form>
      )}

      {step === 'reset' && (
        <form className="space-y-5" onSubmit={handleResetSubmit}>
          <div className="space-y-2">
            <label className="text-onee-black text-sm font-medium" htmlFor="new-password">
              New password
            </label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              disabled={isSubmitting}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-onee-black text-sm font-medium" htmlFor="confirm-password">
              Confirm password
            </label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              disabled={isSubmitting}
              className="h-11"
            />
          </div>
          <Button
            type="submit"
            className="bg-onee-gold text-onee-black hover:bg-onee-gold/90 h-11 w-full text-sm font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Reset password'}
          </Button>
        </form>
      )}

      {step === 'success' && (
        <Button
          type="button"
          className="bg-onee-gold text-onee-black hover:bg-onee-gold/90 h-11 w-full text-sm font-semibold"
          onClick={onBack}
        >
          Back to sign in
        </Button>
      )}
    </div>
  )
}
