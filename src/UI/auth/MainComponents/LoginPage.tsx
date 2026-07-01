import { Helmet } from 'react-helmet-async'
import { LoginForm } from '@/UI/auth/MainComponents/components/login-form'

const LOGO_SRC = '/media/logos/Logo Without Background.png'

export function LoginPage() {
  return (
    <div className="bg-onee-white relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <Helmet>
        <title>Sign In | Onee Admin</title>
      </Helmet>

      {/* Subtle ambient accents */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="bg-onee-cream/60 absolute -top-40 right-0 size-96 rounded-full blur-3xl" />
        <div className="bg-onee-gold/5 absolute -bottom-32 left-0 size-80 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-[26rem] flex-col items-center">
        <header className="mb-8 flex flex-col items-center text-center">
          <img
            src={LOGO_SRC}
            alt="Onee"
            className="h-30 w-auto object-contain sm:h-24"
            draggable={false}
          />
          <p className="text-onee-earth mt-5 text-xs font-medium tracking-[0.2em] uppercase">
            Admin Portal
          </p>
        </header>

        <div className="border-onee-earth/15 bg-onee-white w-full overflow-hidden rounded-2xl border shadow-lg shadow-onee-black/5">
          <div className="bg-onee-gold h-1 w-full" />
          <div className="p-7 sm:p-8">
            <LoginForm />
          </div>
        </div>

        <p className="text-onee-earth/60 mt-8 text-center text-xs">
          &copy; {new Date().getFullYear()} Onee. All rights reserved.
        </p>
      </div>
    </div>
  )
}
