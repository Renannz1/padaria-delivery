'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { useCardapioStore } from '@/store/cardapio-store'
import { useToastStore } from '@/store/toast-store'
import { Produto } from '@/types'
import {
  Plus,
  Pencil,
  Trash2,
  PackageX,
  Package,
  X,
  Save,
  ImageOff,
  Loader2,
  Upload,
  Search,
  Filter,
} from 'lucide-react'
import { formatarMoeda } from '@/lib/utils'
import { SelectFiltro } from '@/components/admin/SelectFiltro'

const produtoVazio = {
  nome: '',
  descricao: '',
  preco: 0,
  categoriaId: '',
  imagem: '',
  imagemFile: undefined as File | null | undefined,
  destaque: false,
  esgotado: false,
}

function ModalProduto({
  inicial,
  categoriasOpcoes,
  onSalvar,
  onFechar,
}: {
  inicial?: Partial<Produto>
  categoriasOpcoes: { id: string; nome: string }[]
  onSalvar: (p: any) => void
  onFechar: () => void
}) {
  const [form, setForm] = useState({ ...produtoVazio, ...inicial })
  const [erros, setErros] = useState<Record<string, string>>({})

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
        background: 'rgba(28,18,8,0.65)',
        animation: 'fade-in 0.2s ease',
      }}
      onClick={onFechar}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '1.25rem',
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'modal-content-show 0.25s ease',
          border: '1px solid var(--borda)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--borda)',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primario)' }}>
            {inicial?.id ? 'Editar Produto' : 'Novo Produto'}
          </h3>
          <button
            onClick={onFechar}
            className="btn-fechar-hover"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-terciario)',
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

        {/* Form */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Preview imagem */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '0.75rem',
                border: '1px solid var(--borda)',
                overflow: 'hidden',
                flexShrink: 0,
                background: '#f7f7f8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {form.imagemFile ? (
                <img
                  src={URL.createObjectURL(form.imagemFile)}
                  alt="preview local"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : form.imagem ? (
                <img
                  src={form.imagem}
                  alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                />
              ) : (
                <ImageOff size={24} color="var(--text-terciario)" />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secundario)', marginBottom: '0.375rem' }}>
                Foto do Produto
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: 'var(--bg-principal)',
                  border: '1px solid var(--borda)',
                  borderRadius: '0.5rem',
                  padding: '0.6rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-primario)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  width: 'fit-content'
                }}
              >
                <Upload size={16} color="var(--text-secundario)" />
                Escolher imagem
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setForm((f) => ({ ...f, imagemFile: file }))
                    }
                  }}
                />
              </label>
              
              {form.imagemFile && (
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secundario)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                  Arquivo: {form.imagemFile.name}
                </span>
              )}
              {form.imagem && !form.imagemFile && (
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, imagem: '', imagemFile: null }))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-vermelho-erro)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    marginTop: '0.3rem',
                    padding: 0,
                    fontWeight: 600,
                  }}
                >
                  Remover Foto Atual
                </button>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secundario)', marginBottom: '0.375rem' }}>
              Nome do Produto *
            </label>
            <input
              className={`input-campo ${erros.nome ? 'erro' : ''}`}
              value={form.nome}
              onChange={(e) => {
                setForm((f) => ({ ...f, nome: e.target.value }))
                if (erros.nome) setErros((prev) => ({ ...prev, nome: '' }))
              }}
              placeholder="Ex: Pão Francês"
              style={erros.nome ? { borderColor: 'var(--color-vermelho-erro)' } : {}}
            />
            {erros.nome && <span style={{ color: 'var(--color-vermelho-erro)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{erros.nome}</span>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secundario)', marginBottom: '0.375rem' }}>
              Descrição
            </label>
            <textarea
              className="input-campo"
              value={form.descricao || ''}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              placeholder="Descreva o produto..."
              rows={2}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secundario)', marginBottom: '0.375rem' }}>
                Preço (R$) *
              </label>
              <input
                className={`input-campo ${erros.preco ? 'erro' : ''}`}
                type="number"
                step="0.01"
                min="0"
                value={form.preco}
                onChange={(e) => {
                  setForm((f) => ({ ...f, preco: Number(e.target.value) }))
                  if (erros.preco) setErros((prev) => ({ ...prev, preco: '' }))
                }}
                style={erros.preco ? { borderColor: 'var(--color-vermelho-erro)' } : {}}
              />
              {erros.preco && <span style={{ color: 'var(--color-vermelho-erro)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{erros.preco}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secundario)', marginBottom: '0.375rem' }}>
                Categoria *
              </label>
              <SelectFiltro
                className={`input-campo ${erros.categoriaId ? 'erro' : ''}`}
                value={form.categoriaId}
                onChange={(e) => {
                  setForm((f) => ({ ...f, categoriaId: e.target.value }))
                  if (erros.categoriaId) setErros((prev) => ({ ...prev, categoriaId: '' }))
                }}
                style={{ padding: 0, border: 'none', background: 'transparent', ...(erros.categoriaId ? { border: '1px solid var(--color-vermelho-erro)', borderRadius: '0.75rem' } : {}) }}
              >
                <option value="">Selecione...</option>
                {categoriasOpcoes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </SelectFiltro>
              {erros.categoriaId && <span style={{ color: 'var(--color-vermelho-erro)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{erros.categoriaId}</span>}
            </div>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-primario)',
            }}
          >
            <input
              type="checkbox"
              checked={form.destaque}
              onChange={(e) => setForm((f) => ({ ...f, destaque: e.target.checked }))}
              style={{ width: 16, height: 16, accentColor: 'var(--primaria)' }}
            />
            Marcar como destaque
          </label>

          <button
            id="btn-salvar-produto"
            onClick={() => {
              const novosErros: Record<string, string> = {}
              if (!form.nome) novosErros.nome = 'Digite o nome do produto.'
              if (form.preco <= 0) novosErros.preco = 'O preço deve ser maior que zero.'
              if (!form.categoriaId) novosErros.categoriaId = 'Selecione uma categoria.'
              
              if (Object.keys(novosErros).length > 0) {
                setErros(novosErros)
                return
              }
              
              setErros({})
              onSalvar(form)
              onFechar()
            }}
            className="btn-primario"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <Save size={18} /> Salvar Produto
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalConfirmacaoExclusao({
  onConfirmar,
  onCancelar,
}: {
  onConfirmar: () => void
  onCancelar: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(28,18,8,0.6)',
        animation: 'modal-backdrop-fade 0.2s ease',
      }}
      onClick={onCancelar}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '1.25rem',
          width: '100%',
          maxWidth: 400,
          border: '1px solid var(--borda)',
          animation: 'modal-content-show 0.25s ease',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--borda)',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primario)' }}>
            Confirmar Exclusão
          </h3>
          <button
            onClick={onCancelar}
            className="btn-fechar-hover"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-terciario)',
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
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, color: 'var(--text-secundario)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              onClick={onCancelar}
              className="btn-secundario"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              className="btn-primario"
              style={{ flex: 1, background: '#c62828', color: 'white' }}
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CardapioPage() {
  const { categorias, carregarCardapio, carregando: storeCarregando } = useCardapioStore()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregandoProdutos, setCarregandoProdutos] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const addToast = useToastStore((s) => s.addToast)

  // Filtros
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [filtroEsgotado, setFiltroEsgotado] = useState<string>('todos')

  const categoriasOpcoes = categorias.map((c) => ({ id: c.id, nome: c.nome }))

  const carregarProdutos = useCallback(async () => {
    try {
      const data = await api.getProdutosAdmin()
      setProdutos(data)
    } catch (e) {
      console.error('Erro ao carregar produtos:', e)
    } finally {
      setCarregandoProdutos(false)
    }
  }, [])

  useEffect(() => {
    // Garante que as categorias também estão carregadas
    if (categorias.length === 0 && !storeCarregando) {
      carregarCardapio()
    }
    carregarProdutos()
  }, [carregarProdutos, carregarCardapio])

  function abrirNovoProduto() {
    setProdutoEditando(null)
    setModalAberto(true)
  }

  function abrirEditarProduto(p: Produto) {
    setProdutoEditando(p)
    setModalAberto(true)
  }

  async function salvarProduto(dados: any) {
    if (produtoEditando) {
      try {
        const atualizado = await api.editarProduto(produtoEditando.id, dados)
        // Sincroniza apenas com a resposta oficial
        setProdutos((prev) => prev.map((p) => (p.id === atualizado.id ? atualizado : p)))
        addToast('Produto atualizado com sucesso!', 'success')
      } catch (e: any) {
        console.error('Erro ao editar produto:', e)
        addToast(e?.data?.detail || 'Erro ao editar produto.', 'error')
      }
    } else {
      try {
        const novo = await api.criarProduto(dados)
        // Adiciona apenas o oficial
        setProdutos((prev) => [novo, ...prev])
        addToast('Produto criado com sucesso!', 'success')
      } catch (e: any) {
        console.error('Erro ao criar produto:', e)
        addToast(e?.data?.detail || 'Erro ao criar produto.', 'error')
      }
    }
    setModalAberto(false)
    setProdutoEditando(null)
  }

  async function handleToggleEsgotado(id: string) {
    try {
      await api.toggleEsgotadoAdmin(id)
      setProdutos((prev) => prev.map((p) => (p.id === id ? { ...p, esgotado: !p.esgotado } : p)))
      addToast('Status de disponibilidade atualizado.', 'success')
    } catch (e: any) {
      console.error('Erro ao atualizar status do produto:', e)
      addToast(e?.data?.detail || 'Erro ao atualizar produto.', 'error')
    }
  }

  async function handleRemoverProduto(id: string) {
    try {
      await api.deletarProduto(id)
      setProdutos((prev) => prev.filter((p) => p.id !== id))
      addToast('Produto removido com sucesso!', 'success')
    } catch (e: any) {
      console.error('Erro ao remover produto:', e)
      addToast(e?.data?.detail || 'Erro ao remover produto.', 'error')
    }
  }

  const isCarregando = carregandoProdutos || storeCarregando

  return (
    <div className="animate-fade-in" style={{ padding: 'clamp(1.25rem, 4vw, 2.25rem)' }}>
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
            Cardápio
          </h1>
          <p style={{ color: 'var(--text-secundario)', fontSize: '0.875rem', margin: 0, minHeight: '1.25rem' }}>
            {isCarregando ? '\u00A0' : `${produtos.length} produtos · ${produtos.filter((p) => p.esgotado).length} esgotados`}
          </p>
        </div>
      </div>

      {/* Filtros */}
      {!isCarregando && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-terciario)' }}
            />
            <input
              type="text"
              placeholder="Buscar por nome do produto..."
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
          <SelectFiltro
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            style={{ flex: '1 1 200px' }}
          >
            <option value="todas">Todas as categorias</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </SelectFiltro>
          <SelectFiltro
            value={filtroEsgotado}
            onChange={(e) => setFiltroEsgotado(e.target.value)}
            style={{ flex: '1 1 200px' }}
          >
            <option value="todos">Todos os status</option>
            <option value="disponiveis">Apenas Disponíveis</option>
            <option value="esgotados">Apenas Esgotados</option>
          </SelectFiltro>
          <button
            id="btn-novo-produto"
            onClick={abrirNovoProduto}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--primaria)', color: 'white',
              padding: '0 1.25rem', borderRadius: '8px',
              border: 'none', cursor: 'pointer', fontWeight: 600,
              transition: 'background 0.2s', fontSize: '0.9rem',
              minHeight: 44, marginLeft: 'auto'
            }}
          >
            <Plus size={18} /> Novo Produto
          </button>
        </div>
      )}

      {isCarregando ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--primaria)' }} />
        </div>
      ) : (
        <>
          {/* Agrupado por categoria */}
          {(() => {
            let temProdutoExibido = false
            const grupos = categorias
              .filter((c) => filtroCategoria === 'todas' || c.id === filtroCategoria)
              .map((categoria, catIdx) => {
              const prodsCat = produtos.filter((p) => {
                if (p.categoriaId !== categoria.id) return false
                if (filtroEsgotado === 'esgotados' && !p.esgotado) return false
                if (filtroEsgotado === 'disponiveis' && p.esgotado) return false
                if (busca && !p.nome.toLowerCase().includes(busca.toLowerCase())) return false
                return true
              })
              if (!prodsCat.length) return null

              temProdutoExibido = true

              return (
              <div
                key={categoria.id}
                style={{
                  marginBottom: '2rem',
                  animation: `fade-in 0.35s ease ${catIdx * 0.06}s both`,
                }}
              >
                <h2
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--text-terciario)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 0.75rem',
                  }}
                >
                  {categoria.nome}
                </h2>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  {prodsCat.map((produto) => (
                    <div
                      key={produto.id}
                      style={{
                        background: 'var(--bg-card)',
                        borderRadius: '1.125rem',
                        border: '1px solid var(--borda)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.875rem',
                        padding: '0.875rem 1rem',
                        opacity: produto.esgotado ? 0.55 : 1,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      {/* Imagem */}
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: '0.625rem',
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: '#f0e4d0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {produto.imagem ? (
                          <img
                            src={produto.imagem}
                            alt={produto.nome}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <ImageOff size={20} color="#b89470" />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              color: 'var(--text-primario)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {produto.nome}
                          </p>
                          {produto.destaque && (
                            <span style={{ fontSize: '0.7rem' }}>⭐</span>
                          )}
                        </div>
                        <p
                          style={{
                            margin: '0.125rem 0 0',
                            fontSize: '0.775rem',
                            color: 'var(--text-terciario)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {produto.descricao}
                        </p>
                      </div>

                      {/* Preço */}
                      <span
                        style={{
                          fontWeight: 700,
                          color: 'var(--primaria)',
                          fontSize: '0.95rem',
                          flexShrink: 0,
                        }}
                      >
                        {formatarMoeda(produto.preco)}
                      </span>

                      {/* Ações */}
                      <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                        {/* Toggle esgotado */}
                        <button
                          onClick={() => handleToggleEsgotado(produto.id)}
                          title={produto.esgotado ? 'Marcar disponível' : 'Marcar esgotado'}
                          style={{
                            background: produto.esgotado ? '#fff4e5' : '#f0f9f0',
                            border: `1px solid ${produto.esgotado ? '#f0d0a0' : '#b8ddb8'}`,
                            borderRadius: '0.5rem',
                            width: 34,
                            height: 34,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: produto.esgotado ? '#c05e00' : '#2e7d32',
                            transition: 'all 0.2s',
                          }}
                        >
                          {produto.esgotado ? <PackageX size={16} /> : <Package size={16} />}
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => abrirEditarProduto(produto)}
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
                          <Pencil size={15} />
                        </button>

                        {/* Remover */}
                        <button
                          onClick={() => setConfirmDelete(produto.id)}
                          title="Remover"
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
                    </div>
                  ))}
                </div>
              </div>
            )
          })

          if (!temProdutoExibido) {
            return (
              <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-terciario)', background: 'var(--bg-card)', borderRadius: '1.25rem', border: '1px solid var(--borda)', animation: 'fade-in 0.4s ease' }}>
                <PackageX size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primario)' }}>Nenhum produto encontrado</p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
                  {busca 
                    ? `Não encontramos nenhum produto com a busca "${busca}". Tente ajustar os filtros.` 
                    : 'Tente ajustar ou limpar os filtros para ver resultados.'}
                </p>
              </div>
            )
          }

          return grupos
        })()}
        </>
      )}

      {/* Modal novo/editar */}
      {modalAberto && (
        <ModalProduto
          inicial={produtoEditando ?? undefined}
          categoriasOpcoes={categoriasOpcoes}
          onSalvar={salvarProduto}
          onFechar={() => {
            setModalAberto(false)
            setProdutoEditando(null)
          }}
        />
      )}

      {/* Modal excluir */}
      {confirmDelete && (
        <ModalConfirmacaoExclusao
          onConfirmar={() => {
            handleRemoverProduto(confirmDelete)
            setConfirmDelete(null)
          }}
          onCancelar={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
