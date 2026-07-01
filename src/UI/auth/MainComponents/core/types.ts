export interface LoginRequest {
  email: string
  password: string
  rememberMe: boolean
}

export interface LoginResult {
  message: string
  userName: string
  email: string
  role: string
  token: string
  refreshToken: string
  refreshTokenExpiration: string
  forcePasswordReset: boolean
}

export interface ForgotPasswordRequest {
  Email: string
}

export interface VerifyOtpRequest {
  Email: string
  Otp: string
}

export interface ResetPasswordRequest {
  Email: string
  NewPassword: string
}

export interface AuthUser {
  userName: string
  email: string
  role: string
}
