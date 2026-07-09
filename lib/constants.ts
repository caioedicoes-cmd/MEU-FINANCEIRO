import type { FinContext } from './types'

export const CATEGORIES: Record<FinContext, { IN: string[]; OUT: string[] }> = {
  CPF: {
    IN: ['Salário', 'Freelance', 'Rendimentos', 'Presente', 'Reembolso', 'Outros'],
    OUT: [
      'Moradia',
      'Alimentação',
      'Transporte',
      'Saúde',
      'Educação',
      'Lazer',
      'Compras',
      'Assinaturas',
      'Cartão de Crédito',
      'Outros',
    ],
  },
  CNPJ: {
    IN: ['Cliente', 'Serviço', 'Produto', 'Consultoria', 'Reembolso', 'Outros'],
    OUT: [
      'Fornecedor',
      'Impostos',
      'Salários',
      'Marketing',
      'Software',
      'Escritório',
      'Pró-labore',
      'Taxas',
      'Cartão de Crédito',
      'Outros',
    ],
  },
}

export function categoriesFor(context: FinContext, type: 'IN' | 'OUT'): string[] {
  return CATEGORIES[context][type]
}

export const CONTEXT_LABEL: Record<FinContext, string> = {
  CPF: 'Pessoal (CPF)',
  CNPJ: 'Empresa (CNPJ)',
}
