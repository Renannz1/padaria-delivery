'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useConfigStore } from '@/store/config-store'
import { useToastStore } from '@/store/toast-store'
import {
  MessageCircle,
  Save,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Loader2,
  KeyRound,
  FileText,
  Bot
} from 'lucide-react'

function SecaoCard({
  titulo,
  icone,
  children,
}: {
  titulo: string
  icone: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: '1.125rem',
        border: '1px solid var(--borda)',
        overflow: 'hidden',
        marginBottom: '1.25rem',
        animation: 'fade-in 0.35s ease both',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--borda)',
          background: '#fdfaf5',
        }}
      >
        <span style={{ color: 'var(--primaria)' }}>{icone}</span>
        <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primario)' }}>
          {titulo}
        </h2>
      </div>
      <div style={{ padding: '1.25rem' }}>{children}</div>
    </div>
  )
}

function Campo({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label
        htmlFor={`campo-${name}`}
        style={{
          display: 'block',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-secundario)',
          marginBottom: '0.375rem',
        }}
      >
        {label}
      </label>
      <input
        id={`campo-${name}`}
        type={type}
        className="input-campo"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

function CampoTexto({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label
        htmlFor={`campo-${name}`}
        style={{
          display: 'block',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-secundario)',
          marginBottom: '0.375rem',
        }}
      >
        {label}
      </label>
      <textarea
        id={`campo-${name}`}
        className="input-campo"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ minHeight: '80px', resize: 'vertical' }}
      />
    </div>
  )
}

