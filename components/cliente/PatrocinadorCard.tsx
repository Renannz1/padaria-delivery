'use client'

import { ExternalLink } from 'lucide-react'
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

interface PatrocinadorCardProps {
  patrocinador: Patrocinador
  variante?: 'quadrado' | 'horizontal'
}

export default function PatrocinadorCard({ patrocinador, variante = 'quadrado' }: PatrocinadorCardProps) {
  const urlImagem = variante === 'quadrado' ? patrocinador.imagem_quadrada : patrocinador.imagem_banner

  if (!urlImagem) return null
  
  return (
    <div
      className="card-produto"
      onClick={() => {
        if (patrocinador.link_destino) {
          window.open(patrocinador.link_destino, '_blank')
        }
      }}
      style={{
        display: 'block',
        width: '100%',
        aspectRatio: variante === 'quadrado' ? '1 / 1' : '3 / 1',
        minHeight: variante === 'horizontal' ? '120px' : 'auto',
        position: 'relative',
        overflow: 'hidden',
        cursor: patrocinador.link_destino ? 'pointer' : 'default',
        padding: 0,
      }}
    >
      <Image
        src={urlImagem as string}
        alt={patrocinador.nome_empresa}
        fill
        style={{ objectFit: 'cover', opacity: 0.9 }}
        unoptimized
      />
      
      {/* Overlay Escuro para o texto */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
        padding: '2.5rem 1rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        pointerEvents: 'none'
      }}>
        <h3 style={{ color: 'white', margin: 0, fontSize: '1.05rem', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
          {patrocinador.nome_empresa}
        </h3>
        <div style={{ color: 'white', opacity: 0.9, display: 'flex' }}>
          <ExternalLink size={16} />
        </div>
      </div>
    </div>
  )
}
