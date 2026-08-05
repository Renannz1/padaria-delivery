// ============================================================
// CAMADA DE COMUNICAÇÃO COM A API DJANGO
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// ── Helpers ─────────────────────────────────────────────────

function getClienteToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('padaria-auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.accessToken ?? null
  } catch {
    return null
  }
}

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('padaria-admin-auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.accessToken ?? null
  } catch {
    return null
  }
}

async function apiFetch(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Se for FormData, o navegador define o Content-Type automaticamente com o boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    let erro: any
    try {
      erro = await res.clone().json()
    } catch (parseError) {
      const rawText = await res.text()
      console.error('Falha ao parsear JSON. Status:', res.status, 'Body:', rawText)
      erro = { detail: `Erro no servidor (Status ${res.status})` }
    }

    // Auto-logout se o token estiver inválido/expirado (401 ou 403)
    if ((res.status === 401 || res.status === 403) && typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/admin')) {
        if (window.location.pathname !== '/admin/login') {
          localStorage.removeItem('padaria-admin-auth')
          window.location.href = '/admin/login'
        }
      } else {
        localStorage.removeItem('padaria-auth')
        // window.location.href = '/' // (opcional para cliente)
      }
    }

    const errorObj: any = new Error(erro.detail || 'Erro na API')
    errorObj.status = res.status
    errorObj.data = erro
    throw errorObj
  }

  // DELETE retorna 204 sem body
  if (res.status === 204) return null

  return res.json()
}

// ── Conversor snake_case → camelCase para Produto ──────────

function normalizarProduto(p: any) {
  return {
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    preco: parseFloat(p.preco),
    categoriaId: p.categoria_id,
    imagem: p.imagem || null,
    destaque: p.destaque ?? false,
    esgotado: p.esgotado ?? false,
    ativo: p.ativo ?? true,
  }
}

function normalizarPedido(p: any) {
  return {
    id: p.id,
    numeroPedido: p.numero_pedido,
    status: p.status,
    formaPagamento: p.forma_pagamento,
    subtotal: parseFloat(p.subtotal),
    taxaEntrega: parseFloat(p.taxa_entrega),
    total: parseFloat(p.total),
    criadoEm: p.criado_em,
    observacoes: p.observacoes ?? null,
    troco_para: p.troco_para ?? null,
    cliente: {
      nome: p.cliente_nome,
      whatsapp: p.cliente_whatsapp,
      tipoEntrega: p.tipo_entrega,
      endereco: p.endereco_entrega
        ? {
          rua: p.endereco_entrega.rua,
          numero: p.endereco_entrega.numero,
          complemento: p.endereco_entrega.complemento,
          bairro: p.endereco_entrega.bairro,
          cidade: p.endereco_entrega.cidade ?? null,
          cep: p.endereco_entrega.cep ?? null,
          referencia: p.endereco_entrega.referencia,
        }
        : undefined,
    },
    itens: (p.itens ?? []).map((item: any) => ({
      quantidade: item.quantidade,
      produto: {
        id: item.produto_id,
        nome: item.nome_produto,
        preco: parseFloat(item.preco_unitario),
      },
    })),
    historico: (p.historico ?? []).map((h: any) => ({
      status: h.status_novo,
      alteradoEm: h.alterado_em,
    })),
  }
}

// ============================================================
// API PÚBLICA (sem autenticação)
// ============================================================

