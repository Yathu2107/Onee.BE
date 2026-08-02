import { apiRequest } from '@/lib/api-client'
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResult,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from '@/UI/auth/MainComponents/core/types'

export function loginApi(payload: LoginRequest) {
  return apiRequest<LoginResult>('/api/accounts/Login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function forgotPasswordApi(payload: ForgotPasswordRequest) {
  return apiRequest<unknown>('/api/accounts/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function verifyOtpApi(payload: VerifyOtpRequest) {
  return apiRequest<unknown>('/api/accounts/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function resetPasswordApi(payload: ResetPasswordRequest) {
  return apiRequest<unknown>('/api/accounts/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logoutApi() {
  return apiRequest<string>('/api/accounts/Logout', {
    method: 'POST',
  })
}