export default function WhatsAppPage() {
  const config = useConfigStore()
  const [form, setForm] = useState({
    evolutionAtivo: config.evolutionAtivo,
    evolutionUrl: config.evolutionUrl,
    evolutionApikey: config.evolutionApikey,
    evolutionInstancia: config.evolutionInstancia,
    evolutionSaudacaoAtiva: config.evolutionSaudacaoAtiva,
    evolutionMsgSaudacao: config.evolutionMsgSaudacao,
    evolutionMsgSaudacaoFechado: config.evolutionMsgSaudacaoFechado,
    evolutionCooldownSaudacaoHoras: config.evolutionCooldownSaudacaoHoras,
    msgRecebido: config.msgRecebido,
    msgPreparando: config.msgPreparando,
    msgSaiuEntrega: config.msgSaiuEntrega,
    msgRetiradaPronta: config.msgRetiradaPronta,
    msgEntregue: config.msgEntregue,
  })

  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const addToast = useToastStore((s) => s.addToast)

  useEffect(() => {
    let montado = true
    config.carregarConfigAdmin().then(() => {
      if (!montado) return
      const state = useConfigStore.getState()
      setForm({
        evolutionAtivo: state.evolutionAtivo,
        evolutionUrl: state.evolutionUrl,
        evolutionApikey: state.evolutionApikey,
        evolutionInstancia: state.evolutionInstancia,
        evolutionSaudacaoAtiva: state.evolutionSaudacaoAtiva,
        evolutionMsgSaudacao: state.evolutionMsgSaudacao,
        evolutionMsgSaudacaoFechado: state.evolutionMsgSaudacaoFechado,
        evolutionCooldownSaudacaoHoras: state.evolutionCooldownSaudacaoHoras,
        msgRecebido: state.msgRecebido,
        msgPreparando: state.msgPreparando,
        msgSaiuEntrega: state.msgSaiuEntrega,
        msgRetiradaPronta: state.msgRetiradaPronta,
        msgEntregue: state.msgEntregue,
      })
      setCarregando(false)
    })
    return () => { montado = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function salvar() {
    if (form.evolutionAtivo) {
      if (!form.evolutionUrl.trim()) {
        addToast('A URL da Evolution API é obrigatória se a automação estiver ligada.', 'error')
        return
      }
      if (!form.evolutionApikey.trim()) {
        addToast('A API Key é obrigatória se a automação estiver ligada.', 'error')
        return
      }
      if (!form.evolutionInstancia.trim()) {
        addToast('O nome da instância é obrigatório se a automação estiver ligada.', 'error')
        return
      }
    }

    setSalvando(true)
    try {
      const payload = {
        evolution_ativo: form.evolutionAtivo,
        evolution_url: form.evolutionUrl,
        evolution_apikey: form.evolutionApikey,
        evolution_instancia: form.evolutionInstancia,
        evolution_saudacao_ativa: form.evolutionSaudacaoAtiva,
        evolution_msg_saudacao: form.evolutionMsgSaudacao,
        evolution_msg_saudacao_fechado: form.evolutionMsgSaudacaoFechado,
        evolution_cooldown_saudacao_horas: form.evolutionCooldownSaudacaoHoras,
        msg_recebido: form.msgRecebido,
        msg_preparando: form.msgPreparando,
        msg_saiu_entrega: form.msgSaiuEntrega,
        msg_retirada_pronta: form.msgRetiradaPronta,
        msg_entregue: form.msgEntregue,
      }
      await api.atualizarConfigAdmin(payload)
      config.atualizarConfig(form)
      
      setSalvo(true)
      setTimeout(() => setSalvo(false), 3000)
      addToast('Configurações de WhatsApp salvas com sucesso!', 'success')
    } catch (error) {
      console.error(error)
      addToast('Erro ao salvar configurações.', 'error')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <Loader2 size={32} style={{ color: 'var(--primaria)', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <div
      className="animate-fade-in"
      style={{ padding: 'clamp(1.25rem, 4vw, 2.25rem)' }}
    >
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p
            style={{
              color: 'var(--primaria)',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              margin: '0 0 0.375rem',
            }}
          >
            Painel Admin
          </p>
          <h1
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              fontWeight: 700,
              color: 'var(--text-primario)',
              margin: '0 0 0.375rem',
            }}
          >
            Automação de WhatsApp
          </h1>
          <p style={{ color: 'var(--text-secundario)', fontSize: '0.875rem', margin: 0 }}>
            Gerencie credenciais da Evolution API e templates de mensagens
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 720 }}>
        {/* ── Ativação e Credenciais ── */}
        <SecaoCard titulo="Status da Automação e Credenciais Evolution API" icone={<KeyRound size={18} />}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', background: '#fdfaf5', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--borda)' }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primario)', display: 'block', marginBottom: '0.25rem' }}>
                Ativar envios automáticos
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secundario)' }}>
                Se desligado, os cards no Kanban enviarão você para o WhatsApp Web manualmente.
              </span>
            </div>
            <button
              onClick={() => setForm(f => ({ ...f, evolutionAtivo: !f.evolutionAtivo }))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: form.evolutionAtivo ? 'var(--primaria)' : 'var(--text-terciario)', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 600 }}
            >
              {form.evolutionAtivo ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              {form.evolutionAtivo ? 'Ligado' : 'Desligado'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', opacity: form.evolutionAtivo ? 1 : 0.5, pointerEvents: form.evolutionAtivo ? 'auto' : 'none' }}>
            <Campo
              label="URL da Evolution API"
              name="evolutionUrl"
              value={form.evolutionUrl}
              onChange={(v) => setForm((f) => ({ ...f, evolutionUrl: v }))}
              placeholder="https://panificadora-costa-evolution-api.hsy4rc.easypanel.host"
            />
            <Campo
              label="API Key (Global Auth Token)"
              name="evolutionApikey"
              value={form.evolutionApikey}
              onChange={(v) => setForm((f) => ({ ...f, evolutionApikey: v }))}
              placeholder="Token da instância ou Global API Key"
            />
            <Campo
              label="Nome da Instância"
              name="evolutionInstancia"
              value={form.evolutionInstancia}
              onChange={(v) => setForm((f) => ({ ...f, evolutionInstancia: v }))}
              placeholder="MinhaInstancia"
            />
          </div>
        </SecaoCard>

        {/* ── Webhook e Saudação Automática ── */}
        <SecaoCard titulo="Saudação Automática e Webhook" icone={<Bot size={18} />}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', background: '#fdfaf5', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--borda)' }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primario)', display: 'block', marginBottom: '0.25rem' }}>
                Ativar bot de saudação
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secundario)' }}>
                Se ligado, o sistema envia automaticamente a mensagem de boas-vindas para clientes que mandarem mensagem pela primeira vez no WhatsApp.
              </span>
            </div>
            <button
              onClick={() => setForm(f => ({ ...f, evolutionSaudacaoAtiva: !f.evolutionSaudacaoAtiva }))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: form.evolutionSaudacaoAtiva ? 'var(--primaria)' : 'var(--text-terciario)', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 600 }}
            >
              {form.evolutionSaudacaoAtiva ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              {form.evolutionSaudacaoAtiva ? 'Ligado' : 'Desligado'}
            </button>
          </div>

          <div style={{ opacity: form.evolutionSaudacaoAtiva ? 1 : 0.5, pointerEvents: form.evolutionSaudacaoAtiva ? 'auto' : 'none' }}>
            
            <div style={{
              background: 'rgba(37, 211, 102, 0.05)',
              border: '1px solid rgba(37, 211, 102, 0.2)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-secundario)',
            }}>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: 'var(--text-primario)' }}>
                💡 Variáveis Disponíveis:
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li><strong>{`{{link_site}}`}</strong> - Injeta automaticamente o link do site da padaria na mensagem</li>
              </ul>
              <p style={{ margin: '0.75rem 0 0', fontStyle: 'italic', fontSize: '0.8rem' }}>
                Basta digitar essa tag no meio do texto abaixo e ela será substituída automaticamente!
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secundario)', marginBottom: '0.375rem' }}>
                Mensagem de Saudação (Loja Aberta)
              </label>
              <textarea
                className="input-campo"
                value={form.evolutionMsgSaudacao}
                onChange={(e) => setForm(f => ({ ...f, evolutionMsgSaudacao: e.target.value }))}
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secundario)', marginBottom: '0.375rem' }}>
                Mensagem de Saudação (Loja Fechada)
              </label>
              <textarea
                className="input-campo"
                value={form.evolutionMsgSaudacaoFechado}
                onChange={(e) => setForm(f => ({ ...f, evolutionMsgSaudacaoFechado: e.target.value }))}
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secundario)', marginBottom: '0.375rem' }}>
                Cooldown (Intervalo em Horas)
              </label>
              <input
                type="number"
                className="input-campo"
                value={form.evolutionCooldownSaudacaoHoras}
                onChange={(e) => setForm(f => ({ ...f, evolutionCooldownSaudacaoHoras: parseInt(e.target.value) || 0 }))}
                min={0}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-terciario)', marginTop: '0.25rem', display: 'block' }}>
                Tempo mínimo de espera antes de mandar a saudação de novo para a mesma pessoa. (Padrão: 48h)
              </span>
            </div>

            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed #ccc' }}>
              <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secundario)', marginBottom: '0.375rem' }}>
                URL do Webhook (Copie e cole na Evolution API)
              </span>
              <code style={{ fontSize: '0.8rem', color: 'var(--primaria)', wordBreak: 'break-all', display: 'block', padding: '0.5rem', background: '#fff', borderRadius: '0.25rem', border: '1px solid var(--borda)' }}>
                {`${process.env.NEXT_PUBLIC_API_URL || 'https://sua-api.com'}/pedidos/webhook/evolution/`}
              </code>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-terciario)', marginTop: '0.5rem', display: 'block' }}>
                Configure esse webhook na Evolution API com o evento <strong>messages.upsert</strong> ativado.
              </span>
            </div>
          </div>
        </SecaoCard>

        {/* ── Templates de Mensagem ── */}
        <SecaoCard titulo="Mensagens por Status" icone={<FileText size={18} />}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secundario)', marginBottom: '0.75rem' }}>
            Personalize o que será enviado ao cliente em cada etapa. Evite textos longos demais.
          </p>

          <div style={{
            background: 'rgba(37, 211, 102, 0.05)',
            border: '1px solid rgba(37, 211, 102, 0.2)',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            color: 'var(--text-secundario)',
          }}>
            <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: 'var(--text-primario)' }}>
              💡 Variáveis Disponíveis:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li><strong>{`{{nome_cliente}}`}</strong> - Nome do cliente</li>
              <li><strong>{`{{id_pedido}}`}</strong> - Número do pedido</li>
              <li><strong>{`{{link_acompanhamento}}`}</strong> - Link para acompanhar o pedido em tempo real</li>
            </ul>
            <p style={{ margin: '0.75rem 0 0', fontStyle: 'italic', fontSize: '0.8rem' }}>
              Basta digitar essas tags no meio do texto abaixo e elas serão substituídas automaticamente!
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <CampoTexto
              label="Mensagem de Pedido Recebido"
              name="msgRecebido"
              value={form.msgRecebido}
              onChange={(v) => setForm((f) => ({ ...f, msgRecebido: v }))}
              placeholder="Ex: recebemos seu pedido..."
            />
            
            <CampoTexto
              label="Mensagem de Pedido Preparando"
              name="msgPreparando"
              value={form.msgPreparando}
              onChange={(v) => setForm((f) => ({ ...f, msgPreparando: v }))}
            />

            <CampoTexto
              label="Mensagem de Saiu para Entrega (Delivery)"
              name="msgSaiuEntrega"
              value={form.msgSaiuEntrega}
              onChange={(v) => setForm((f) => ({ ...f, msgSaiuEntrega: v }))}
            />

            <CampoTexto
              label="Mensagem de Retirada Pronta (Retirada na Loja)"
              name="msgRetiradaPronta"
              value={form.msgRetiradaPronta}
              onChange={(v) => setForm((f) => ({ ...f, msgRetiradaPronta: v }))}
            />


          </div>
        </SecaoCard>

        {/* Botão Salvar */}
        <button
          onClick={salvar}
          className="btn-primario"
          disabled={salvando}
          style={{
            width: '100%',
            fontSize: '1rem',
            padding: '1rem',
            cursor: salvando ? 'not-allowed' : 'pointer',
            opacity: salvando ? 0.7 : 1,
            background: salvo ? '#10b981' : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {salvando ? (
            <>
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Salvando...
            </>
          ) : salvo ? (
            <>
              <CheckCircle size={20} /> Salvo com sucesso!
            </>
          ) : (
            <>
              <Save size={20} /> Salvar Configurações
            </>
          )}
        </button>
      </div>
    </div>
  )
}
