import { RegisterForm } from '@/components/register-form'
import { FootballPitch } from '@/components/court-selector/CourtCard'

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen">
      <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center gap-8 bg-sidebar text-sidebar-foreground p-10 relative overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-2 gap-4 p-8 opacity-[0.07]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ aspectRatio: '116 / 61' }}>
              <FootballPitch />
            </div>
          ))}
        </div>
        <div className="relative z-10 text-center space-y-4">
          <span className="text-6xl">⚽</span>
          <h1 className="text-3xl font-black uppercase tracking-tight">Tu Canchitapp</h1>
          <p className="text-sm text-sidebar-foreground/60 max-w-xs">
            Sistema de reservas para complejos deportivos
          </p>
        </div>
        <div className="relative z-10 w-full max-w-sm opacity-30" style={{ aspectRatio: '116 / 61' }}>
          <FootballPitch />
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center bg-sidebar md:bg-background p-4">
        <div className="mb-8 text-center md:hidden">
          <span className="text-4xl">⚽</span>
          <h1 className="mt-2 text-xl font-black uppercase tracking-tight text-sidebar-foreground">
            Tu Canchitapp
          </h1>
        </div>
        <RegisterForm />
      </div>
    </main>
  )
}
