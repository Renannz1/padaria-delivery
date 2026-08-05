'use client'

import { useState, useMemo, useEffect } from 'react'
import ProdutoCard from '@/components/cliente/ProdutoCard'
import PatrocinadorCard from '@/components/cliente/PatrocinadorCard'
import CartContent from '@/components/cliente/CartContent'
import { Truck, Store, Clock, MapPin, Search, Frown, X, Sparkles, Info, Loader2 } from 'lucide-react'
import { formatarMoeda } from '@/lib/utils'
import { useConfigStore } from '@/store/config-store'
import { useCardapioStore } from '@/store/cardapio-store'
import { SelectFiltro } from '@/components/admin/SelectFiltro'
import Footer from '@/components/cliente/Footer'
import { api } from '@/lib/api'

export default function VitrinePage() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [mounted, setMounted] = useState(false)
  const [patrocinadores, setPatrocinadores] = useState<any[]>([])

  // Stores
  const config = useConfigStore()
  const { produtos, categorias, carregando } = useCardapioStore()

  // Aguarda hidratação antes de calcular estado dinâmico (evita hydration mismatch)
  useEffect(() => {
    setMounted(true)
    
    // Sempre recarrega o cardápio ao voltar para a vitrine para garantir dados frescos
    useCardapioStore.getState().carregarCardapio()

    api.getPatrocinadores().then(res => {
      // Filtrar apenas patrocinadores que tenham imagem de banner e embaralhar
      const comBanner = res.filter((p: any) => p.imagem_banner)
      setPatrocinadores(comBanner.sort(() => Math.random() - 0.5))
    }).catch(console.error)
  }, [])

  // Só calcula aberto após montar no cliente — servidor sempre render neutro
  const aberto = mounted ? config.estaAberto() : false

  const produtosFiltrados = useMemo(() => {
    let filtrados = produtos.filter((p) => !p.esgotado)
    if (categoriaAtiva) {
      filtrados = filtrados.filter((p) => p.categoriaId === categoriaAtiva)
    }
    if (busca.trim()) {
      const termo = busca.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      filtrados = filtrados.filter((p) => {
        const nomeNorm = p.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        const descNorm = p.descricao ? p.descricao.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : ''
        return nomeNorm.includes(termo) || descNorm.includes(termo)
      })
    }
    return filtrados
  }, [produtos, categoriaAtiva, busca])

  const destaques = produtos.filter((p) => p.destaque && !p.esgotado)

  let patrocinadorIndex = 0

  return (
    <div style={{ minHeight: '100dvh', background: '#f7f7f8' }}>
      {/* Hero Banner (Full Width) */}
      <section
        style={{
          background: 'var(--primaria)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(0, 0, 0, 0.1)' }} />

        <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12 relative z-10 flex flex-col-reverse md:flex-row items-center justify-center md:justify-between gap-6 md:gap-12">

          {/* Texto à esquerda (Desktop) / Abaixo (Mobile) */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <h1
              className="drop-shadow-md"
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                fontWeight: 700,
                margin: '0 0 0.75rem',
                lineHeight: 1.15,
                color: 'white',
              }}
            >
              Sabores que fazem
              <br />
              <span style={{ color: '#ffd043' }}>seu dia mais gostoso</span>
            </h1>
            <p className="drop-shadow-sm" style={{ color: 'white', fontSize: '0.95rem', margin: '0 0 1.25rem', lineHeight: 1.5, maxWidth: '420px' }}>
              Fornecemos para empresas, criamos parcerias sob medida e oferecemos espaço para divulgar sua marca em nosso aplicativo.
            </p>

            {/* Status de Funcionamento e Saber Mais */}
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2 flex-wrap">
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.375rem 0.875rem',
                  fontSize: '0.8rem',
                  color: aberto ? '#2e7d32' : '#c62828',
                  fontWeight: 600,
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: aberto ? '#4caf50' : '#f44336', display: 'inline-block', animation: aberto ? 'status-pulse 2s infinite' : 'none' }} />
                {aberto ? 'Aberto agora' : 'Fechado'}
              </span>

              <button
                id="btn-saber-mais"
                className="btn-info-loja hover:bg-white/30 transition-colors"
                onClick={config.openInfoModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '8px',
                  padding: '0.375rem 0.875rem',
                  fontSize: '0.8rem',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <Info size={14} />
                Saber mais
              </button>

              <a
                id="btn-atendimento-empresas"
                href={`https://wa.me/${config.whatsappContato?.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Tenho interesse no atendimento empresarial da Panificadora Costa.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-empresa-loja"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  background: 'rgba(255, 208, 67, 0.25)',
                  border: '1px solid rgba(255, 208, 67, 0.7)',
                  borderRadius: '8px',
                  padding: '0.375rem 0.875rem',
                  fontSize: '0.8rem',
                  color: '#ffd043',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(4px)',
                  textDecoration: 'none',
                }}
              >
                Atendimento Empresas
              </a>
            </div>
          </div>

          {/* Logo à direita (Desktop) / Acima (Mobile) */}
          <div className="shrink-0 flex justify-center w-full md:w-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-panificadora-costa.png"
              alt="Panificadora Costa"
              style={{
                width: 'clamp(160px, 50vw, 240px)',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>

        </div>
      </section>


      <div style={{ maxWidth: 1200, margin: '0 auto', paddingTop: '1.5rem', paddingBottom: '3rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Coluna Esquerda: Menu principal */}
        <div style={{ flex: 1, maxWidth: 768, width: '100%', margin: '0 auto' }}>
          {/* Filtro de Categorias e Busca (Sticky) */}
        <section 
          id="cardapio"
          className="top-0 md:top-[64px]"
          style={{ 
            padding: '1rem 1rem 1rem',
            position: 'sticky', 
            zIndex: 30, 
            backgroundColor: '#f7f7f8',
            transform: 'translateZ(0)', // Força aceleração de GPU
            willChange: 'transform',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: 768, margin: '0 auto', flexWrap: 'nowrap' }}>
            {/* Esquerda: Busca */}
            <div style={{ position: 'relative', flex: '3 1 0%', minWidth: 0 }}>
              <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-terciario)', display: 'flex' }}>
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Buscar produtos"
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
            
            {/* Direita: Dropdown de Categoria */}
            <SelectFiltro
              value={categoriaAtiva || ''}
              onChange={(e) => setCategoriaAtiva(e.target.value || null)}
              style={{ flex: '2 1 0%', minWidth: 0 }}
            >
              <option value="">Todas as categorias</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </SelectFiltro>
          </div>
        </section>

        {/* Destaques (Só mostra se não houver filtro ativo e nem busca) */}
        {!categoriaAtiva && !busca && destaques.length > 0 && (
          <section style={{ padding: '1.75rem 1rem 0' }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#1c1208',
                margin: '0 0 1rem',
              }}
            >
              Mais Pedidos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
              {destaques.map((p) => (
                <ProdutoCard key={p.id} produto={p} />
              ))}
            </div>
          </section>
        )}

        {/* Grade de produtos (Agrupada por categorias) */}
        <section style={{ padding: '1.5rem 1rem 0', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {carregando ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#b89470', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Loader2 size={48} className="animate-spin" />
              <p>Carregando cardápio...</p>
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-terciario)', animation: 'fade-in 0.4s ease' }}>
              <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primario)' }}>Nenhum produto encontrado</p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>Não encontramos nada para o filtro atual.</p>
            </div>
          ) : (
            <>
              {categorias.map((categoria) => {
                const produtosDaCategoria = produtosFiltrados.filter((p) => p.categoriaId === categoria.id)
                
                if (produtosDaCategoria.length === 0) return null
                
                // Pega um patrocinador para colocar no meio dessa categoria
                const patrocinadorAtual = patrocinadores.length > 0 ? patrocinadores[patrocinadorIndex % patrocinadores.length] : null
                if (patrocinadorAtual) patrocinadorIndex++

                return (
                  <div key={categoria.id}>
                    <h2
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#1c1208',
                        margin: '0 0 1rem',
                      }}
                    >
                      {categoria.nome}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                      {produtosDaCategoria.map((p, i) => (
                        <div key={p.id} style={{ animation: `fade-in 0.3s ease ${i * 0.04}s both` }}>
                          <ProdutoCard produto={p} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              
              {/* Anúncio Patrocinado no Final do Cardápio */}
              {patrocinadores.length > 0 && (
                <div style={{ marginTop: '2rem', animation: 'fade-in 0.5s ease' }}>
                  <PatrocinadorCard 
                    patrocinador={patrocinadores[Math.floor(Math.random() * patrocinadores.length)]} 
                    variante="horizontal" 
                  />
                </div>
              )}
            </>
          )}
        </section>
        </div>

        {/* Coluna Direita: Carrinho Fixo (Desktop) */}
        <div
          className="hidden lg:flex flex-col"
          style={{
            width: 360,
            position: 'sticky',
            top: 88,
            height: 'calc(100vh - 110px)',
            borderRadius: '12px',
            flexShrink: 0,
            transform: 'translateZ(0)', // Força aceleração de GPU
            willChange: 'transform',
          }}
        >
          <CartContent isSidebar={true} />
        </div>
      </div>
      <Footer />
    </div>
  )
}
