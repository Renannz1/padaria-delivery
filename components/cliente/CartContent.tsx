'use client'

import { useCartStore } from '@/store/cart-store'
import { useConfigStore } from '@/store/config-store'
import { ItemCarrinho } from '@/types'
import { formatarMoeda } from '@/lib/utils'
import { X, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function CartItem({ item }: { item: ItemCarrinho }) {
  const adicionarItem = useCartStore((s) => s.adicionarItem)
  const diminuirQuantidade = useCartStore((s) => s.diminuirQuantidade)

  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        padding: '1.25rem 0',
        borderBottom: '1px solid #ebebef',
        alignItems: 'center',
        animation: 'fade-in 0.3s ease',
      }}
    >
      {/* Imagem do Produto */}
      <div style={{ width: 64, height: 64, borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#f1f1f4' }}>
        {item.produto.imagem ? (
          <img src={item.produto.imagem} alt={item.produto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0bdc8' }}>
            <ShoppingCart size={24} />
          </div>
        )}
      </div>

      {/* Detalhes */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        
        {/* Nome e Preço */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#18171a', margin: 0, lineHeight: 1.2 }}>
            {item.produto.nome}
          </p>
          <span style={{ fontWeight: 700, color: '#18171a', fontSize: '1rem' }}>
            {formatarMoeda(item.produto.preco * item.quantidade)}
          </span>
        </div>

        {/* Controles e preço unitário */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <p style={{ fontSize: '0.8rem', color: '#888597', margin: 0 }}>
             {item.quantidade > 1 ? `${formatarMoeda(item.produto.preco)} cada` : ''}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', background: '#f7f7f8', borderRadius: '8px', border: '1px solid #ebebef' }}>
            <button
              onClick={() => diminuirQuantidade(item.produto.id)}
              style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer', color: item.quantidade === 1 ? '#ef4444' : '#555260', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label={item.quantidade === 1 ? "Remover item" : "Diminuir quantidade"}
            >
              {item.quantidade === 1 ? <Trash2 size={16} /> : <span style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '-2px' }}>−</span>}
            </button>
            
            <span style={{ fontWeight: 700, fontSize: '0.9rem', width: '24px', textAlign: 'center', color: '#18171a' }}>
              {item.quantidade}
            </span>
            
            <button
              onClick={() => adicionarItem(item.produto)}
              style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--primaria)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Aumentar quantidade"
            >
              <span style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '-2px' }}>+</span>
            </button>
          </div>
          
        </div>
      </div>
    </div>
  )
}

interface CartContentProps {
  onClose?: () => void
  isSidebar?: boolean
  isPeek?: boolean
}

export default function CartContent({ onClose, isSidebar = false, isPeek = false }: CartContentProps) {
  const router = useRouter()
  const itens = useCartStore((s) => s.itens)
  const subtotal = useCartStore((s) => s.subtotal())
  const config = useConfigStore()
  const taxaEntrega = useCartStore((s) => s.taxaEntrega(config.bairrosAtendidos))
  const total = useCartStore((s) => s.total(config.bairrosAtendidos))
  const limparCarrinho = useCartStore((s) => s.limparCarrinho)
  
  const faltam = config.pedidoMinimo - subtotal
  const abaixoMinimo = subtotal > 0 && faltam > 0

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: isSidebar ? 'white' : '#f7f7f8',
        borderRadius: isSidebar ? '12px' : '0',
        overflow: 'hidden',
      }}
    >
      {/* Header do Carrinho */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1.25rem',
          borderBottom: '1px solid #e4e2ea',
          background: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingCart size={20} color="#18171a" />
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#18171a',
              margin: 0,
            }}
          >
            Meu Carrinho
          </h2>
        </div>
        {isPeek ? (
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#18171a' }}>
            {formatarMoeda(total)}
          </span>
        ) : onClose && (
          <button
            onClick={onClose}
            style={{
              background: '#f1f1f4',
              border: 'none',
              borderRadius: '0.5rem',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#555260',
              transition: 'background 0.2s',
            }}
            aria-label="Fechar carrinho"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Conteúdo */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '0 1.25rem', 
          background: isSidebar ? 'white' : 'transparent',
          opacity: isPeek ? 0 : 1,
          transition: 'opacity 0.4s ease-in-out',
          pointerEvents: isPeek ? 'none' : 'auto'
        }}
      >
        {itens.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '1rem',
              color: '#888597',
              padding: '2rem 0',
            }}
          >
            <div style={{ padding: '1.5rem', background: '#f7f7f8', borderRadius: '50%' }}>
              <ShoppingCart size={40} color="#d4d2dc" />
            </div>
            <p style={{ fontWeight: 600, fontSize: '1.1rem', margin: 0, color: '#555260' }}>Seu carrinho está vazio</p>
            {!isSidebar && (
              <button
                onClick={onClose}
                className="btn-secundario"
                style={{ marginTop: '0.5rem' }}
              >
                Ver cardápio
              </button>
            )}
          </div>
        ) : (
          <div>
            {itens.map((item) => (
              <CartItem key={item.produto.id} item={item} />
            ))}
            <button
              onClick={limparCarrinho}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#888597',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.75rem 0',
                textDecoration: 'underline',
              }}
            >
              <Trash2 size={13} /> Limpar carrinho
            </button>
          </div>
        )}
      </div>

      {/* Footer com Total e Botão */}
      {itens.length > 0 && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'white',
            borderTop: '1px solid #e4e2ea',
            borderBottomLeftRadius: isSidebar ? '12px' : '0',
            borderBottomRightRadius: isSidebar ? '12px' : '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.1rem', color: '#555260', fontWeight: 600 }}>
                Total:
              </span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#18171a' }}>
                {formatarMoeda(total)}
              </span>
            </div>
            {abaixoMinimo && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, marginTop: '2px', lineHeight: 1.2 }}>
                Faltam {formatarMoeda(faltam)}<br />para o mínimo
              </span>
            )}
          </div>

            <div>
              <Link 
                href={abaixoMinimo ? "#" : "/checkout"} 
                onClick={(e) => {
                  if (abaixoMinimo) {
                    e.preventDefault()
                    return
                  }
                  if (onClose) {
                    e.preventDefault()
                    onClose()
                    setTimeout(() => router.push('/checkout'), 100)
                  }
                }} 
                style={{ textDecoration: 'none', cursor: abaixoMinimo ? 'not-allowed' : 'pointer' }}
              >
                <button
                  className="btn-primario"
                  style={{ 
                    padding: '0.6rem 1.2rem', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: '0.4rem', 
                    fontSize: '0.9rem', 
                    borderRadius: '0.5rem',
                    opacity: abaixoMinimo ? 0.5 : 1,
                    pointerEvents: abaixoMinimo ? 'none' : 'auto'
                  }}
                  disabled={abaixoMinimo}
                >
                  Continuar <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        )}
    </div>
  )
}
