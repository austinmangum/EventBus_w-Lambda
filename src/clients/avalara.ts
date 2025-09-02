export interface TaxLine { sku: string; qty: number; unitPrice: number; taxCode?: string; }
export interface ShipTo { line1: string; city: string; region: string; postal: string; }
export async function calcTax(lines: TaxLine[], shipTo: ShipTo) {
  if (process.env.AVALARA_STUB === 'true') {
    const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
    const totalTax = +(subtotal * 0.07).toFixed(2);
    return { totalTax, lines: lines.map(l => ({ sku: l.sku, tax: +(l.qty * l.unitPrice * 0.07).toFixed(2) })) };
  }
  // TODO: Avalara REST CreateTransaction impl
  const e: any = new Error('Avalara not implemented'); e.name = 'FatalTaxError'; throw e;
}
