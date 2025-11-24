/**
 * Diccionario de sinónimos para ingredientes comunes.
 * Si un ingrediente del usuario está en la lista de sinónimos de un ingrediente de la receta,
 * se consideran equivalentes.
 */
const SINONIMOS_INGREDIENTES = {
  "carne de vacuno": ["carne de res", "filete de res", "bistec de res", "res"],
  "carne de res": ["carne de vacuno", "filete de res", "bistec de res", "res"],
  "filete de res": ["carne de vacuno", "carne de res", "bistec de res", "res"],
  "bistec de res": ["carne de vacuno", "carne de res", "filete de res", "res"],
  "res": ["carne de vacuno", "carne de res", "filete de res", "bistec de res"],
  "cerdo": ["lomo de cerdo", "costillas de cerdo", "chuleta de cerdo"],
  "lomo de cerdo": ["cerdo", "costillas de cerdo", "chuleta de cerdo"],
  "costillas de cerdo": ["cerdo", "lomo de cerdo", "chuleta de cerdo"],
  "pollo": ["pechuga de pollo", "trutro de pollo", "muslo de pollo", "pierna de pollo"],
  "pechuga de pollo": ["pollo", "trutro de pollo", "muslo de pollo"],
  "trutro de pollo": ["pollo", "pechuga de pollo", "muslo de pollo"],
  "huevo": ["huevos"],
  "huevos": ["huevo"],
  "tomate": ["tomates"],
  "tomates": ["tomate"],
  "cebolla": ["cebollas"],
  "cebollas": ["cebolla"],
  "ajo": ["ajos"],
  "ajos": ["ajo"]
};

/**
 * Función que normaliza un ingrediente eliminando información innecesaria
 * como cantidades, unidades de medida y palabras comunes.
 * 
 * @param {string} nombre - Nombre completo del ingrediente (ej: "500 gramos de cerdo")
 * @returns {string} Ingrediente normalizado (ej: "cerdo")
 */
export function normalizarIngrediente(nombre) {
  if (typeof nombre !== 'string' || !nombre.trim()) {
    return '';
  }

  // Convertir a minúsculas
  let normalizado = nombre.toLowerCase();

  // Eliminar tildes (reemplazar por letras sin tilde)
  const tildes = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
    'Á': 'a', 'É': 'e', 'Í': 'i', 'Ó': 'o', 'Ú': 'u'
  };
  normalizado = normalizado.split('').map(letra => tildes[letra] || letra).join('');

  // Eliminar números (reemplazar por espacios)
  normalizado = normalizado.replace(/\d+/g, ' ');

  // Eliminar signos de puntuación comunes (reemplazar por espacios)
  normalizado = normalizado.replace(/[.,;:!?()[\]]/g, ' ');

  // Lista de palabras comunes que queremos eliminar
  const palabrasComunes = [
    'de', 'la', 'el', 'un', 'una', 'unos', 'unas',
    'para', 'en', 'con', 'sin', 'por', 'a',
    'gr', 'gramos', 'g', 'kg', 'kilos', 'kilogramos',
    'ml', 'mililitros', 'l', 'litros', 'lt',
    'cucharadas', 'cucharaditas', 'tazas', 'taza',
    'piezas', 'pieza', 'unidades', 'unidad',
    'filete', 'filetes', 'bistec', 'bistecs',
    'pechuga', 'pechugas', 'trutro', 'trutros',
    'muslo', 'muslos', 'pierna', 'piernas',
    'lomo', 'lomos', 'costilla', 'costillas', 'chuleta', 'chuletas'
  ];

  // Dividir en palabras, filtrar las comunes y unir de nuevo
  const palabras = normalizado.split(/\s+/).filter(palabra => {
    // Eliminar espacios vacíos y palabras comunes
    return palabra.trim() && !palabrasComunes.includes(palabra.trim());
  });

  // Unir las palabras restantes con espacios y quitar espacios extra
  normalizado = palabras.join(' ').trim();

  return normalizado;
}

/**
 * Función que determina si dos ingredientes son equivalentes.
 * Compara usando normalización y el diccionario de sinónimos.
 * 
 * @param {string} ingredienteUsuario - Ingrediente que tiene el usuario (ej: "Cerdo")
 * @param {string} ingredienteReceta - Ingrediente de la receta (ej: "500 gramos de cerdo")
 * @returns {boolean} true si se consideran equivalentes, false en caso contrario
 */
