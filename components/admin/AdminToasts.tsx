'use client'

import { useToastStore, Toast } from '@/store/toast-store'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

export default function AdminToasts() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        pointerEvents: 'none', // Let clicks pass through the container
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const isSuccess = toast.type === 'success'
  const isError = toast.type === 'error'

  const bgColor = isSuccess ? '#ecfdf5' : isError ? '#fef2f2' : '#eff6ff'
  const borderColor = isSuccess ? '#10b981' : isError ? '#ef4444' : '#3b82f6'
  const iconColor = isSuccess ? '#10b981' : isError ? '#ef4444' : '#3b82f6'
  
  const Icon = isSuccess ? CheckCircle2 : isError ? AlertTriangle : Info

  return (
    <div
      style={{
        pointerEvents: 'auto', // Re-enable pointer events for the actual toast
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '0.5rem',
        padding: '1rem',
        minWidth: '300px',
        maxWidth: '400px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        animation: 'slide-up-fade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div style={{ color: iconColor, flexShrink: 0, marginTop: '2px' }}>
        <Icon size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          padding: '0.25rem',
          margin: '-0.25rem',
          color: '#6b7280',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0.25rem',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#374151')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
      >
        <X size={16} />
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-up-fade {
          from {
            opacity: 0;
            transform: translateY(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}} />
    </div>
  )
}
