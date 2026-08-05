'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectFiltroProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  children: React.ReactNode
  onChange?: (e: any) => void
  value?: string | number
  disabled?: boolean
}

export function SelectFiltro({ children, className = '', onChange, value, style, disabled, ...props }: SelectFiltroProps) {
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Extrai as opções (<option>) que foram passadas como children
  const options: { value: string, label: string }[] = []
  
  function extractText(node: React.ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number') return String(node)
    if (Array.isArray(node)) return node.map(extractText).join('')
    if (React.isValidElement(node) && node.props && (node.props as any).children) {
      return extractText((node.props as any).children)
    }
    return ''
  }

  React.Children.toArray(children).forEach((child) => {
    if (React.isValidElement<{ value?: string | number, children?: React.ReactNode }>(child) && child.type === 'option') {
      options.push({
        value: child.props.value?.toString() || '',
        label: extractText(child.props.children)
      })
    }
  })

  const selectedOption = options.find(opt => opt.value === value?.toString()) || options[0]

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'relative', ...style }} 
      className={className}
    >
      <div
        onClick={() => {
          if (!disabled) setAberto(!aberto)
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 0.75rem',
          minHeight: '44px',
          borderRadius: '0.75rem',
          border: aberto ? '1px solid var(--primaria)' : '1px solid var(--borda)',
          backgroundColor: disabled ? '#f5f5f5' : 'var(--bg-card)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem',
          color: disabled ? '#888' : 'var(--text-primario)',
          userSelect: 'none',
          boxShadow: aberto ? '0 0 0 3px rgba(200, 134, 10, 0.08)' : 'none',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.6 : 1,
        }}
        {...props}
      >
        <span style={{ lineHeight: 1.1, marginRight: '0.5rem' }}>
          {selectedOption?.label}
        </span>
        <ChevronDown 
          size={18} 
          style={{ 
            color: 'var(--text-terciario)',
            transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
            flexShrink: 0
          }} 
        />
      </div>

      {aberto && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--borda)',
            borderRadius: '0.75rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            zIndex: 50,
            overflow: 'hidden',
            animation: 'modal-content-show 0.15s ease-out',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {options.map((opt, idx) => (
            <div
              key={opt.value}
              onClick={() => {
                setAberto(false)
                if (onChange) {
                  // Simula o evento nativo para não quebrar a lógica das páginas
                  onChange({ target: { value: opt.value } })
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-principal)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              style={{
                padding: '0.65rem 1rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                color: opt.value === value?.toString() ? 'var(--primaria)' : 'var(--text-primario)',
                fontWeight: opt.value === value?.toString() ? 600 : 400,
                backgroundColor: 'transparent',
                transition: 'background-color 0.1s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              {opt.label}
              {opt.value === value?.toString() && (
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--primaria)' }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
