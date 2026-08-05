'use client'

import { Produto } from '@/types'
import { useCartStore } from '@/store/cart-store'
import { formatarMoeda } from '@/lib/utils'
import { Plus, Minus, Star, ImageOff } from 'lucide-react'
import { useState } from 'react'
import { useConfigStore } from '@/store/config-store'

interface PropriedadesCartaoProduto {
  produto: Produto
}

export default function ProdutoCard({ produto }: PropriedadesCartaoProduto) {
  const itens = useCartStore((s) => s.itens)
  const adicionarItem = useCartStore((s) => s.adicionarItem)
  const diminuirQuantidade = useCartStore((s) => s.diminuirQuantidade)
  const [erroImagem, setErroImagem] = useState(false)
  const aberto = useConfigStore((s) => s.estaAberto())

  const itemNoCarrinho = itens.find((i) => i.produto.id === produto.id)
  const quantidade = itemNoCarrinho?.quantidade ?? 0

  return (
    <div
      className="card-produto"
      style={{
        display: 'flex',
        flexDirection: 'row',
        padding: '1rem',
        gap: '1rem',
        minHeight: '150px',
      }}
    >
      {/* Info (agora na esquerda) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '0.25rem' }}>
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primario)',
              margin: '0 0 0.25rem',
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {produto.nome}
          </h3>
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secundario)',
              margin: '0',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {produto.descricao}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: '1.05rem',
              color: 'var(--text-primario)',
            }}
          >
            {formatarMoeda(produto.preco)}
          </span>

          {/* Sem item no carrinho: botão simples */}
          {quantidade === 0 ? (
            <button
              id={`btn-adicionar-${produto.id}`}
              onClick={() => adicionarItem(produto)}
              disabled={produto.esgotado || !aberto}
              className="btn-quantidade btn-quantidade-mais"
              aria-label={`Adicionar ${produto.nome} ao carrinho`}
              style={{
                width: (!aberto || produto.esgotado) ? 'auto' : 34,
                height: 34,
                padding: (!aberto || produto.esgotado) ? '0 0.75rem' : 0,
                background: (!aberto || produto.esgotado) ? '#f5f5f5' : 'var(--bg-card)',
                color: (!aberto || produto.esgotado) ? '#ccc' : 'var(--text-primario)',
                border: '1px solid var(--borda)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (!aberto || produto.esgotado) ? 'not-allowed' : 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {!aberto ? 'Fechado' : produto.esgotado ? 'Esgotado' : <Plus size={16} />}
            </button>
          ) : (
            // Com item: mostrar controles
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <button
                id={`btn-diminuir-vitrine-${produto.id}`}
                onClick={() => diminuirQuantidade(produto.id)}
                className="btn-quantidade btn-quantidade-menos"
                aria-label="Diminuir quantidade"
                style={{ width: 34, height: 34, border: '1px solid var(--borda)', background: 'var(--bg-card)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Minus size={14} color="var(--text-primario)" />
              </button>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  minWidth: 16,
                  textAlign: 'center',
                  color: 'var(--text-primario)',
                }}
              >
                {quantidade}
              </span>
              <button
                id={`btn-adicionar-mais-${produto.id}`}
                onClick={() => adicionarItem(produto)}
                disabled={!aberto}
                className="btn-quantidade btn-quantidade-mais"
                aria-label="Aumentar quantidade"
                style={{ 
                  width: 34, 
                  height: 34, 
                  background: !aberto ? '#ccc' : 'var(--text-primario)', 
                  color: !aberto ? '#666' : 'var(--bg-card)', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: !aberto ? 'not-allowed' : 'pointer'
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Imagem (agora na direita) */}
      <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0, alignSelf: 'center', background: 'var(--bg-principal)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {produto.imagem && !erroImagem ? (
          <img
            src={produto.imagem}
            alt={produto.nome}
            onError={() => setErroImagem(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: 'var(--text-terciario)' }}>
            <ImageOff size={24} />
            <span style={{ fontSize: '0.6rem', fontWeight: 600 }}>Sem foto</span>
          </div>
        )}

        {produto.destaque && (
          <span
            className="badge-destaque"
            style={{ position: 'absolute', top: '-0.4rem', right: '-0.4rem' }}
          >
            <Star fill="var(--primaria)" size={14} color="var(--primaria)" />
          </span>
        )}
      </div>
    </div>
  )
}
