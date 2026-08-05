'use client'

import React, { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Plus, Loader2, CheckCircle2, Trash2, Edit2, Search } from 'lucide-react'
import { SelectFiltro } from '@/components/admin/SelectFiltro'
import { useConfigStore } from '@/store/config-store'

interface Endereco {
  id: string
  rua: string
  numero: string
  bairro: string
  cidade?: string
  cep?: string
  complemento: string
  principal: boolean
}

interface SeletorEnderecoProps {
  onSelect: (endereco: Endereco | null) => void
}

export default function SeletorEndereco({ onSelect }: SeletorEnderecoProps) {
  const config = useConfigStore()
  const [enderecos, setEnderecos] = useState<Endereco[]>([])
  const [carregando, setCarregando] = useState(true)
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null)
  const [mostraForm, setMostraForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // Campos do formulário
  const [cep, setCep] = useState('')
  const [rua, setRua] = useState('')
  const [numero, setNumero] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [complemento, setComplemento] = useState('')
  const [principal, setPrincipal] = useState(false)

  useEffect(() => {
    carregarEnderecos()
  }, [])

  async function carregarEnderecos() {
    setCarregando(true)
    try {
      const data = await api.getEnderecosCliente()
      setEnderecos(data)
      const princ = data.find((e: Endereco) => e.principal) || data[0]
      if (princ) {
        setSelecionadoId(princ.id)
        onSelect(princ)
      } else {
        onSelect(null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCarregando(false)
    }
  }

  function handleSelect(endereco: Endereco) {
    setSelecionadoId(endereco.id)
    onSelect(endereco)
  }

  // ── Lista de cidades únicas ──
  const cidadesDisponiveis = Array.from(
    new Set(config.bairrosAtendidos.filter(b => b.ativo).map(b => b.cidade))
  ).filter(Boolean).sort()

  const bairrosDisponiveis = config.bairrosAtendidos
    .filter(b => b.ativo && b.cidade === cidade)
    .sort((a, b) => a.nome.localeCompare(b.nome))

  function limparForm() {
    setRua('')
    setNumero('')
    setBairro('')
    setCidade('')
    setComplemento('')
    setPrincipal(false)
    setErro('')
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!rua.trim() || !numero.trim() || !bairro.trim()) {
      setErro('Preencha os campos obrigatórios (rua, número, bairro).')
      return
    }
    setErro('')
    setSalvando(true)
    try {
      if (editandoId) {
        await api.atualizarEnderecoCliente(editandoId, { rua, numero, bairro, cidade, complemento, principal })
      } else {
        await api.criarEnderecoCliente({ rua, numero, bairro, cidade, complemento, principal })
      }
      limparForm()
      setMostraForm(false)
      setEditandoId(null)
      await carregarEnderecos()
    } catch (e: any) {
      setErro(e?.data?.detail || 'Erro ao salvar o endereço')
    } finally {
      setSalvando(false)
    }
  }

  function handleEditar(end: Endereco) {
    setEditandoId(end.id)
    setRua(end.rua)
    setNumero(end.numero)
    setBairro(end.bairro)
    setCidade(end.cidade || '')
    setComplemento(end.complemento || '')
    setPrincipal(end.principal)
    setErro('')
    setMostraForm(true)
  }

  async function handleExcluir(id: string) {
    setCarregando(true)
    try {
      await api.excluirEnderecoCliente(id)
      await carregarEnderecos()
    } catch (e) {
      console.error(e)
      setCarregando(false)
    }
  }

  if (carregando) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#b89470' }}>
        <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <style>{`
        .txt-padrao-desk { display: block; }
        .txt-padrao-mob { display: none; }
        @media (max-width: 600px) {
          .txt-padrao-desk { display: none; }
          .txt-padrao-mob { display: block; }
        }
      `}</style>

      {!mostraForm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {enderecos.length === 0 && (
            <p style={{ color: '#888597', fontSize: '0.9rem', margin: '0 0 0.5rem' }}>
              Nenhum endereço cadastrado.
            </p>
          )}
          {enderecos.map((end) => (
            <div
              key={end.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: '2px solid',
                borderColor: selecionadoId === end.id ? 'var(--primaria)' : '#e4e2ea',
                background: selecionadoId === end.id ? 'rgba(200, 134, 10, 0.04)' : 'white',
                transition: 'all 0.2s',
              }}
            >
              <div
                onClick={() => handleSelect(end)}
                style={{
                  color: selecionadoId === end.id ? 'var(--primaria)' : '#d4d2dc',
                  marginTop: '2px',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  background: selecionadoId === end.id ? 'rgba(200, 134, 10, 0.1)' : 'transparent',
                }}
                title="Selecionar este endereço"
              >
                {selecionadoId === end.id
                  ? <CheckCircle2 size={24} />
                  : <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #d4d2dc', margin: 2 }} />
                }
              </div>

              <div style={{ flex: 1, marginTop: '2px' }}>
                <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: '#1c1208', fontSize: '0.95rem' }}>
                  {end.rua}, {end.numero}
                </p>
                <p style={{ margin: 0, color: '#555260', fontSize: '0.85rem' }}>
                  {end.bairro}{end.complemento ? ` - ${end.complemento}` : ''}
                </p>
                {end.principal && (
                  <p className="txt-padrao-mob" style={{ margin: '0.25rem 0 0', color: '#888597', fontSize: '0.75rem' }}>
                    Definido como padrão
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleEditar(end) }}
                    style={{ background: 'transparent', border: 'none', color: '#888597', cursor: 'pointer', padding: '4px' }}
                    title="Editar endereço"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleExcluir(end.id) }}
                    style={{ background: 'transparent', border: 'none', color: '#c62828', cursor: 'pointer', padding: '4px' }}
                    title="Excluir endereço"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                {end.principal && (
                  <span className="txt-padrao-desk" style={{ color: '#888597', fontSize: '0.75rem', marginRight: '4px' }}>
                    Definido como padrão
                  </span>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              setEditandoId(null)
              limparForm()
              setMostraForm(true)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--primaria)',
              background: 'transparent',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              padding: '0.5rem 0',
              marginTop: '0.5rem',
            }}
          >
            <Plus size={18} /> {enderecos.length > 0 ? 'Adicionar outro endereço' : 'Adicionar Endereço'}
          </button>
        </div>
      )}

      {mostraForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          animation: 'fade-in 0.2s ease',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1c1208' }}>
                {editandoId ? 'Editar Endereço' : 'Novo Endereço'}
              </h3>
              <button
                type="button"
                onClick={() => setMostraForm(false)}
                style={{ background: 'none', border: 'none', color: '#888597', cursor: 'pointer', padding: '4px' }}
              >
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>&times;</span>
              </button>
            </div>

            {erro && (
              <div style={{ color: '#c62828', fontSize: '0.85rem', background: '#fef0f0', padding: '0.5rem', borderRadius: '4px' }}>
                {erro}
              </div>
            )}

            {/* ── Cidade ── */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#555260', marginBottom: '0.5rem' }}>
                Cidade *
              </label>
              <SelectFiltro
                value={cidade}
                onChange={(e) => {
                  setCidade(e.target.value)
                  setBairro('') // Limpa o bairro ao trocar de cidade
                }}
                className="input-campo"
                style={{ padding: 0, border: 'none', background: 'transparent' }}
              >
                <option value="">Selecione a cidade...</option>
                {cidadesDisponiveis.map(cid => (
                  <option key={cid} value={cid}>{cid}</option>
                ))}
              </SelectFiltro>
            </div>

            {/* ── Bairro ── */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#555260', marginBottom: '0.5rem' }}>
                Bairro *
              </label>
              <SelectFiltro
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="input-campo"
                style={{ padding: 0, border: 'none', background: 'transparent' }}
                disabled={!cidade}
              >
                <option value="">{cidade ? 'Selecione o bairro...' : 'Selecione a cidade...'}</option>
                {bairrosDisponiveis.map(b => (
                  <option key={b.id || b.nome} value={b.nome}>
                    {b.nome} {Number(b.taxa_entrega) === 0 ? '(Frete Grátis)' : `(+ R$ ${Number(b.taxa_entrega).toFixed(2).replace('.', ',')})`}
                  </option>
                ))}
              </SelectFiltro>
            </div>

            {/* ── Rua ── */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#555260', marginBottom: '0.5rem' }}>
                Rua / Avenida *
              </label>
              <input
                type="text"
                value={rua}
                onChange={(e) => setRua(e.target.value)}
                placeholder="Ex: Rua das Flores"
                className="input-campo"
                style={{ background: 'white' }}
              />
            </div>

            {/* ── Número e Complemento ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#555260', marginBottom: '0.5rem' }}>
                  Número *
                </label>
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="123"
                  className="input-campo"
                  style={{ background: 'white' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#555260', marginBottom: '0.5rem' }}>
                  Complemento
                </label>
                <input
                  type="text"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  placeholder="Apto 42, Bloco B..."
                  className="input-campo"
                  style={{ background: 'white' }}
                />
              </div>
            </div>

            {/* ── Principal ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                type="checkbox"
                id="check-principal"
                checked={principal}
                onChange={(e) => setPrincipal(e.target.checked)}
                style={{ width: '1rem', height: '1rem', accentColor: 'var(--primaria)', cursor: 'pointer' }}
              />
              <label htmlFor="check-principal" style={{ fontSize: '0.85rem', color: '#1c1208', cursor: 'pointer' }}>
                Definir como endereço padrão
              </label>
            </div>

            <button
              type="button"
              onClick={handleSalvar}
              disabled={salvando}
              className="btn-primario"
              style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}
            >
              {salvando
                ? <Loader2 size={20} className="animate-spin" />
                : editandoId ? <CheckCircle2 size={20} /> : <Plus size={20} />
              }
              {editandoId ? 'Salvar Alterações' : 'Salvar Endereço'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
