'use client'

import { useState } from 'react'
import { X, Phone, User, CreditCard, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { formatarWhatsapp, formatarCpf } from '@/lib/utils'

type TipoAba = 'login' | 'cadastro'

interface Propriedades {
  aoSucesso: () => void
  aoFechar: () => void
}

export default function ModalAutenticacao({ aoSucesso, aoFechar }: Propriedades) {
  const [aba, setAba] = useState<TipoAba>('login')
  const [carregando, setCarregando] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})

  // Login
  const [whatsappLogin, setWhatsappLogin] = useState('')
  const [cpfLogin, setCpfLogin] = useState('')

  // Cadastro
  const [nome, setNome] = useState('')
  const [whatsappCadastro, setWhatsappCadastro] = useState('')
  const [cpf, setCpf] = useState('')

  const login = useAuthStore((s) => s.login)
  const cadastrar = useAuthStore((s) => s.cadastrar)

  async function lidarComLogin(e: React.FormEvent) {
    e.preventDefault()
    
    const novosErros: Record<string, string> = {}
    const numero = whatsappLogin.replace(/\D/g, '')
    if (numero.length < 10) novosErros.whatsappLogin = 'WhatsApp inválido.'
    const cpfLimpo = cpfLogin.replace(/\D/g, '')
    if (cpfLimpo.length !== 11) novosErros.cpfLogin = 'CPF inválido.'

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      return
    }

    setErros({})
    setCarregando(true)
    try {
      await login(whatsappLogin, cpfLimpo)
      aoSucesso()
    } catch (err: any) {
      setErros({
        geral: err?.data?.detail || err?.data?.non_field_errors?.[0] || 'WhatsApp ou CPF incorretos.'
      })
    } finally {
      setCarregando(false)
    }
  }

  async function lidarComCadastro(e: React.FormEvent) {
    e.preventDefault()

    const novosErros: Record<string, string> = {}
    if (!nome.trim()) novosErros.nome = 'Informe seu nome.'
    const numero = whatsappCadastro.replace(/\D/g, '')
    if (numero.length < 10) novosErros.whatsappCadastro = 'WhatsApp inválido.'
    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length !== 11) novosErros.cpf = 'CPF inválido.'

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      return
    }

    setErros({})
    setCarregando(true)
    try {
      await cadastrar(nome.trim(), whatsappCadastro, cpfLimpo)
      aoSucesso()
    } catch (err: any) {
      const data = err?.data
      const novosErrosApi: Record<string, string> = {}
      if (data?.whatsapp?.[0]) novosErrosApi.whatsappCadastro = data.whatsapp[0]
      if (data?.cpf?.[0]) novosErrosApi.cpf = data.cpf[0]
      
      const erroGeral = data?.detail || data?.non_field_errors?.[0]
      if (erroGeral) novosErrosApi.geral = erroGeral
      
      if (Object.keys(novosErrosApi).length === 0) {
        novosErrosApi.geral = 'Erro ao criar conta. Verifique os dados.'
      }
      setErros(novosErrosApi)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(28, 18, 8, 0.65)',
        backdropFilter: 'blur(4px)',
        animation: 'modal-backdrop-fade 0.2s ease',
      }}
      onClick={aoFechar}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '1.25rem',
          width: '100%',
          maxWidth: 440,
          overflow: 'hidden',
          animation: 'modal-content-show 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e4e2ea',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1c1208' }}>
              Identificação
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#888597' }}>
              Necessária para finalizar o pedido
            </p>
          </div>
          <button
            onClick={aoFechar}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#888597',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Abas */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e4e2ea' }}>
          {(['login', 'cadastro'] as TipoAba[]).map((a) => (
            <button
              key={a}
              onClick={() => { setAba(a); setErros({}) }}
              style={{
                flex: 1,
                padding: '0.875rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: aba === a ? 700 : 500,
                color: aba === a ? '#c8860a' : '#888597',
                borderBottom: aba === a ? '2px solid #c8860a' : '2px solid transparent',
                marginBottom: -1,
                transition: 'all 0.2s',
              }}
            >
              {a === 'login' ? 'Já tenho conta' : 'Primeira vez'}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div style={{ padding: '1.5rem' }}>
          {erros.geral && (
            <div
              style={{
                background: '#fef0f0',
                border: '1px solid #f8c0c0',
                borderRadius: '0.625rem',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                color: '#c62828',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {erros.geral}
            </div>
          )}

          {aba === 'login' ? (
            <form onSubmit={lidarComLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>WhatsApp *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={iconStyle} />
                  <input
                    id="login-whatsapp"
                    type="tel"
                    className={`input-campo ${erros.whatsappLogin ? 'erro' : ''}`}
                    style={{ ...inputComIcone, ...(erros.whatsappLogin ? { borderColor: 'var(--color-vermelho-erro)' } : {}) }}
                    value={whatsappLogin}
                    onChange={(e) => {
                      setWhatsappLogin(formatarWhatsapp(e.target.value))
                      if (erros.whatsappLogin) setErros((prev) => ({ ...prev, whatsappLogin: '' }))
                      if (erros.geral) setErros((prev) => ({ ...prev, geral: '' }))
                    }}
                    placeholder="(11) 99999-9999"
                    autoComplete="tel"
                  />
                </div>
                {erros.whatsappLogin && <span style={{ color: 'var(--color-vermelho-erro)', fontSize: '0.75rem', marginTop: '0.375rem', display: 'block' }}>{erros.whatsappLogin}</span>}
              </div>

              <div>
                <label style={labelStyle}>CPF *</label>
                <div style={{ position: 'relative' }}>
                  <CreditCard size={16} style={iconStyle} />
                  <input
                    id="login-cpf"
                    type="tel"
                    className={`input-campo ${erros.cpfLogin ? 'erro' : ''}`}
                    style={{ ...inputComIcone, ...(erros.cpfLogin ? { borderColor: 'var(--color-vermelho-erro)' } : {}) }}
                    value={cpfLogin}
                    onChange={(e) => {
                      setCpfLogin(formatarCpf(e.target.value))
                      if (erros.cpfLogin) setErros((prev) => ({ ...prev, cpfLogin: '' }))
                      if (erros.geral) setErros((prev) => ({ ...prev, geral: '' }))
                    }}
                    placeholder="000.000.000-00"
                  />
                </div>
                {erros.cpfLogin && <span style={{ color: 'var(--color-vermelho-erro)', fontSize: '0.75rem', marginTop: '0.375rem', display: 'block' }}>{erros.cpfLogin}</span>}
              </div>

              <button
                id="btn-entrar"
                type="submit"
                className="btn-primario"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={carregando}
              >
                {carregando ? <Loader2 size={18} className="animate-spin" /> : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={lidarComCadastro} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Nome completo *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={iconStyle} />
                  <input
                    id="cadastro-nome"
                    type="text"
                    className={`input-campo ${erros.nome ? 'erro' : ''}`}
                    style={{ ...inputComIcone, ...(erros.nome ? { borderColor: 'var(--color-vermelho-erro)' } : {}) }}
                    value={nome}
                    onChange={(e) => {
                      setNome(e.target.value)
                      if (erros.nome) setErros((prev) => ({ ...prev, nome: '' }))
                      if (erros.geral) setErros((prev) => ({ ...prev, geral: '' }))
                    }}
                    placeholder="João da Silva"
                    autoComplete="name"
                  />
                </div>
                {erros.nome && <span style={{ color: 'var(--color-vermelho-erro)', fontSize: '0.75rem', marginTop: '0.375rem', display: 'block' }}>{erros.nome}</span>}
              </div>

              <div>
                <label style={labelStyle}>WhatsApp *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={iconStyle} />
                  <input
                    id="cadastro-whatsapp"
                    type="tel"
                    className={`input-campo ${erros.whatsappCadastro ? 'erro' : ''}`}
                    style={{ ...inputComIcone, ...(erros.whatsappCadastro ? { borderColor: 'var(--color-vermelho-erro)' } : {}) }}
                    value={whatsappCadastro}
                    onChange={(e) => {
                      setWhatsappCadastro(formatarWhatsapp(e.target.value))
                      if (erros.whatsappCadastro) setErros((prev) => ({ ...prev, whatsappCadastro: '' }))
                      if (erros.geral) setErros((prev) => ({ ...prev, geral: '' }))
                    }}
                    placeholder="(11) 99999-9999"
                    autoComplete="tel"
                  />
                </div>
                {erros.whatsappCadastro && <span style={{ color: 'var(--color-vermelho-erro)', fontSize: '0.75rem', marginTop: '0.375rem', display: 'block' }}>{erros.whatsappCadastro}</span>}
              </div>

              <div>
                <label style={labelStyle}>CPF *</label>
                <div style={{ position: 'relative' }}>
                  <CreditCard size={16} style={iconStyle} />
                  <input
                    id="cadastro-cpf"
                    type="text"
                    inputMode="numeric"
                    className={`input-campo ${erros.cpf ? 'erro' : ''}`}
                    style={{ ...inputComIcone, ...(erros.cpf ? { borderColor: 'var(--color-vermelho-erro)' } : {}) }}
                    value={cpf}
                    onChange={(e) => {
                      setCpf(formatarCpf(e.target.value))
                      if (erros.cpf) setErros((prev) => ({ ...prev, cpf: '' }))
                      if (erros.geral) setErros((prev) => ({ ...prev, geral: '' }))
                    }}
                    placeholder="000.000.000-00"
                    autoComplete="off"
                    maxLength={14}
                  />
                </div>
                {erros.cpf && <span style={{ color: 'var(--color-vermelho-erro)', fontSize: '0.75rem', marginTop: '0.375rem', display: 'block' }}>{erros.cpf}</span>}
              </div>

              <button
                id="btn-cadastrar"
                type="submit"
                className="btn-primario"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={carregando}
              >
                {carregando ? <Loader2 size={18} className="animate-spin" /> : 'Criar conta e continuar'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  fontSize: '0.82rem',
  color: '#555260',
  marginBottom: '0.375rem',
}

const iconStyle: React.CSSProperties = {
  position: 'absolute',
  left: '0.875rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#888597',
  pointerEvents: 'none',
}

const inputComIcone: React.CSSProperties = {
  paddingLeft: '2.5rem',
}
