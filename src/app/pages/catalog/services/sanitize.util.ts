/**
 * Sanitiza un valor que podría ser un objeto en lugar de un string.
 * La API puede devolver campos como { name: 'Marca' } en vez de 'Marca'.
 * Esta función extrae el texto legible del objeto.
 */
export function sanitizeValue(value: any, fallback: string = ''): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  // Ya es string
  if (typeof value === 'string') {
    return value;
  }

  // Es número o booleano
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  // Es un array
  if (Array.isArray(value)) {
    if (value.length === 0) return fallback;
    // Si el array contiene strings, únelos
    const strings = value.map(v => sanitizeValue(v));
    return strings.filter(s => s).join(', ') || fallback;
  }

  // Es un objeto: intenta extraer la propiedad más útil
  if (typeof value === 'object') {
    const priorityKeys = ['name', 'text', 'title', 'value', 'label', 'description'];
    for (const key of priorityKeys) {
      if (value[key] !== undefined && value[key] !== null) {
        const extracted = sanitizeValue(value[key]);
        if (extracted) return extracted;
      }
    }
    // Último recurso: convierte a JSON si es pequeño, o usa fallback
    const json = JSON.stringify(value);
    if (json.length <= 100 && json !== '{}') return json;
    return fallback;
  }

  return String(value);
}

/**
 * Sanitiza todos los campos string de un producto y normaliza su identificador.
 * Las APIs suelen devolver `_id` en lugar de `id` (MongoDB).
 */
export function sanitizeProduct(product: any): any {
  if (!product) return product;

  const stringFields = ['name', 'title', 'brand', 'category', 'description', 'material', 'technique', 'sku'];
  const sanitized: any = { ...product };

  // Normaliza id: prioriza id, luego _id, luego genera uno basado en sku/name
  if (sanitized.id === undefined || sanitized.id === null) {
    if (sanitized._id !== undefined && sanitized._id !== null) {
      sanitized.id = sanitized._id;
    } else if (sanitized.sku) {
      sanitized.id = sanitized.sku;
    } else {
      // Fallback: hash simple del nombre para evitar undefined
      sanitized.id = 'prod-' + (sanitized.name || Math.random().toString(36).slice(2, 9));
    }
  }

  for (const field of stringFields) {
    if (product[field] !== undefined && product[field] !== null) {
      sanitized[field] = sanitizeValue(product[field], '');
    }
  }

  return sanitized;
}