export function sonIngredientesEquivalentes(ingredienteUsuario, ingredienteReceta) {
  // Normalizar ambos ingredientes
  const usuarioNormalizado = normalizarIngrediente(ingredienteUsuario);
  const recetaNormalizado = normalizarIngrediente(ingredienteReceta);

  // Si alguno está vacío después de normalizar, no son equivalentes
  if (!usuarioNormalizado || !recetaNormalizado) {
    return false;
  }

  // Comparación 1: Si los nombres normalizados son exactamente iguales
  if (usuarioNormalizado === recetaNormalizado) {
    return true;
  }

  // Comparación 2: Si uno contiene al otro (para casos como "cerdo" y "cerdo molido")
  if (usuarioNormalizado.includes(recetaNormalizado) || recetaNormalizado.includes(usuarioNormalizado)) {
    return true;
  }

  // Comparación 3: Verificar sinónimos
  // Buscar en el diccionario si alguno de los dos ingredientes normalizados tiene sinónimos
  // y si el otro está en esa lista de sinónimos
  const usuarioOriginal = ingredienteUsuario.toLowerCase().trim();
  const recetaOriginal = ingredienteReceta.toLowerCase().trim();

  // Verificar si el ingrediente del usuario tiene sinónimos y la receta está en esa lista
  if (SINONIMOS_INGREDIENTES[usuarioOriginal]) {
    const sinonimosUsuario = SINONIMOS_INGREDIENTES[usuarioOriginal].map(s => s.toLowerCase().trim());
    if (sinonimosUsuario.includes(recetaOriginal)) {
      return true;
    }
    // También verificar si algún sinónimo normalizado coincide
    const sinonimosNormalizados = SINONIMOS_INGREDIENTES[usuarioOriginal].map(s => normalizarIngrediente(s));
    if (sinonimosNormalizados.includes(recetaNormalizado)) {
      return true;
    }
  }

  // Verificar si el ingrediente de la receta tiene sinónimos y el usuario está en esa lista
  if (SINONIMOS_INGREDIENTES[recetaOriginal]) {
    const sinonimosReceta = SINONIMOS_INGREDIENTES[recetaOriginal].map(s => s.toLowerCase().trim());
    if (sinonimosReceta.includes(usuarioOriginal)) {
      return true;
    }
    // También verificar si algún sinónimo normalizado coincide
    const sinonimosNormalizados = SINONIMOS_INGREDIENTES[recetaOriginal].map(s => normalizarIngrediente(s));
    if (sinonimosNormalizados.includes(usuarioNormalizado)) {
      return true;
    }
  }

  // Verificar también con los nombres normalizados como claves
  if (SINONIMOS_INGREDIENTES[usuarioNormalizado]) {
    const sinonimosNormalizados = SINONIMOS_INGREDIENTES[usuarioNormalizado].map(s => normalizarIngrediente(s));
    if (sinonimosNormalizados.includes(recetaNormalizado)) {
      return true;
    }
  }

  if (SINONIMOS_INGREDIENTES[recetaNormalizado]) {
    const sinonimosNormalizados = SINONIMOS_INGREDIENTES[recetaNormalizado].map(s => normalizarIngrediente(s));
    if (sinonimosNormalizados.includes(usuarioNormalizado)) {
      return true;
    }
  }

  // Si no se encontró ninguna coincidencia, no son equivalentes
  return false;
}

/**
 * Función que compara los ingredientes de una receta con los ingredientes
 * que el usuario ya tiene, y devuelve los que faltan.
 * Usa una lógica inteligente que considera normalización y sinónimos.
 * 
 * @param {Array<string>} ingredientesReceta - Array de strings con los ingredientes de la receta
 * @param {Array<string>} ingredientesUsuario - Array de strings con los ingredientes que tiene el usuario
 * @returns {Array<string>} Array con los ingredientes que faltan (están en la receta pero no en los del usuario)
 */
export function obtenerIngredientesFaltantes(ingredientesReceta, ingredientesUsuario) {
  // Si no hay ingredientes en la receta, no hay nada que comparar
  if (!ingredientesReceta || ingredientesReceta.length === 0) {
    return [];
  }

  // Si el usuario no tiene ingredientes, todos los de la receta faltan
  if (!ingredientesUsuario || ingredientesUsuario.length === 0) {
    return ingredientesReceta;
  }

  // Para cada ingrediente de la receta, verificar si el usuario tiene alguno equivalente
  const ingredientesFaltantes = ingredientesReceta.filter((ingredienteReceta) => {
    // Verificar si hay algún ingrediente del usuario que sea equivalente a este de la receta
    const tieneEquivalente = ingredientesUsuario.some((ingredienteUsuario) => {
      return sonIngredientesEquivalentes(ingredienteUsuario, ingredienteReceta);
    });

    // Si NO tiene equivalente, significa que falta
    return !tieneEquivalente;
  });

  return ingredientesFaltantes;
}
