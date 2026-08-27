'use client'

import { useState, useEffect } from 'react'
import { X, Phone, User, KeyRound, ArrowLeft, ArrowRight, CheckCircle2, Loader2, RotateCw, Clock } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { formatarWhatsapp } from '@/lib/utils'

interface Propriedades {
  aoSucesso: () => void
  aoFechar: () => void
}

type EtapaAuth = 1 | 2 | 3

export default function ModalAutenticacao({ aoSucesso, aoFechar }: Propriedades) {
  const [etapa, setEtapa] = useState<EtapaAuth>(1)
  const [carregando, setCarregando] = useState(false)
  const [reenviando, setReenviando] = useState(false)
  const [segundosEspera, setSegundosEspera] = useState(0)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null)

  // Dados do formulário
  const [telefone, setTelefone] = useState('')
  const [codigoOtp, setCodigoOtp] = useState('')
  const [nome, setNome] = useState('')

  const solicitarOtp = useAuthStore((s) => s.solicitarOtp)
  const verificarOtp = useAuthStore((s) => s.verificarOtp)
  const completarCadastro = useAuthStore((s) => s.completarCadastro)

  // Contagem regressiva em tempo real para Exponential Backoff
  useEffect(() => {
    if (segundosEspera <= 0) return
    const intervalo = setInterval(() => {
      setSegundosEspera((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(intervalo)
  }, [segundosEspera])

  // ── Etapa 1: Enviar OTP ───────────────────────────────────────
  async function lidarComEnviarOtp(e: React.FormEvent) {
    e.preventDefault()

    const numeroLimpo = telefone.replace(/\D/g, '')
    if (numeroLimpo.length < 10 || numeroLimpo.length > 13) {
      setErros({ telefone: 'Informe um WhatsApp válido com DDD.' })
      return
    }

    setErros({})
    setCarregando(true)
    try {
      await solicitarOtp(numeroLimpo)
      setEtapa(2)
      setMensagemSucesso('Código enviado para seu WhatsApp!')
      setTimeout(() => setMensagemSucesso(null), 4000)
    } catch (err: any) {
      if (err?.data?.segundos_restantes) {
        setSegundosEspera(Number(err.data.segundos_restantes))
      }
      setErros({
        geral: err?.data?.detail || err?.data?.telefone?.[0] || 'Não foi possível enviar o código. Tente novamente.'
      })
    } finally {
      setCarregando(false)
    }
  }

  // ── Reenviar OTP na Etapa 2 ───────────────────────────────────
  async function lidarComReenviarOtp() {
    if (segundosEspera > 0) return

    const numeroLimpo = telefone.replace(/\D/g, '')
    if (!numeroLimpo) return

    setErros({})
    setReenviando(true)
    try {
      await solicitarOtp(numeroLimpo)
      setMensagemSucesso('Novo código enviado com sucesso!')
      setTimeout(() => setMensagemSucesso(null), 4000)
    } catch (err: any) {
      if (err?.data?.segundos_restantes) {
        setSegundosEspera(Number(err.data.segundos_restantes))
      }
      setErros({
        geral: err?.data?.detail || 'Erro ao reenviar o código.'
      })
    } finally {
      setReenviando(false)
    }
  }

  // ── Etapa 2: Validar OTP ──────────────────────────────────────
  async function lidarComVerificarOtp(e: React.FormEvent) {
    e.preventDefault()

    const codigoLimpo = codigoOtp.replace(/\D/g, '')
    if (codigoLimpo.length < 4) {
      setErros({ codigo: 'Informe o código recebido no WhatsApp.' })
      return
    }

    const numeroLimpo = telefone.replace(/\D/g, '')
    setErros({})
    setCarregando(true)
    try {
      const resultado = await verificarOtp(numeroLimpo, codigoLimpo)

      if (resultado.isNewUser) {
        // Usuário novo -> avançar para etapa 3 (Nome)
        setEtapa(3)
      } else {
        // Usuário já cadastrado -> logado e finaliza modal
        aoSucesso()
      }
    } catch (err: any) {
      setErros({
        geral: err?.data?.detail || err?.data?.codigo?.[0] || 'Código inválido ou expirado.'
      })
    } finally {
      setCarregando(false)
    }
  }

  // ── Etapa 3: Concluir Cadastro com Nome ────────────────────────
  async function lidarComCompletarCadastro(e: React.FormEvent) {
    e.preventDefault()

    const nomeLimpo = nome.trim()
    if (!nomeLimpo) {
      setErros({ nome: 'Informe seu nome completo para continuar.' })
      return
    }

    const numeroLimpo = telefone.replace(/\D/g, '')
    setErros({})
    setCarregando(true)
    try {
      await completarCadastro(numeroLimpo, nomeLimpo)
      aoSucesso()
    } catch (err: any) {
      setErros({
        geral: err?.data?.detail || err?.data?.nome?.[0] || 'Erro ao concluir cadastro.'
      })
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
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {etapa > 1 && (
              <button
                type="button"
                onClick={() => {
                  setErros({})
                  setEtapa((prev) => (prev > 1 ? ((prev - 1) as EtapaAuth) : 1))
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#888597',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1c1208' }}>
                {etapa === 1 && 'Identificação'}
                {etapa === 2 && 'Código de Verificação'}
                {etapa === 3 && 'Criar seu Perfil'}
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#888597' }}>
                {etapa === 1 && 'Digite seu WhatsApp para acessar'}
                {etapa === 2 && `Enviado para ${telefone}`}
                {etapa === 3 && 'Como podemos te chamar?'}
              </p>
            </div>
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

        {/* Indicador de Progresso */}
        <div style={{ display: 'flex', height: 3, background: '#f0ede6' }}>
          <div
            style={{
              height: '100%',
              width: etapa === 1 ? '33%' : etapa === 2 ? '66%' : '100%',
              background: '#c8860a',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Conteúdo */}
        <div style={{ padding: '1.5rem' }}>
          {mensagemSucesso && (
            <div
              style={{
                background: '#f0faf0',
                border: '1px solid #b8ddb8',
                borderRadius: '0.625rem',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                color: '#2e7d32',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={16} />
              {mensagemSucesso}
            </div>
          )}

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

          {/* ── ETAPA 1: Telefone ── */}
          {etapa === 1 && (
            <form onSubmit={lidarComEnviarOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>WhatsApp *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={iconStyle} />
                  <input
                    id="input-auth-telefone"
                    type="tel"
                    className={`input-campo ${erros.telefone ? 'erro' : ''}`}
                    style={{ ...inputComIcone, ...(erros.telefone ? { borderColor: 'var(--color-vermelho-erro)' } : {}) }}
                    value={telefone}
                    onChange={(e) => {
                      setTelefone(formatarWhatsapp(e.target.value))
                      if (erros.telefone) setErros((prev) => ({ ...prev, telefone: '' }))
                      if (erros.geral) setErros((prev) => ({ ...prev, geral: '' }))
                    }}
                    placeholder="(11) 99999-9999"
                    autoComplete="tel"
                  />
                </div>
                {erros.telefone && (
                  <span style={{ color: 'var(--color-vermelho-erro)', fontSize: '0.75rem', marginTop: '0.375rem', display: 'block' }}>
                    {erros.telefone}
                  </span>
                )}
              </div>

              <p style={{ margin: 0, fontSize: '0.8rem', color: '#888597', lineHeight: 1.4 }}>
                Enviaremos um código de acesso rápido diretamente no seu WhatsApp para validar seu pedido.
              </p>

              <button
                id="btn-enviar-otp"
                type="submit"
                className="btn-primario"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                disabled={carregando}
              >
                {carregando ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Continuar <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── ETAPA 2: Código OTP ── */}
          {etapa === 2 && (
            <form onSubmit={lidarComVerificarOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Código de 6 dígitos *</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={iconStyle} />
                  <input
                    id="input-auth-codigo"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className={`input-campo ${erros.codigo ? 'erro' : ''}`}
                    style={{
                      ...inputComIcone,
                      letterSpacing: '0.35rem',
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      ...(erros.codigo ? { borderColor: 'var(--color-vermelho-erro)' } : {}),
                    }}
                    value={codigoOtp}
                    onChange={(e) => {
                      setCodigoOtp(e.target.value.replace(/\D/g, ''))
                      if (erros.codigo) setErros((prev) => ({ ...prev, codigo: '' }))
                      if (erros.geral) setErros((prev) => ({ ...prev, geral: '' }))
                    }}
                    placeholder="000000"
                    autoComplete="one-time-code"
                  />
                </div>
                {erros.codigo && (
                  <span style={{ color: 'var(--color-vermelho-erro)', fontSize: '0.75rem', marginTop: '0.375rem', display: 'block' }}>
                    {erros.codigo}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setErros({})
                    setEtapa(1)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#888597',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                  }}
                >
                  Trocar número
                </button>

                <button
                  type="button"
                  onClick={lidarComReenviarOtp}
                  disabled={reenviando || segundosEspera > 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: segundosEspera > 0 ? '#888597' : '#c8860a',
                    fontWeight: 600,
                    cursor: segundosEspera > 0 ? 'not-allowed' : 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  {reenviando ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : segundosEspera > 0 ? (
                    <>
                      <Clock size={13} />
                      Aguarde {segundosEspera}s
                    </>
                  ) : (
                    <>
                      <RotateCw size={13} />
                      Reenviar código
                    </>
                  )}
                </button>
              </div>

              <button
                id="btn-verificar-otp"
                type="submit"
                className="btn-primario"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                disabled={carregando}
              >
                {carregando ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Confirmar Código <CheckCircle2 size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── ETAPA 3: Nome Completo (Novo Usuário) ── */}
          {etapa === 3 && (
            <form onSubmit={lidarComCompletarCadastro} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Nome Completo *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={iconStyle} />
                  <input
                    id="input-auth-nome"
                    type="text"
                    className={`input-campo ${erros.nome ? 'erro' : ''}`}
                    style={{ ...inputComIcone, ...(erros.nome ? { borderColor: 'var(--color-vermelho-erro)' } : {}) }}
                    value={nome}
                    onChange={(e) => {
                      setNome(e.target.value)
                      if (erros.nome) setErros((prev) => ({ ...prev, nome: '' }))
                      if (erros.geral) setErros((prev) => ({ ...prev, geral: '' }))
                    }}
                    placeholder="Ex: Maria dos Santos"
                    autoComplete="name"
                  />
                </div>
                {erros.nome && (
                  <span style={{ color: 'var(--color-vermelho-erro)', fontSize: '0.75rem', marginTop: '0.375rem', display: 'block' }}>
                    {erros.nome}
                  </span>
                )}
              </div>

              <p style={{ margin: 0, fontSize: '0.8rem', color: '#888597', lineHeight: 1.4 }}>
                Seu número foi validado! Este dispositivo ficará conectado automaticamente para seus próximos pedidos.
              </p>

              <button
                id="btn-completar-cadastro"
                type="submit"
                className="btn-primario"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                disabled={carregando}
              >
                {carregando ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Finalizar e Continuar <ArrowRight size={18} />
                  </>
                )}
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
