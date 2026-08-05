'use client'

import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Search, Megaphone, X, Upload, Save, Loader2 } from 'lucide-react'
import { useToastStore } from '@/store/toast-store'
import Image from 'next/image'

interface Patrocinador {
  id: string
  nome_empresa: string
  imagem_banner: string
  imagem_quadrada: string | null
  link_destino: string | null
  ativo: boolean
  criado_em: string
}

export default function PatrocinadoresPage() {
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [patrocinadorEditando, setPatrocinadorEditando] = useState<Patrocinador | null>(null)
  
  // Form fields
  const [nome, setNome] = useState('')
  const [link, setLink] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [imagem, setImagem] = useState<File | null>(null)
  const [imagemQuadrada, setImagemQuadrada] = useState<File | null>(null)
  const [removerBanner, setRemoverBanner] = useState(false)
  const [removerQuadrada, setRemoverQuadrada] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInputQuadradaRef = useRef<HTMLInputElement>(null)
  const { addToast } = useToastStore()

  const carregarDados = async () => {
    try {
      setCarregando(true)
      const data = await api.getPatrocinadoresAdmin()
      setPatrocinadores(data)
    } catch (e) {
      addToast('Erro ao carregar patrocinadores', 'error')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const patrocinadoresExibidos = patrocinadores.filter(p => 
    p.nome_empresa.toLowerCase().includes(busca.toLowerCase())
  )

  const abrirModalNovo = () => {
    setPatrocinadorEditando(null)
    setNome('')
    setLink('')
    setAtivo(true)
    setImagem(null)
    setImagemQuadrada(null)
    setRemoverBanner(false)
    setRemoverQuadrada(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (fileInputQuadradaRef.current) fileInputQuadradaRef.current.value = ''
    setModalAberto(true)
  }

  const abrirModalEditar = (p: Patrocinador) => {
    setPatrocinadorEditando(p)
    setNome(p.nome_empresa)
    setLink(p.link_destino || '')
    setAtivo(p.ativo ?? false) // Corrigindo para evitar undefined e React warning
    setImagem(null)
    setImagemQuadrada(null)
    setRemoverBanner(false)
    setRemoverQuadrada(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (fileInputQuadradaRef.current) fileInputQuadradaRef.current.value = ''
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
  }

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nome.trim()) {
      addToast('Preencha o nome da empresa', 'error')
      return
    }

    if (!patrocinadorEditando && !imagem && !imagemQuadrada) {
      addToast('Selecione pelo menos uma imagem (Quadrada ou Horizontal)', 'error')
      return
    }

    try {
      setSalvando(true)
      const formData = new FormData()
      formData.append('nome_empresa', nome)
      formData.append('link_destino', link)
      formData.append('ativo', ativo ? 'true' : 'false')
      if (imagem) {
        formData.append('imagem_banner', imagem)
      } else if (removerBanner) {
        formData.append('imagem_banner', '')
      }
      
      if (imagemQuadrada) {
        formData.append('imagem_quadrada', imagemQuadrada)
      } else if (removerQuadrada) {
        formData.append('imagem_quadrada', '')
      }

      if (patrocinadorEditando) {
        await api.atualizarPatrocinador(patrocinadorEditando.id, formData)
        addToast('Patrocinador atualizado!', 'success')
      } else {
        await api.criarPatrocinador(formData)
        addToast('Patrocinador criado!', 'success')
      }

      fecharModal()
      carregarDados()
    } catch (err: any) {
      console.error(err)
      const msgErro = err?.detail || JSON.stringify(err)
      addToast(`Erro: ${msgErro}`, 'error')
    } finally {
      setSalvando(false)
    }
  }

  const handleExcluir = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este patrocinador?')) return
    try {
      await api.excluirPatrocinador(id)
      addToast('Patrocinador excluído', 'success')
      carregarDados()
    } catch (e) {
      addToast('Erro ao excluir', 'error')
    }
  }

  const handleToggleAtivo = async (p: any) => {
    try {
      const formData = new FormData()
      formData.append('ativo', p.ativo ? 'false' : 'true')
      
      // Atualização otimista
      setPatrocinadores(prev => prev.map(item => item.id === p.id ? { ...item, ativo: !item.ativo } : item))
      
      await api.atualizarPatrocinador(p.id, formData)
      addToast(`Patrocinador ${p.ativo ? 'desativado' : 'ativado'} com sucesso`, 'success')
    } catch (e) {
      addToast('Erro ao alterar status', 'error')
      carregarDados() // Reverte caso dê erro
    }
  }

  return (
    <div className="animate-fade-in" style={{ padding: 'clamp(1.25rem, 4vw, 2.25rem)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
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
            Configurações
          </p>
          <h1
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              fontWeight: 700,
              color: 'var(--text-primario)',
              margin: '0 0 0.375rem',
            }}
          >
            Patrocinadores
          </h1>
          <p style={{ color: 'var(--text-secundario)', margin: 0, fontSize: '0.9rem' }}>
            Gerencie os anúncios e parceiros exibidos na loja.
          </p>
        </div>

      </div>

      {/* Filtros */}
      {!carregando && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-terciario)' }} />
            <input
              type="text"
              placeholder="Buscar patrocinador..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{
                width: '100%',
                padding: '0 1rem 0 2.75rem',
                minHeight: '44px',
                borderRadius: '0.75rem',
                border: '1px solid var(--borda)',
                backgroundColor: 'var(--bg-card)',
                fontSize: '0.9rem',
                color: 'var(--text-primario)',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200, 134, 10, 0.08)'}
              onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
            />
          </div>

          <button
            onClick={abrirModalNovo}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--primaria)', color: 'white',
              padding: '0 1.25rem', borderRadius: '8px',
              border: 'none', cursor: 'pointer', fontWeight: 600,
              transition: 'background 0.2s', fontSize: '0.9rem',
              minHeight: 44, marginLeft: 'auto'
            }}
          >
            <Plus size={18} /> Novo Patrocinador
          </button>
        </div>
      )}

      {carregando ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--primaria)' }} />
        </div>
      ) : (
        <div 
          style={{ 
            background: 'var(--bg-card)', 
            borderRadius: '1.25rem', 
            border: '1px solid var(--borda)', 
            overflow: 'hidden',
            animation: 'fade-in 0.4s ease 0.2s both'
          }}
        >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#faf6f0', borderBottom: '1px solid var(--borda)' }}>
                <th style={{ width: '100px', whiteSpace: 'nowrap', padding: '1rem 1.25rem', color: 'var(--text-secundario)', fontWeight: 600, fontSize: '0.85rem' }}>Imagem 1:1</th>
                <th style={{ width: '200px', whiteSpace: 'nowrap', padding: '1rem 1.25rem', color: 'var(--text-secundario)', fontWeight: 600, fontSize: '0.85rem' }}>Imagem 3:1</th>
                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-secundario)', fontWeight: 600, fontSize: '0.85rem' }}>Empresa</th>
                <th style={{ width: '120px', padding: '1rem 1.25rem', color: 'var(--text-secundario)', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                <th style={{ width: '100px', padding: '1rem 1.25rem', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {patrocinadoresExibidos.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-terciario)' }}>
                    <Megaphone size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primario)' }}>Nenhum patrocinador encontrado.</p>
                  </td>
                </tr>
              ) : (
                patrocinadoresExibidos.map((p) => (
                  <tr 
                    key={p.id} 
                    style={{ borderBottom: '1px solid var(--borda)', transition: 'background 0.2s' }} 
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fcf9f2'} 
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                      {p.imagem_quadrada ? (
                        <div style={{ width: '60px', height: '60px', position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--borda)' }}>
                          <Image src={p.imagem_quadrada} alt={p.nome_empresa} fill style={{ objectFit: 'cover' }} unoptimized />
                        </div>
                      ) : (
                        <div style={{ width: '60px', height: '60px', borderRadius: '6px', border: '1px dashed var(--borda)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-terciario)', fontSize: '0.7rem' }}>
                          Vazio
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                      {p.imagem_banner ? (
                        <div style={{ width: '180px', height: '60px', position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--borda)' }}>
                          <Image src={p.imagem_banner} alt={p.nome_empresa} fill style={{ objectFit: 'cover' }} unoptimized />
                        </div>
                      ) : (
                        <div style={{ width: '180px', height: '60px', borderRadius: '6px', border: '1px dashed var(--borda)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-terciario)', fontSize: '0.7rem' }}>
                          Vazio
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primario)', marginBottom: '0.25rem' }}>{p.nome_empresa}</div>
                      {p.link_destino && (
                        <a href={p.link_destino} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none' }}>
                          {p.link_destino}
                        </a>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                      <button 
                        onClick={() => handleToggleAtivo(p)}
                        style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '0.375rem', 
                          padding: '0.375rem 0.625rem', 
                          background: p.ativo ? '#d1fae5' : '#fee2e2', 
                          color: p.ativo ? '#065f46' : '#991b1b', 
                          borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                          border: 'none', cursor: 'pointer',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        title={p.ativo ? 'Clique para desativar' : 'Clique para ativar'}
                      >
                        {p.ativo ? <CheckCircle size={14} /> : <XCircle size={14} />} 
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', verticalAlign: 'middle' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <button 
                          onClick={() => abrirModalEditar(p)} 
                          title="Editar"
                          style={{
                            background: '#f0f0f8',
                            border: '1px solid #e0e0ee',
                            borderRadius: '0.5rem',
                            width: 34,
                            height: 34,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#555260',
                            transition: 'all 0.2s',
                          }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button 
                          onClick={() => handleExcluir(p.id)} 
                          title="Excluir"
                          style={{
                            background: '#fef0f0',
                            border: '1px solid #f8d0d0',
                            borderRadius: '0.5rem',
                            width: 34,
                            height: 34,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#c62828',
                            transition: 'all 0.2s',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {modalAberto && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', 
          alignItems: 'center', justifyContent: 'center', padding: '1rem',
          background: 'rgba(28,18,8,0.65)', animation: 'fade-in 0.2s ease'
        }} onClick={fecharModal}>
          <div 
            style={{ 
              background: 'white', borderRadius: '1.25rem', width: '100%', 
              maxWidth: '520px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
              animation: 'modal-content-show 0.25s ease', border: '1px solid var(--borda)'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--borda)', flexShrink: 0, background: 'white', zIndex: 10 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primario)' }}>
                {patrocinadorEditando ? 'Editar Patrocinador' : 'Novo Patrocinador'}
              </h3>
              <button onClick={fecharModal} className="btn-fechar-hover" type="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-terciario)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secundario)' }}>Nome da Empresa *</label>
                <input 
                  type="text" 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                  required
                  className="input-campo"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secundario)' }}>Link de Destino (opcional)</label>
                <input 
                  type="url" 
                  value={link} 
                  onChange={(e) => setLink(e.target.value)} 
                  placeholder="https://..."
                  className="input-campo"
                />
              </div>
              
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secundario)', marginBottom: '1.5rem', lineHeight: 1.4 }}>
                <strong>Dica:</strong> Para melhor apresentação, suba duas imagens. A imagem quadrada será usada no acompanhamento do pedido (formato compacto). A imagem horizontal será usada como banner no final do cardápio.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {/* Imagem Quadrada */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secundario)' }}>
                    Imagem Quadrada (1:1)
                  </label>
                  
                  {(() => {
                    const temImagemFile = !!imagemQuadrada
                    const temImagemSalva = patrocinadorEditando && patrocinadorEditando.imagem_quadrada && !removerQuadrada
                    
                    if (temImagemFile || temImagemSalva) {
                      return (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--borda)', width: '80px', height: '80px', position: 'relative', marginBottom: '0.25rem' }}>
                            <Image 
                              src={temImagemFile ? URL.createObjectURL(imagemQuadrada) : patrocinadorEditando!.imagem_quadrada!} 
                              alt="Preview quadrada" 
                              fill 
                              style={{ objectFit: 'cover' }} 
                              unoptimized 
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setImagemQuadrada(null)
                              setRemoverQuadrada(true)
                              if (fileInputQuadradaRef.current) fileInputQuadradaRef.current.value = ''
                            }}
                            style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            Remover Imagem
                          </button>
                        </div>
                      )
                    }

                    return (
                      <div style={{ marginBottom: '0.75rem', borderRadius: '6px', border: '2px dashed var(--borda)', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secundario)', fontSize: '0.7rem', textAlign: 'center', padding: '0.5rem', background: '#fafafa' }}>
                        Sem<br/>Imagem
                      </div>
                    )
                  })()}
                  
                  <button 
                    type="button"
                    onClick={() => fileInputQuadradaRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem', border: '1px solid var(--borda)', borderRadius: '0.5rem', background: 'var(--bg-principal)', color: 'var(--text-primario)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-principal)'}
                  >
                    <Upload size={16} color="var(--text-secundario)" />
                    Escolher imagem
                  </button>
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputQuadradaRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setImagemQuadrada(e.target.files[0])
                        setRemoverQuadrada(false)
                      }
                    }}
                    style={{ display: 'none' }} 
                  />
                </div>

                {/* Imagem Banner */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secundario)' }}>
                    Imagem Horizontal (3:1)
                  </label>
                  
                  {(() => {
                    const temImagemFile = !!imagem
                    const temImagemSalva = patrocinadorEditando && patrocinadorEditando.imagem_banner && !removerBanner
                    
                    if (temImagemFile || temImagemSalva) {
                      return (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--borda)', width: '100%', height: '80px', position: 'relative', marginBottom: '0.25rem' }}>
                            <Image 
                              src={temImagemFile ? URL.createObjectURL(imagem) : patrocinadorEditando!.imagem_banner} 
                              alt="Preview do banner" 
                              fill 
                              style={{ objectFit: 'cover' }} 
                              unoptimized 
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setImagem(null)
                              setRemoverBanner(true)
                              if (fileInputRef.current) fileInputRef.current.value = ''
                            }}
                            style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            Remover Imagem
                          </button>
                        </div>
                      )
                    }

                    return (
                      <div style={{ marginBottom: '0.75rem', borderRadius: '6px', border: '2px dashed var(--borda)', width: '100%', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secundario)', fontSize: '0.7rem', textAlign: 'center', padding: '0.5rem', background: '#fafafa' }}>
                        Sem Imagem
                      </div>
                    )
                  })()}
                  
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem', border: '1px solid var(--borda)', borderRadius: '0.5rem', background: 'var(--bg-principal)', color: 'var(--text-primario)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-principal)'}
                  >
                    <Upload size={16} color="var(--text-secundario)" />
                    Escolher imagem
                  </button>
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setImagem(e.target.files[0])
                        setRemoverBanner(false)
                      }
                    }}
                    style={{ display: 'none' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="ativo" 
                  checked={ativo} 
                  onChange={(e) => setAtivo(e.target.checked)} 
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primaria)' }}
                />
                <label htmlFor="ativo" style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--text-primario)' }}>Banner Ativo</label>
              </div>

              <button 
                type="submit" 
                disabled={salvando}
                className="btn-primario"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <Save size={18} /> {salvando ? 'Salvando...' : 'Salvar Patrocinador'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
