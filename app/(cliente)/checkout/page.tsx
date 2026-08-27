'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart-store'
import { useAuthStore } from '@/store/auth-store'
import { useConfigStore } from '@/store/config-store'
import { formatarMoeda, formatarWhatsapp } from '@/lib/utils'
import { DadosCliente, TipoEntrega, FormaPagamento } from '@/types'
import {
  Truck, Store, ChevronRight, ArrowLeft, ShoppingBag,
  Smartphone, CreditCard, Banknote, Loader2,
} from 'lucide-react'
import Link from 'next/link'
import VoltarLink from '@/components/cliente/VoltarLink'
import ModalAutenticacao from '@/components/cliente/ModalAutenticacao'
import SeletorEndereco from '@/components/cliente/SeletorEndereco'

const FORMAS_PAGAMENTO: { id: FormaPagamento; label: string; sub: string; icon: React.ReactNode }[] = [
  { id: 'pix', label: 'Pix', sub: 'Chave na entrega', icon: <Smartphone size={20} /> },
  { id: 'cartao', label: 'Cartão', sub: 'Crédito ou débito', icon: <CreditCard size={20} /> },
  { id: 'dinheiro', label: 'Dinheiro', sub: 'Troco disponível', icon: <Banknote size={20} /> },
]

export default function CheckoutPage() {
  const router = useRouter()
  const itens = useCartStore((s) => s.itens)
  const totalItens = useCartStore((s) => s.totalItens())
  const subtotal = useCartStore((s) => s.subtotal())
  const setDadosCliente = useCartStore((s) => s.setDadosCliente)
  const setFormaPagamento = useCartStore((s) => s.setFormaPagamento)
  const finalizarPedido = useCartStore((s) => s.finalizarPedido)
  const dadosCliente = useCartStore((s) => s.dadosCliente)

  const authToken = useAuthStore((s) => s.accessToken)
  const isLogado = useAuthStore((s) => s.isLogado())

  const config = useConfigStore()

  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>('entrega')
  const [formaPagamento, setFormaPagamentoLocal] = useState<FormaPagamento>('pix')
  const [troco, setTroco] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<any | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [etapa, setEtapa] = useState<1 | 2>(1)

  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isCarregando, setIsCarregando] = useState(false)
  const [erroApi, setErroApi] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (dadosCliente) {
      setTipoEntrega(dadosCliente.tipoEntrega || 'entrega')
    }
  }, [dadosCliente])

  useEffect(() => {
    if (mounted && !isLogado) {
      setShowAuthModal(true)
    }
  }, [mounted, isLogado])

  // Calcular frete com base no bairro selecionado
  let taxaEntrega = 0
  if (tipoEntrega === 'entrega') {
    const bairroCliente = enderecoSelecionado?.bairro || ''
    const bairroEncontrado = config.bairrosAtendidos.find(
      b => b.nome.toLowerCase() === bairroCliente.toLowerCase() && b.ativo
    )
    taxaEntrega = Number(bairroEncontrado ? bairroEncontrado.taxa_entrega : 0)
  }

  const total = subtotal + taxaEntrega

  function validar(): boolean {
    const errs: Record<string, string> = {}
    if (!isLogado) {
      setShowAuthModal(true)
      return false
    }

    if (tipoEntrega === 'entrega' && !enderecoSelecionado) {
      errs.geral = 'Por favor, selecione ou adicione um endereço de entrega.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function prosseguir() {
    if (!validar()) return
    setErroApi(null)

    const dados: DadosCliente = {
      nome: useAuthStore.getState().clienteNome || '',
      whatsapp: useAuthStore.getState().clienteWhatsapp || '',
      tipoEntrega,
      ...(tipoEntrega === 'entrega' && enderecoSelecionado && {
        endereco_id: enderecoSelecionado.id,
      }),
      observacoes: observacoes.trim() || undefined,
    }
    setDadosCliente(dados)
    setFormaPagamento(formaPagamento, formaPagamento === 'dinheiro' ? troco : undefined)

    const currentToken = useAuthStore.getState().accessToken
    if (currentToken) {
      await enviarPedido(currentToken)
    } else {
      setErroApi('Falha na autenticação.')
      setShowAuthModal(true)
    }
  }

  async function enviarPedido(tokenValido: string) {
    setIsCarregando(true)
    setErroApi(null)
    try {
      setIsRedirecting(true)
      const id = await finalizarPedido(tokenValido)
      router.push(`/pedido/${id}`)
    } catch (err: any) {
      setIsRedirecting(false)
      const msg =
        err?.data?.detail ||
        err?.data?.non_field_errors?.[0] ||
        'Não foi possível finalizar o pedido. Tente novamente.'
      setErroApi(msg)
    } finally {
      setIsCarregando(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    prosseguir()
  }

  if (!mounted) return null
  
  const faltam = config.pedidoMinimo - subtotal
  const abaixoMinimo = subtotal > 0 && faltam > 0

  if (!config.estaAberto()) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ margin: '0 auto', padding: '2.5rem 1rem 4rem', maxWidth: 768, animation: 'fade-in 0.3s ease' }}>
          <VoltarLink />
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1c1208', margin: '0 0 0.5rem' }}>
            Estamos Fechados
          </h1>

          <div style={{ padding: '4rem 1.5rem', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
            <div style={{ padding: '1.5rem', background: 'white', borderRadius: '50%', display: 'inline-block', marginBottom: '1.5rem' }}>
              <Store size={48} color="#d4d2dc" />
            </div>
            <h2 style={{ margin: '0 0 0.75rem', color: '#1c1208', fontSize: '1.75rem' }}>
              Não é possível fazer pedidos
            </h2>
            <p style={{ color: '#888597', marginBottom: '2rem', fontSize: '1rem' }}>
              O estabelecimento está fechado no momento.
            </p>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="btn-primario" style={{ width: '100%', maxWidth: 300, margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
                Voltar ao Início <ChevronRight size={18} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if ((itens.length === 0 || abaixoMinimo) && !isRedirecting) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ margin: '0 auto', padding: '2.5rem 1rem 4rem', maxWidth: 768, animation: 'fade-in 0.3s ease' }}>
          <VoltarLink />
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1c1208', margin: '0 0 0.5rem' }}>
            Finalizar Pedido
          </h1>

          <div style={{ padding: '4rem 1.5rem', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
            <div style={{ padding: '1.5rem', background: 'white', borderRadius: '50%', display: 'inline-block', marginBottom: '1.5rem' }}>
              <ShoppingBag size={48} color="#d4d2dc" />
            </div>
            <h2 style={{ margin: '0 0 0.75rem', color: '#1c1208', fontSize: '1.75rem' }}>
              {abaixoMinimo ? 'Pedido mínimo não atingido' : 'Seu carrinho está vazio'}
            </h2>
            <p style={{ color: '#888597', marginBottom: '2rem', fontSize: '1rem' }}>
              {abaixoMinimo 
                ? `Para finalizar a compra, adicione mais ${formatarMoeda(faltam)} em produtos.` 
                : 'Parece que você ainda não escolheu suas delícias. Adicione produtos antes de finalizar o pedido.'
              }
            </p>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="btn-primario" style={{ width: '100%', maxWidth: 300, margin: '0 auto' }}>
                Explorar Cardápio <ChevronRight size={18} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!isLogado) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ margin: '0 auto', padding: '2.5rem 1rem 4rem', maxWidth: 768, animation: 'fade-in 0.3s ease' }}>
          <VoltarLink />
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1c1208', margin: '0 0 0.5rem' }}>
            Finalizar Pedido
          </h1>
          <p style={{ color: '#888597', fontSize: '1rem', marginBottom: '2rem' }}>
            {totalItens} {totalItens === 1 ? 'item' : 'itens'} no seu carrinho
          </p>

          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', background: 'white', borderRadius: '1rem', border: '1px solid var(--borda)' }}>
            <h2 style={{ margin: '0 0 0.75rem', color: '#1c1208', fontSize: '1.5rem' }}>
              Identifique-se para continuar
            </h2>
            <p style={{ color: '#888597', marginBottom: '2rem' }}>
              Precisamos saber quem você é para entregar seu pedido direitinho.
            </p>
            <button 
              className="btn-primario" 
              onClick={() => setShowAuthModal(true)}
              style={{ width: '100%', maxWidth: 300, margin: '0 auto', display: 'flex', justifyContent: 'center' }}
            >
              Fazer Login ou Criar Conta
            </button>
          </div>
        </div>
        
        {showAuthModal && (
          <ModalAutenticacao
            aoSucesso={() => setShowAuthModal(false)}
            aoFechar={() => setShowAuthModal(false)}
          />
        )}
      </div>
    )
  }

  const cardStyle = {
    background: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    border: '1px solid var(--borda)',
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <div style={{ margin: '0 auto', padding: '2.5rem 1rem 4rem', maxWidth: 768, animation: 'fade-in 0.3s ease' }}>
        {etapa === 2 ? (
          <button
            onClick={() => setEtapa(1)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#888597', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.9rem' }}
          >
            <ArrowLeft size={16} /> Voltar para opções de entrega
          </button>
        ) : (
          <VoltarLink />
        )}

        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1c1208', margin: '0 0 0.5rem' }}>
          Finalizar Pedido
        </h1>
        <p style={{ color: '#888597', fontSize: '1rem', marginBottom: '2rem' }}>
          {totalItens} {totalItens === 1 ? 'item' : 'itens'} no seu carrinho
        </p>

        {isLogado && (
          <div style={{
            background: '#f0faf0',
            border: '1px solid #b8ddb8',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            color: '#2e7d32',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            ✓ Identificado como <strong>{useAuthStore.getState().clienteNome}</strong>
          </div>
        )}

        {(erroApi || errors.geral) && (
          <div style={{
            background: '#fef0f0',
            border: '1px solid #f8c0c0',
            borderRadius: '0.75rem',
            padding: '0.875rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            color: '#c62828',
          }}>
            {erroApi || errors.geral}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* ─── TIPO DE ENTREGA ─── */}
          {etapa === 1 && (
            <>
              <section style={cardStyle}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1c1208', margin: '0 0 1.25rem' }}>
                  Como deseja receber?
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { id: 'entrega' as TipoEntrega, label: 'Delivery', sub: 'Receba em casa', icon: <Truck size={24} /> },
                    { id: 'retirada' as TipoEntrega, label: 'Retirar no local', sub: 'Busque no local', icon: <Store size={24} /> },
                  ].map((opt) => (
                    <button key={opt.id} type="button" id={`tipo-${opt.id}`}
                      onClick={() => setTipoEntrega(opt.id)}
                      style={{
                        padding: '1.25rem 1rem', borderRadius: '0.75rem', border: '2px solid',
                        borderColor: tipoEntrega === opt.id ? 'var(--primaria)' : '#f0e4d0',
                        background: tipoEntrega === opt.id ? 'rgba(200, 134, 10, 0.04)' : '#faf6f0',
                        cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                      }}
                    >
                      <span style={{ color: tipoEntrega === opt.id ? 'var(--primaria)' : '#b89470' }}>{opt.icon}</span>
                      <span style={{ fontWeight: 700, color: tipoEntrega === opt.id ? '#1c1208' : '#4a371c', fontSize: '0.95rem' }}>{opt.label}</span>
                      <span style={{ fontSize: '0.75rem', color: '#888597' }}>{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* ─── ENDEREÇO ─── */}
              {tipoEntrega === 'entrega' && isLogado && (
                <section style={{ ...cardStyle, animation: 'fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1c1208', margin: '0 0 1.25rem' }}>
                    Endereço de Entrega
                  </h2>
                  <SeletorEndereco onSelect={setEnderecoSelecionado} />
                </section>
              )}

              <button
                type="button"
                onClick={() => {
                  if (validar()) setEtapa(2)
                }}
                className="btn-primario"
                style={{ width: '100%', fontSize: '1.1rem', padding: '1rem', marginTop: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
              >
                Ir para o pagamento <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* ─── ETAPA 2: PAGAMENTO, OBS, RESUMO ─── */}
          {etapa === 2 && (
            <>

          {/* ─── PAGAMENTO ─── */}
          <section style={cardStyle}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1c1208', margin: '0 0 0.25rem' }}>
              Pagamento
            </h2>
            <p style={{ color: '#888597', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
              {tipoEntrega === 'entrega' 
                ? 'O pagamento será realizado no momento da entrega do pedido.' 
                : 'O pagamento será realizado no balcão ao retirar o pedido.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: formaPagamento === 'dinheiro' ? '1.25rem' : 0 }}>
              {FORMAS_PAGAMENTO.map((fp) => (
                <button
                  key={fp.id}
                  type="button"
                  id={`pagamento-${fp.id}`}
                  onClick={() => setFormaPagamentoLocal(fp.id)}
                  style={{
                    padding: '1rem 0.5rem',
                    borderRadius: '0.75rem',
                    border: '2px solid',
                    borderColor: formaPagamento === fp.id ? 'var(--primaria)' : '#f0e4d0',
                    background: formaPagamento === fp.id ? 'rgba(200, 134, 10, 0.04)' : '#faf6f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ color: formaPagamento === fp.id ? 'var(--primaria)' : '#b89470' }}>{fp.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: formaPagamento === fp.id ? '#1c1208' : '#4a371c' }}>{fp.label}</span>
                  <span style={{ fontSize: '0.68rem', color: '#888597', lineHeight: 1.2 }}>{fp.sub}</span>
                </button>
              ))}
            </div>

            {formaPagamento === 'dinheiro' && (
              <div style={{ animation: 'fade-in 0.3s ease' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#555260', marginBottom: '0.5rem' }}>
                  Troco para quanto? (opcional)
                </label>
                <input
                  id="input-troco"
                  type="text"
                  value={troco}
                  onChange={(e) => setTroco(e.target.value)}
                  placeholder="Ex: R$ 50,00"
                  className="input-campo"
                  style={{ background: '#fdfaf5' }}
                />
              </div>
            )}
          </section>

          {/* ─── OBSERVAÇÕES ─── */}
          <section style={cardStyle}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem', color: '#1c1208', marginBottom: '0.75rem' }}>
              Alguma observação? (opcional)
            </label>
            <textarea
              id="input-observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Sem açúcar no café, pão bem passado..."
              className="input-campo"
              rows={3}
              style={{ resize: 'vertical', background: '#fdfaf5' }}
            />
          </section>

          {/* ─── RESUMO ─── */}
          <section style={{ background: '#faf6f0', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #f0e4d0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#555260' }}>
                <span>Subtotal</span><span>{formatarMoeda(subtotal)}</span>
              </div>
              {tipoEntrega === 'entrega' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#555260' }}>
                  <span>Taxa de entrega</span>
                  <span>{taxaEntrega === 0 ? <span style={{ color: '#2e7d32', fontWeight: 600 }}>Grátis</span> : formatarMoeda(taxaEntrega)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.25rem', color: '#1c1208', borderTop: '1px solid #e8d5b0', paddingTop: '1rem', marginTop: '0.25rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primaria)' }}>{formatarMoeda(total)}</span>
              </div>
            </div>
          </section>

              <button
                id="btn-proximo"
                type="submit"
                className="btn-primario"
                style={{ width: '100%', fontSize: '1.1rem', padding: '1rem', marginTop: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                disabled={isCarregando}
              >
                {isCarregando
                  ? <><Loader2 size={20} className="animate-spin" /> Enviando...</>
                  : <>Finalizar Pedido <ChevronRight size={22} /></>
                }
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
