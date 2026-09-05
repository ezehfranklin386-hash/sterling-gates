export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      const newKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      newObj[newKey] = toCamelCase(obj[key]);
    }
    return newObj;
  }

  return obj;
}

export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      const newKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      newObj[newKey] = toSnakeCase(obj[key]);
    }
    return newObj;
  }

  return obj;
}
