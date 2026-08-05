'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useConfigStore, HorarioDia } from '@/store/config-store'
import { useToastStore } from '@/store/toast-store'
import {
  Store,
  Clock,
  Truck,
  CreditCard,
  Save,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  ShoppingBag,
  Settings2,
  MapPin,
  Plus,
  Trash2,
  Loader2,
  MessageCircle
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
  prefixo,
  erro,
}: {
  label: string
  name: string
  value: string | number
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  prefixo?: string
  erro?: string
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label
        htmlFor={`campo-${name}`}
        style={{
          display: 'block',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: erro ? '#c62828' : 'var(--text-secundario)',
          marginBottom: '0.375rem',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {prefixo && (
          <span
            style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-terciario)',
              fontSize: '0.9rem',
              pointerEvents: 'none',
            }}
          >
            {prefixo}
          </span>
        )}
        <input
          id={`campo-${name}`}
          type={type}
          className="input-campo"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ 
            paddingLeft: prefixo ? '2rem' : undefined,
            borderColor: erro ? '#f8c0c0' : undefined,
            background: erro ? '#fef0f0' : undefined,
          }}
        />
      </div>
      {erro && (
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#c62828' }}>
          {erro}
        </p>
      )}
    </div>
  )
}

function CampoHorario({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: '0.75rem',
          color: 'var(--text-terciario)',
          marginBottom: '0.25rem',
        }}
      >
        {label}
      </label>
      <input
        type="time"
        className="input-campo"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 130 }}
      />
    </div>
  )
}

const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
]

function formatarWhatsApp(valor: string) {
  const v = valor.replace(/\D/g, '').substring(0, 11)
  if (v.length > 10) return `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`
  if (v.length > 6) return `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`
  if (v.length > 2) return `(${v.substring(0, 2)}) ${v.substring(2)}`
  if (v.length > 0) return `(${v}`
  return ''
}