export const api = {
  // ── Configurações do estabelecimento ──
  async getConfig() {
    return apiFetch('/config/')
  },

  async getPatrocinadores() {
    return apiFetch('/patrocinadores/')
  },

  // ── Cardápio ──
  async getCategorias() {
    const ts = Date.now()
    return apiFetch(`/categorias/?t=${ts}`, { cache: 'no-store' })
  },

  async getProdutos(categoriaId?: string) {
    const ts = Date.now()
    const qs = categoriaId ? `?categoria=${categoriaId}&t=${ts}` : `?t=${ts}`
    const data = await apiFetch(`/produtos/${qs}`, { cache: 'no-store' })
    return data.map(normalizarProduto)
  },

  // ── Rastreio de pedido (público) ──
  async getPedido(numero: string | number) {
    const ts = Date.now()
    // Try by numero_pedido first (short URL), fallback to UUID
    const isUUID = typeof numero === 'string' && numero.includes('-')
    const path = isUUID ? `/pedidos/${numero}/?t=${ts}` : `/pedidos/numero/${numero}/?t=${ts}`
    const data = await apiFetch(path, { cache: 'no-store' })
    return normalizarPedido(data)
  },

  // ============================================================
  // AUTH DO CLIENTE
  // ============================================================

  async cadastrarCliente(dados: {
    nome: string
    whatsapp: string
    cpf: string
  }) {
    return apiFetch('/auth/cliente/cadastro/', {
      method: 'POST',
      body: JSON.stringify(dados),
    })
  },

  async loginCliente(whatsapp: string, cpf: string) {
    return apiFetch('/auth/cliente/login/', {
      method: 'POST',
      body: JSON.stringify({ whatsapp, cpf }),
    })
  },

  async logoutCliente() {
    const token = getClienteToken()
    return apiFetch(
      '/auth/cliente/logout/',
      { method: 'POST', body: JSON.stringify({}) },
      token
    )
  },

  async getPerfilCliente() {
    const token = getClienteToken()
    return apiFetch('/auth/cliente/perfil/', {}, token)
  },

  async atualizarPerfilCliente(dados: { nome: string; whatsapp: string; cpf: string }) {
    const token = getClienteToken()
    return apiFetch(
      '/auth/cliente/perfil/',
      {
        method: 'PATCH',
        body: JSON.stringify(dados),
      },
      token
    )
  },

  async getEnderecosCliente() {
    const token = getClienteToken()
    return apiFetch('/clientes/enderecos/', {}, token)
  },

  async criarEnderecoCliente(dados: any) {
    const token = getClienteToken()
    return apiFetch(
      '/clientes/enderecos/',
      { method: 'POST', body: JSON.stringify(dados) },
      token
    )
  },

  async setEnderecoPrincipalCliente(id: string) {
    const token = getClienteToken()
    return apiFetch(
      `/clientes/enderecos/${id}/principal/`,
      { method: 'PATCH' },
      token
    )
  },

  async atualizarEnderecoCliente(id: string, dados: any) {
    const token = getClienteToken()
    return apiFetch(
      `/clientes/enderecos/${id}/`,
      { method: 'PUT', body: JSON.stringify(dados) },
      token
    )
  },

  async excluirEnderecoCliente(id: string) {
    const token = getClienteToken()
    return apiFetch(
      `/clientes/enderecos/${id}/`,
      { method: 'DELETE' },
      token
    )
  },

  // ── Pedido do cliente ──
  async criarPedido(dados: any, token: string) {
    return apiFetch(
      '/pedidos/',
      {
        method: 'POST',
        body: JSON.stringify(dados),
      },
      token
    )
  },

  async getPedidosCliente() {
    const token = getClienteToken()
    const data = await apiFetch('/pedidos/meus/', {}, token)
    return data.map(normalizarPedido)
  },

  // ============================================================
  // AUTH DO ADMIN
  // ============================================================

  async loginAdmin(username: string, password: string) {
    return apiFetch('/auth/token/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },

  // ── Dashboard ──
  async getDashboard(periodo?: string) {
    const token = getAdminToken()
    const ts = Date.now()
    const url = periodo ? `/admin/dashboard/?periodo=${periodo}&t=${ts}` : `/admin/dashboard/?t=${ts}`
    return apiFetch(url, { cache: 'no-store' }, token)
  },

  // ── Patrocinadores (Admin) ──
  async getPatrocinadoresAdmin() {
    const token = getAdminToken()
    return apiFetch('/admin/patrocinadores/', {}, token)
  },
  async criarPatrocinador(formData: FormData) {
    const token = getAdminToken()
    const res = await fetch(`${API_URL}/admin/patrocinadores/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })
    if (!res.ok) throw await res.json()
    return res.json()
  },
  async atualizarPatrocinador(id: string, formData: FormData) {
    const token = getAdminToken()
    const res = await fetch(`${API_URL}/admin/patrocinadores/${id}/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })
    if (!res.ok) throw await res.json()
    return res.json()
  },
  async excluirPatrocinador(id: string) {
    const token = getAdminToken()
    return apiFetch(`/admin/patrocinadores/${id}/`, { method: 'DELETE' }, token)
  },

  // ── Pedidos Admin ──
  async getPedidosAdmin(statusFiltro?: string, periodo?: string) {
    const token = getAdminToken()
    const params = new URLSearchParams()
    if (statusFiltro) params.append('status', statusFiltro)
    if (periodo) params.append('periodo', periodo)
    params.append('t', Date.now().toString())

    const qs = params.toString() ? `?${params.toString()}` : ''

    const data = await apiFetch(`/admin/pedidos/${qs}`, { cache: 'no-store' }, token)
    return data.map(normalizarPedido)
  },

  async moverStatusPedido(id: string, status: string, enviarWhatsapp?: boolean) {
    const token = getAdminToken()
    const data = await apiFetch(
      `/admin/pedidos/${id}/status/`,
      { method: 'PATCH', body: JSON.stringify({ status, enviar_whatsapp: enviarWhatsapp }) },
      token
    )
    return normalizarPedido(data)
  },

  // ── Produtos Admin ──
  async getProdutosAdmin() {
    const token = getAdminToken()
    const data = await apiFetch('/admin/produtos/', {}, token)
    return data.map(normalizarProduto)
  },

  async criarProduto(dados: any) {
    const token = getAdminToken()

    let body: any
    if (dados.imagemFile instanceof File) {
      const formData = new FormData()
      formData.append('nome', dados.nome)
      formData.append('descricao', dados.descricao)
      formData.append('preco', dados.preco)
      formData.append('categoria', dados.categoriaId)
      formData.append('destaque', String(dados.destaque ?? false))
      formData.append('esgotado', String(dados.esgotado ?? false))
      formData.append('ativo', String(dados.ativo ?? true))
      formData.append('imagem', dados.imagemFile)
      body = formData
    } else {
      body = JSON.stringify({
        nome: dados.nome,
        descricao: dados.descricao,
        preco: dados.preco,
        categoria: dados.categoriaId,
        destaque: dados.destaque ?? false,
        esgotado: dados.esgotado ?? false,
        ativo: dados.ativo ?? true,
      })
    }

    const data = await apiFetch('/admin/produtos/', { method: 'POST', body }, token)
    return normalizarProduto(data)
  },

  async editarProduto(id: string, dados: any) {
    const token = getAdminToken()

    let body: any
    if (dados.imagemFile instanceof File || dados.imagemFile === null) {
      const formData = new FormData()
      if (dados.nome !== undefined) formData.append('nome', dados.nome)
      if (dados.descricao !== undefined) formData.append('descricao', dados.descricao)
      if (dados.preco !== undefined) formData.append('preco', dados.preco)
      if (dados.categoriaId !== undefined) formData.append('categoria', dados.categoriaId)
      if (dados.destaque !== undefined) formData.append('destaque', String(dados.destaque))
      if (dados.esgotado !== undefined) formData.append('esgotado', String(dados.esgotado))
      if (dados.ativo !== undefined) formData.append('ativo', String(dados.ativo))

      if (dados.imagemFile instanceof File) {
        formData.append('imagem', dados.imagemFile)
      } else if (dados.imagemFile === null) {
        formData.append('imagem', '') // Para apagar a imagem
      }
      body = formData
    } else {
      const payload: any = {}
      if (dados.nome !== undefined) payload.nome = dados.nome
      if (dados.descricao !== undefined) payload.descricao = dados.descricao
      if (dados.preco !== undefined) payload.preco = dados.preco
      if (dados.categoriaId !== undefined) payload.categoria = dados.categoriaId
      if (dados.destaque !== undefined) payload.destaque = dados.destaque
      if (dados.esgotado !== undefined) payload.esgotado = dados.esgotado
      if (dados.ativo !== undefined) payload.ativo = dados.ativo
      body = JSON.stringify(payload)
    }

    const data = await apiFetch(`/admin/produtos/${id}/`, { method: 'PUT', body }, token)
    return normalizarProduto(data)
  },

  async deletarProduto(id: string) {
    const token = getAdminToken()
    return apiFetch(`/admin/produtos/${id}/`, { method: 'DELETE' }, token)
  },

  async toggleEsgotadoAdmin(id: string) {
    const token = getAdminToken()
    return apiFetch(
      `/admin/produtos/${id}/toggle-esgotado/`,
      { method: 'PATCH', body: JSON.stringify({}) },
      token
    )
  },

  // ── Config Admin ──
  async getConfigAdmin() {
    const token = getAdminToken()
    return apiFetch('/admin/config/', {}, token)
  },

  async atualizarConfigAdmin(dados: any) {
    const token = getAdminToken()
    return apiFetch(
      '/admin/config/',
      { method: 'PUT', body: JSON.stringify(dados) },
      token
    )
  },

  // ── Clientes Admin ──
  async getClientesAdmin() {
    const token = getAdminToken()
    const data = await apiFetch('/admin/clientes/', {}, token)
    return data.map((c: any) => ({
      id: c.id,
      nome: c.nome,
      whatsapp: c.whatsapp,
      cpf: c.cpf,
      totalPedidos: c.total_pedidos,
      totalGasto: parseFloat(c.total_gasto || '0'),
      ultimoPedido: c.ultimo_pedido,
      criadoEm: c.criado_em,
    }))
  },
}
