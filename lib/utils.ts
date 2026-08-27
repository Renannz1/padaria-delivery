export function formatarMoeda(valor: number | string | undefined | null): string {
  const num = typeof valor === 'string' ? parseFloat(valor) : (valor || 0)
  return Number(num).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatarWhatsapp(valor: string): string {
  const numeros = valor.replace(/\D/g, '')
  if (numeros.length <= 11) {
    return numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }
  return numeros.slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}