export default function ConfiguracoesPage() {
  const config = useConfigStore()
  const [form, setForm] = useState({
    nomeEstabelecimento: config.nomeEstabelecimento,
    enderecoLoja: config.enderecoLoja,
    whatsappContato: config.whatsappContato,
    modoAutomatico: config.modoAutomatico,
    lojaAbertaManual: config.lojaAbertaManual,
    horariosSemana: JSON.parse(JSON.stringify(config.horariosSemana)) as Record<number, HorarioDia>,
    pedidoMinimo: config.pedidoMinimo,
    chavePix: config.chavePix,
    nomeRecebedor: config.nomeRecebedor,
    bairrosAtendidos: [...config.bairrosAtendidos],
  })

  const [erros, setErros] = useState<Record<string, string>>({})
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const addToast = useToastStore((s) => s.addToast)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let montado = true
    config.carregarConfigAdmin().then(() => {
      if (!montado) return
      const state = useConfigStore.getState()
      setForm({
        nomeEstabelecimento: state.nomeEstabelecimento,
        enderecoLoja: state.enderecoLoja,
        whatsappContato: state.whatsappContato,
        modoAutomatico: state.modoAutomatico,
        lojaAbertaManual: state.lojaAbertaManual,
        horariosSemana: JSON.parse(JSON.stringify(state.horariosSemana)) as Record<number, HorarioDia>,
        pedidoMinimo: state.pedidoMinimo,
        chavePix: state.chavePix,
        nomeRecebedor: state.nomeRecebedor,
        bairrosAtendidos: [...state.bairrosAtendidos],
      })
      setCarregando(false)
    })
    return () => { montado = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const aberto = config.estaAberto()

  async function salvar() {
    const novosErros: Record<string, string> = {}
    
    // Validação Frontend em bloco único
    if (!form.nomeEstabelecimento?.trim()) novosErros.nomeEstabelecimento = 'Informe o nome do estabelecimento.'
    if (!form.enderecoLoja?.trim()) novosErros.enderecoLoja = 'Informe o endereço da loja.'
    if (!form.whatsappContato?.trim()) novosErros.whatsappContato = 'Informe o WhatsApp de contato.'
    if (form.pedidoMinimo === undefined || form.pedidoMinimo < 0) novosErros.pedidoMinimo = 'Informe um pedido mínimo.'

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      addToast('Faltam informações obrigatórias. Verifique os campos em vermelho.', 'error')
      return
    }

    setErros({})
    setSalvando(true)

    try {
      // Prepara payload pro backend (snake_case)
      const payload = {
        nome: form.nomeEstabelecimento,
        endereco: form.enderecoLoja,
        whatsapp_contato: form.whatsappContato,
        pedido_minimo: Number(form.pedidoMinimo),
        chave_pix: form.chavePix,
        nome_recebedor_pix: form.nomeRecebedor,
        modo_automatico: form.modoAutomatico,
        loja_aberta_manual: form.lojaAbertaManual,
        horarios: Object.entries(form.horariosSemana).map(([dia, data]) => ({
          dia_semana: Number(dia),
          abertura: data.abertura,
          fechamento: data.fechamento,
          aberto: data.aberto,
        })),
        bairros_atendidos: form.bairrosAtendidos.filter(b => b.nome.trim() !== '' && b.cidade.trim() !== ''),
      }

      await api.atualizarConfigAdmin(payload)

      // Recarrega as configurações
      await config.carregarConfigAdmin()
      
      setSalvando(false)
      setSalvo(true)
      addToast('Configurações salvas com sucesso!', 'success')
      setTimeout(() => setSalvo(false), 3000)
    } catch (e: any) {
      setSalvando(false)
      setSalvo(false)
      const apiErrors = e?.data || {}
      
      if (apiErrors && typeof apiErrors === 'object' && Object.keys(apiErrors).length > 0 && !apiErrors.detail) {
        addToast('Faltam informações obrigatórias. Verifique os campos em vermelho.', 'error')
        const frontendErrors: Record<string, string> = {}
        if (apiErrors.nome) frontendErrors.nomeEstabelecimento = apiErrors.nome[0]
        if (apiErrors.endereco) frontendErrors.enderecoLoja = apiErrors.endereco[0]
        if (apiErrors.whatsapp_contato) frontendErrors.whatsappContato = apiErrors.whatsapp_contato[0]
        if (apiErrors.pedido_minimo) frontendErrors.pedidoMinimo = apiErrors.pedido_minimo[0]
        if (apiErrors.chave_pix) frontendErrors.chavePix = apiErrors.chave_pix[0]
        if (apiErrors.nome_recebedor_pix) frontendErrors.nomeRecebedor = apiErrors.nome_recebedor_pix[0]
        
        if (apiErrors.detail) frontendErrors.geral = apiErrors.detail
        if (apiErrors.non_field_errors) frontendErrors.geral = apiErrors.non_field_errors[0]
        
        if (Object.keys(frontendErrors).length === 0) {
           frontendErrors.geral = 'Erro de validação no servidor.'
        }
        
        setErros(frontendErrors)
      } else {
        const msgErro = e?.data?.detail || e?.message || 'Ocorreu um erro ao salvar as configurações.'
        setErros({ geral: msgErro })
        addToast(msgErro, 'error')
      }
    }
  }

  return (
    <div
      className="animate-fade-in"
      style={{ padding: 'clamp(1.25rem, 4vw, 2.25rem)' }}
    >
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
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
          Configurações
        </h1>
        <p style={{ color: 'var(--text-secundario)', fontSize: '0.875rem', margin: 0 }}>
          As alterações refletem imediatamente no lado do cliente
        </p>
      </div>

      {carregando ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--primaria)' }} />
        </div>
      ) : (
        <div style={{ maxWidth: 720 }}>
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
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {erros.geral}
        </div>
      )}

      {/* Status atual geral */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1rem',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          background: aberto ? 'rgba(46,125,50,0.1)' : 'rgba(198,40,40,0.1)',
          border: `1px solid ${aberto ? 'rgba(46,125,50,0.3)' : 'rgba(198,40,40,0.3)'}`,
          fontSize: '0.85rem',
          fontWeight: 600,
          color: aberto ? '#2e7d32' : '#c62828',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: aberto ? '#4caf50' : '#f44336',
            display: 'inline-block',
            animation: aberto ? 'status-pulse 2s infinite' : 'none',
          }}
        />
        {aberto ? 'O estabelecimento está ABERTO para pedidos' : 'O estabelecimento está FECHADO no momento'}
      </div>

      {/* ── Status da Loja (Automático / Manual) ── */}
      <SecaoCard titulo="Controle de Abertura" icone={<Settings2 size={18} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ paddingRight: '1rem' }}>
              <span style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primario)', marginBottom: '0.25rem' }}>
                Modo Automático
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secundario)' }}>
                Abrir e fechar a loja automaticamente com base nos horários configurados.
              </span>
            </div>
            <button
              onClick={async () => {
                const novoModo = !form.modoAutomatico;
                try {
                  await api.atualizarConfigAdmin({ modo_automatico: novoModo })
                  setForm(f => ({ ...f, modoAutomatico: novoModo }));
                  config.atualizarConfig({ modoAutomatico: novoModo });
                  addToast(`Modo automático ${novoModo ? 'ativado' : 'desativado'}`, 'success')
                } catch (e) {
                  console.error(e)
                  addToast('Erro ao alterar modo automático', 'error')
                }
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: form.modoAutomatico ? 'var(--primaria)' : 'var(--text-terciario)',
                padding: 0
              }}
            >
              {form.modoAutomatico ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
            </button>
          </div>

          {!form.modoAutomatico && (
            <div style={{ borderTop: '1px solid var(--borda)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fade-in 0.3s ease' }}>
              <div style={{ paddingRight: '1rem' }}>
                <span style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primario)', marginBottom: '0.25rem' }}>
                  Controle Manual
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secundario)' }}>
                  Force a loja a ficar aberta ou fechada agora mesmo.
                </span>
              </div>
              <button
                onClick={async () => {
                  const novoEstado = !form.lojaAbertaManual;
                  try {
                    await api.atualizarConfigAdmin({ loja_aberta_manual: novoEstado })
                    setForm(f => ({ ...f, lojaAbertaManual: novoEstado }));
                    config.atualizarConfig({ lojaAbertaManual: novoEstado });
                    addToast(`Loja manualmente ${novoEstado ? 'aberta' : 'fechada'}`, 'success')
                  } catch (e) {
                    console.error(e)
                    addToast('Erro ao alterar status da loja', 'error')
                  }
                }}
                style={{
                  background: form.lojaAbertaManual ? '#2e7d32' : '#c62828',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {form.lojaAbertaManual ? 'Aberta (clique p/ fechar)' : 'Fechada (clique p/ abrir)'}
              </button>
            </div>
          )}

        </div>
      </SecaoCard>

      {/* ── Informações da Loja ── */}
      <SecaoCard titulo="Informações do Estabelecimento" icone={<Store size={18} />}>
        <Campo
          label="Nome do Estabelecimento"
          name="nome"
          value={form.nomeEstabelecimento}
          onChange={(v) => setForm((f) => ({ ...f, nomeEstabelecimento: v }))}
          placeholder="Padaria Bella"
          erro={erros.nomeEstabelecimento}
        />
        <Campo
          label="Endereço"
          name="endereco"
          value={form.enderecoLoja}
          onChange={(v) => setForm((f) => ({ ...f, enderecoLoja: v }))}
          placeholder="Rua dos Pinheiros, 987 — Centro"
          erro={erros.enderecoLoja}
        />
        <Campo
          label="WhatsApp de Contato"
          name="whatsapp"
          value={form.whatsappContato}
          onChange={(v) => setForm((f) => ({ ...f, whatsappContato: formatarWhatsApp(v) }))}
          placeholder="(11) 99999-9999"
          erro={erros.whatsappContato}
        />
      </SecaoCard>

      {/* ── Horário de Funcionamento ── */}
      <SecaoCard titulo="Horário de Funcionamento (Automático)" icone={<Clock size={18} />}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secundario)', marginBottom: '1.25rem' }}>
          Estes horários serão usados caso o Modo Automático esteja ativado.
        </p>
        
        {DIAS_SEMANA.map((diaNome, diaIndex) => {
          const configDia = form.horariosSemana[diaIndex]
          
          return (
            <div key={diaIndex} style={{ borderBottom: diaIndex < 6 ? '1px solid var(--borda)' : 'none', paddingBottom: diaIndex < 6 ? '1.25rem' : 0, marginBottom: diaIndex < 6 ? '1.25rem' : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primario)' }}>
                  {diaNome}
                </span>
                <button
                  onClick={() => setForm(f => ({
                    ...f,
                    horariosSemana: {
                      ...f.horariosSemana,
                      [diaIndex]: { ...f.horariosSemana[diaIndex], aberto: !f.horariosSemana[diaIndex].aberto }
                    }
                  }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: configDia?.aberto ? 'var(--primaria)' : 'var(--text-terciario)', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  {configDia?.aberto ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  {configDia?.aberto ? 'Aberto' : 'Fechado'}
                </button>
              </div>
              {configDia?.aberto && (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', animation: 'fade-in 0.3s ease' }}>
                  <CampoHorario
                    label="Abertura"
                    value={configDia.abertura}
                    onChange={(v) => setForm(f => ({ ...f, horariosSemana: { ...f.horariosSemana, [diaIndex]: { ...f.horariosSemana[diaIndex], abertura: v } } }))}
                  />
                  <CampoHorario
                    label="Fechamento"
                    value={configDia.fechamento}
                    onChange={(v) => setForm(f => ({ ...f, horariosSemana: { ...f.horariosSemana, [diaIndex]: { ...f.horariosSemana[diaIndex], fechamento: v } } }))}
                  />
                </div>
              )}
            </div>
          )
        })}
      </SecaoCard>

      {/* ── Delivery ── */}
      <SecaoCard titulo="Configurações de Delivery" icone={<Truck size={18} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <Campo
            label="Pedido Mínimo (R$)"
            name="pedidoMin"
            type="number"
            value={form.pedidoMinimo}
            onChange={(v) => setForm((f) => ({ ...f, pedidoMinimo: Number(v) }))}
            placeholder="15.00"
            erro={erros.pedidoMinimo}
          />
        </div>
      </SecaoCard>

      {/* ── Bairros Atendidos ── */}
      <SecaoCard titulo="Bairros Atendidos e Taxas de Entrega" icone={<MapPin size={18} />}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secundario)', marginBottom: '1.25rem' }}>
          Defina as cidades e bairros onde você realiza entregas e a taxa para cada um. 
          Pedidos para locais não cadastrados serão <strong>bloqueados</strong>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Array.from(new Set(form.bairrosAtendidos.map(b => b.cidade))).map((cidade, cityIndex, cidadesUnicas) => (
            <div key={cityIndex} style={{ border: '1px solid var(--borda)', borderRadius: '0.5rem', padding: '1rem', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primario)', fontSize: '0.95rem' }}>Cidade:</h4>
                <input
                  type="text"
                  value={cidade}
                  placeholder="Nome da cidade"
                  className="input-campo"
                  style={{ fontWeight: 'bold', maxWidth: '300px', background: 'white' }}
                  onChange={(e) => {
                    const novoNome = e.target.value;
                    const novos = form.bairrosAtendidos.map(b => 
                      b.cidade === cidade ? { ...b, cidade: novoNome } : b
                    );
                    setForm({ ...form, bairrosAtendidos: novos });
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {form.bairrosAtendidos.map((bairro, index) => {
                  if (bairro.cidade !== cidade) return null;
                  return (
                    <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{ flex: 2 }}>
                        <input
                          type="text"
                          placeholder="Nome do bairro"
                          className="input-campo"
                          style={{ background: 'white' }}
                          value={bairro.nome}
                          onChange={(e) => {
                            const novos = [...form.bairrosAtendidos];
                            novos[index].nome = e.target.value;
                            setForm({ ...form, bairrosAtendidos: novos });
                          }}
                        />
                      </div>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-terciario)', fontSize: '0.85rem' }}>R$</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          className="input-campo"
                          style={{ paddingLeft: '2rem', background: 'white' }}
                          value={bairro.taxa_entrega}
                          onChange={(e) => {
                            const novos = [...form.bairrosAtendidos];
                            novos[index].taxa_entrega = Number(e.target.value);
                            setForm({ ...form, bairrosAtendidos: novos });
                          }}
                        />
                      </div>
                      <button
                        title={bairro.ativo ? 'Desativar entregas neste bairro' : 'Ativar entregas neste bairro'}
                        onClick={() => {
                          const novos = [...form.bairrosAtendidos];
                          novos[index].ativo = !bairro.ativo;
                          setForm({ ...form, bairrosAtendidos: novos });
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: bairro.ativo ? 'var(--primaria)' : 'var(--text-terciario)', padding: '0.25rem' }}
                      >
                        {bairro.ativo ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      </button>
                      <button
                        title="Remover bairro"
                        onClick={() => {
                          const novos = [...form.bairrosAtendidos];
                          novos.splice(index, 1);
                          setForm({ ...form, bairrosAtendidos: novos });
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setForm({
                    ...form,
                    bairrosAtendidos: [
                      ...form.bairrosAtendidos,
                      { cidade: cidade, nome: '', taxa_entrega: 5.0, ativo: true }
                    ]
                  })
                }}
                className="btn-secundario"
                style={{ marginTop: '1rem', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                <Plus size={16} /> Adicionar Bairro nesta Cidade
              </button>
            </div>
          ))}
          
          {form.bairrosAtendidos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-terciario)', fontSize: '0.85rem' }}>Nenhum local cadastrado.</div>
          )}
        </div>

        <button
          onClick={() => {
            const cidadesAtuais = Array.from(new Set(form.bairrosAtendidos.map(b => b.cidade)));
            const nova = `Nova Cidade ${cidadesAtuais.length + 1}`;
            setForm({
              ...form,
              bairrosAtendidos: [
                ...form.bairrosAtendidos,
                { cidade: nova, nome: '', taxa_entrega: 5.0, ativo: true }
              ]
            })
          }}
          className="btn-primario"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', fontSize: '0.9rem', marginTop: '1.5rem', background: 'white', color: 'var(--primaria)', border: '1px dashed var(--primaria)' }}
        >
          <Plus size={16} /> Adicionar Nova Cidade
        </button>
      </SecaoCard>



      {/* Botão Salvar */}
      <button
        id="btn-salvar-config"
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
      )}
    </div>
  )
}
