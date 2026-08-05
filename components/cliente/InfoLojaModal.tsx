'use client'

import { Clock, MapPin, Truck, Store, X, Briefcase } from 'lucide-react'
import { useConfigStore } from '@/store/config-store'
import { formatarMoeda } from '@/lib/utils'

export default function InfoLojaModal() {
  const config = useConfigStore()
  
  if (!config.isInfoModalOpen) return null

  return (
    <div
      id="modal-info-loja"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(28, 18, 8, 0.6)',
        animation: 'modal-backdrop-fade 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
      onClick={config.closeInfoModal}
    >
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '500px',
          borderRadius: '1.25rem',
          overflow: 'hidden',
          animation: 'modal-content-show 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: '#ffffff',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e4e2ea',
            borderTopLeftRadius: '1.25rem',
            borderTopRightRadius: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1.35rem', fontWeight: 700, color: '#18171a' }}>
              {config.nomeEstabelecimento}
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#555260' }}>
              Informações de funcionamento e contato
            </p>
          </div>
          <button
            id="btn-fechar-modal"
            className="btn-fechar-hover"
            onClick={config.closeInfoModal}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888597',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '70vh', overflowY: 'auto' }}>
          
          {/* Horário */}
          <div style={{ display: 'flex', gap: '0.875rem' }}>
            <div style={{ color: 'var(--primaria)', flexShrink: 0, marginTop: '2px' }}>
              <Clock size={20} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 600, color: '#1c1208' }}>
                Horário de Atendimento
              </h4>
              <div style={{ margin: 0, fontSize: '0.875rem', color: '#555260', lineHeight: '1.5' }}>
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia, idx) => {
                  const h = config.horariosSemana[idx]
                  if (!h) return null
                  return (
                    <div key={idx} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span style={{ display: 'inline-block', width: '36px', fontWeight: 500 }}>{dia}:</span>
                      <span>{h.aberto ? `${h.abertura}h às ${h.fechamento}h` : 'Fechado'}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid #ebebef', margin: 0 }} />

          {/* Endereço */}
          <div style={{ display: 'flex', gap: '0.875rem' }}>
            <div style={{ color: 'var(--primaria)', flexShrink: 0, marginTop: '2px' }}>
              <MapPin size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 600, color: '#1c1208' }}>
                Endereço
              </h4>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: '#555260', lineHeight: '1.4' }}>
                {config.enderecoLoja}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.enderecoLoja)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  color: 'var(--primaria)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primaria-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--primaria)')}
              >
                Ver no Google Maps &rarr;
              </a>
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid #ebebef', margin: 0 }} />

          {/* Contato */}
          <div style={{ display: 'flex', gap: '0.875rem' }}>
            <div style={{ color: 'var(--primaria)', flexShrink: 0, marginTop: '2px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scale(0.95)' }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 600, color: '#1c1208' }}>
                Contato & Pedidos por WhatsApp
              </h4>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: '#555260', lineHeight: '1.4' }}>
                Tire suas dúvidas ou envie mensagem diretamente para nós:
              </p>
              <a
                href={`https://wa.me/55${config.whatsappContato.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#25D366',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.93a7.904 7.904 0 0 0 1.08 3.951L0 16l4.2-1.102a7.935 7.935 0 0 0 3.79.905h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.69-4.98c-.202-.101-1.192-.588-1.378-.654-.186-.066-.322-.1-.458.101-.136.201-.527.654-.646.788-.119.133-.239.15-.44.05-1.144-.572-1.954-1.189-2.678-2.433-.19-.326.19-.303.545-1.012.067-.137.034-.257-.017-.357-.05-.1-.458-1.101-.628-1.507-.165-.398-.333-.344-.458-.351-.119-.006-.257-.007-.394-.007a.784.784 0 0 0-.568.257c-.19.208-.727.711-.727 1.734 0 1.023.743 2.012.847 2.152.103.14 1.462 2.235 3.54 3.125.495.213.882.34 1.182.436.498.158.951.135 1.309.082.399-.059 1.192-.487 1.36-1.058.169-.571.169-1.062.119-1.163-.05-.101-.186-.15-.389-.251z"/>
                </svg>
                Falar no WhatsApp
              </a>
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid #ebebef', margin: 0 }} />

          {/* Informações de Entrega e Retirada */}
          <div style={{ display: 'flex', gap: '0.875rem' }}>
            <div style={{ color: 'var(--primaria)', flexShrink: 0, marginTop: '2px' }}>
              <Store size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 600, color: '#1c1208' }}>
                Opções de Recebimento
              </h4>
              <p style={{ margin: '0', fontSize: '0.875rem', color: '#555260', lineHeight: '1.4' }}>
                Trabalhamos com Delivery e Retirada no local.
              </p>
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid #ebebef', margin: 0 }} />

          {/* Parcerias Corporativas */}
          <div style={{ display: 'flex', gap: '0.875rem' }}>
            <div style={{ color: 'var(--primaria)', flexShrink: 0, marginTop: '2px' }}>
              <Briefcase size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontWeight: 600, color: '#1c1208' }}>
                Atendimento para Empresas e Parcerias
              </h4>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#555260', lineHeight: '1.5' }}>
                Leve a qualidade da Panificadora Costa para o seu negócio. Atendemos encomendas corporativas, fornecimento diário e eventos com condições exclusivas.
              </p>
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#555260', lineHeight: '1.5' }}>
                Quer dar visibilidade à sua marca? Anuncie em nosso sistema digital e destaque seu negócio para centenas de clientes todos os dias.
              </p>
              <a
                href={`https://wa.me/55${config.whatsappContato.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Tenho interesse em uma parceria/atendimento empresarial com a Panificadora Costa.')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#25D366',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.93a7.904 7.904 0 0 0 1.08 3.951L0 16l4.2-1.102a7.935 7.935 0 0 0 3.79.905h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.69-4.98c-.202-.101-1.192-.588-1.378-.654-.186-.066-.322-.1-.458.101-.136.201-.527.654-.646.788-.119.133-.239.15-.44.05-1.144-.572-1.954-1.189-2.678-2.433-.19-.326.19-.303.545-1.012.067-.137.034-.257-.017-.357-.05-.1-.458-1.101-.628-1.507-.165-.398-.333-.344-.458-.351-.119-.006-.257-.007-.394-.007a.784.784 0 0 0-.568.257c-.19.208-.727.711-.727 1.734 0 1.023.743 2.012.847 2.152.103.14 1.462 2.235 3.54 3.125.495.213.882.34 1.182.436.498.158.951.135 1.309.082.399-.059 1.192-.487 1.36-1.058.169-.571.169-1.062.119-1.163-.05-.101-.186-.15-.389-.251z"/>
                </svg>
                Chamar no WhatsApp
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
