'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuthStore } from '@/store/admin-auth-store'
import { Eye, EyeOff, Loader2, Lock, User } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const login = useAdminAuthStore((s) => s.login)
  const isLogado = useAdminAuthStore((s) => s.isLogado())

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isLogado) {
      router.replace('/admin')
    }
  }, [isLogado, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const novosErros: Record<string, string> = {}
    if (!username.trim()) novosErros.username = 'Informe o usuário.'
    if (!password) novosErros.password = 'Informe a senha.'

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      return
    }

    setErros({})
    setCarregando(true)
    try {
      await login(username.trim(), password)
      router.replace('/admin')
    } catch (err: any) {
      setErros({
        geral: err?.data?.detail || err?.data?.non_field_errors?.[0] || 'Usuário ou senha incorretos.'
      })
    } finally {
      setCarregando(false)
    }
  }

  if (!mounted) return null

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >

      <div
        style={{
          background: 'white',
          borderRadius: '0.5rem',
          width: '100%',
          maxWidth: 400,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e4e2ea',
          animation: 'modal-content-show 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '2rem 2rem 1.75rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#18171a' }}>
            Área Administrativa
          </h1>
          <p style={{ margin: '0.375rem 0 0', fontSize: '0.85rem', color: '#888597' }}>
            Acesso restrito ao lojista
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: '2rem' }}>
          {erros.geral && (
            <div
              style={{
                background: '#fef0f0',
                border: '1px solid #f8c0c0',
                borderRadius: '0.625rem',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
                color: '#c62828',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {erros.geral}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {/* Usuário */}
            <div>
              <label
                htmlFor="admin-usuario"
                style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#555260', marginBottom: '0.5rem' }}
              >
                Usuário
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#888597',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="admin-usuario"
                  type="text"
                  className={`input-campo ${erros.username ? 'erro' : ''}`}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (erros.username) setErros((prev) => ({ ...prev, username: '' }))
                    if (erros.geral) setErros((prev) => ({ ...prev, geral: '' }))
                  }}
                  placeholder="admin"
                  autoComplete="username"
                  style={{ paddingLeft: '2.5rem', ...(erros.username ? { borderColor: 'var(--color-vermelho-erro)' } : {}) }}
                />
              </div>
              {erros.username && <span style={{ color: 'var(--color-vermelho-erro)', fontSize: '0.75rem', marginTop: '0.375rem', display: 'block' }}>{erros.username}</span>}
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="admin-senha"
                style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#555260', marginBottom: '0.5rem' }}
              >
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  className={`input-campo ${erros.password ? 'erro' : ''}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (erros.password) setErros((prev) => ({ ...prev, password: '' }))
                    if (erros.geral) setErros((prev) => ({ ...prev, geral: '' }))
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: '2.75rem', ...(erros.password ? { borderColor: 'var(--color-vermelho-erro)' } : {}) }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#888597',
                    display: 'flex',
                  }}
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {erros.password && <span style={{ color: 'var(--color-vermelho-erro)', fontSize: '0.75rem', marginTop: '0.375rem', display: 'block' }}>{erros.password}</span>}
            </div>

            <button
              id="btn-login-admin"
              type="submit"
              className="btn-primario"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.375rem' }}
              disabled={carregando}
            >
              {carregando ? (
                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Entrando...</>
              ) : (
                'Entrar no Painel'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
