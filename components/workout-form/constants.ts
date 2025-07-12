// Grupos musculares disponibles
export const MUSCLE_GROUPS = [
  "Pecho",
  "Espalda",
  "Deltoides anterior",
  "Deltoides medio",
  "Deltoides posterior",
  "Bíceps",
  "Tríceps",
  "Antebrazos",
  "Cuádriceps",
  "Isquiotibiales",
  "Glúteo",
  "Gemelos",
  "Abductores",
  "Abdominales",
  "Oblicuos",
]

// Ejercicios predefinidos con grupos musculares
export const DEFAULT_EXERCISES = [
  // PECHO
  { name: "Press de banca con barra", muscle_group: "Pecho" },
  { name: "Press de banca con mancuernas", muscle_group: "Pecho" },
  { name: "Press inclinado con barra", muscle_group: "Pecho" },
  { name: "Press inclinado con mancuernas", muscle_group: "Pecho" },
  { name: "Press declinado con barra", muscle_group: "Pecho" },
  { name: "Aperturas con mancuernas", muscle_group: "Pecho" },
  { name: "Aperturas en polea", muscle_group: "Pecho" },
  { name: "Cruces en máquina", muscle_group: "Pecho" },
  { name: "Push-ups", muscle_group: "Pecho" },

  // ESPALDA
  { name: "Dominadas", muscle_group: "Espalda" },
  { name: "Dominadas con agarre ancho", muscle_group: "Espalda" },
  { name: "Dominadas con agarre cerrado", muscle_group: "Espalda" },
  { name: "Pull-ups", muscle_group: "Espalda" },
  { name: "Remo con barra", muscle_group: "Espalda" },
  { name: "Remo con mancuernas", muscle_group: "Espalda" },
  { name: "Remo en polea baja", muscle_group: "Espalda" },
  { name: "Remo en máquina", muscle_group: "Espalda" },
  { name: "Jalones al pecho", muscle_group: "Espalda" },
  { name: "Jalones tras nuca", muscle_group: "Espalda" },

  // DELTOIDES ANTERIOR
  { name: "Press militar con barra", muscle_group: "Deltoides anterior" },
  { name: "Press militar con mancuernas", muscle_group: "Deltoides anterior" },
  { name: "Elevaciones frontales con mancuernas", muscle_group: "Deltoides anterior" },

  // DELTOIDES MEDIO
  { name: "Elevaciones laterales con mancuernas", muscle_group: "Deltoides medio" },
  { name: "Elevaciones laterales en polea", muscle_group: "Deltoides medio" },
  { name: "Press tras nuca", muscle_group: "Deltoides medio" },

  // DELTOIDES POSTERIOR
  { name: "Pájaros con mancuernas", muscle_group: "Deltoides posterior" },
  { name: "Pájaros en máquina", muscle_group: "Deltoides posterior" },
  { name: "Remo al mentón", muscle_group: "Deltoides posterior" },
  { name: "Face pulls", muscle_group: "Deltoides posterior" },

  // BÍCEPS
  { name: "Curl de bíceps con barra", muscle_group: "Bíceps" },
  { name: "Curl de bíceps con mancuernas", muscle_group: "Bíceps" },
  { name: "Curl martillo", muscle_group: "Bíceps" },
  { name: "Curl concentrado", muscle_group: "Bíceps" },
  { name: "Curl en polea", muscle_group: "Bíceps" },
  { name: "Curl predicador", muscle_group: "Bíceps" },

  // TRÍCEPS
  { name: "Press francés", muscle_group: "Tríceps" },
  { name: "Extensiones de tríceps", muscle_group: "Tríceps" },
  { name: "Extensiones tras nuca", muscle_group: "Tríceps" },
  { name: "Patadas de tríceps", muscle_group: "Tríceps" },
  { name: "Fondos para tríceps", muscle_group: "Tríceps" },
  { name: "Press cerrado", muscle_group: "Tríceps" },

  // ANTEBRAZOS
  { name: "Curl de muñeca", muscle_group: "Antebrazos" },
  { name: "Curl inverso", muscle_group: "Antebrazos" },

  // CUÁDRICEPS
  { name: "Sentadillas", muscle_group: "Cuádriceps" },
  { name: "Sentadillas frontales", muscle_group: "Cuádriceps" },
  { name: "Sentadillas búlgaras", muscle_group: "Cuádriceps" },
  { name: "Prensa de piernas", muscle_group: "Cuádriceps" },
  { name: "Extensiones de cuádriceps", muscle_group: "Cuádriceps" },
  { name: "Zancadas", muscle_group: "Cuádriceps" },
  { name: "Zancadas laterales", muscle_group: "Cuádriceps" },

  // ISQUIOTIBIALES
  { name: "Curl femoral", muscle_group: "Isquiotibiales" },
  { name: "Curl femoral acostado", muscle_group: "Isquiotibiales" },
  { name: "Curl femoral de pie", muscle_group: "Isquiotibiales" },
  { name: "Peso muerto", muscle_group: "Isquiotibiales" },
  { name: "Peso muerto rumano", muscle_group: "Isquiotibiales" },
  { name: "Buenos días", muscle_group: "Isquiotibiales" },

  // GLÚTEO
  { name: "Sentadilla sumo", muscle_group: "Glúteo" },
  { name: "Hip thrust", muscle_group: "Glúteo" },
  { name: "Puente de glúteo", muscle_group: "Glúteo" },
  { name: "Peso muerto sumo", muscle_group: "Glúteo" },
  { name: "Patadas de glúteo", muscle_group: "Glúteo" },
  { name: "Patadas de glúteo en polea", muscle_group: "Glúteo" },

  // GEMELOS
  { name: "Elevaciones de gemelos de pie", muscle_group: "Gemelos" },
  { name: "Elevaciones de gemelos sentado", muscle_group: "Gemelos" },
  { name: "Elevaciones en prensa", muscle_group: "Gemelos" },

  // ABDUCTORES
  { name: "Abducción de cadera", muscle_group: "Abductores" },
  { name: "Patadas laterales", muscle_group: "Abductores" },

  // ABDOMINALES
  { name: "Crunches", muscle_group: "Abdominales" },
  { name: "Abdominales en máquina", muscle_group: "Abdominales" },
  { name: "Plancha", muscle_group: "Abdominales" },
  { name: "Plancha lateral", muscle_group: "Abdominales" },
  { name: "Elevaciones de piernas", muscle_group: "Abdominales" },
  { name: "Mountain climbers", muscle_group: "Abdominales" },

  // OBLICUOS
  { name: "Crunches oblicuos", muscle_group: "Oblicuos" },
  { name: "Bicicleta", muscle_group: "Oblicuos" },
  { name: "Russian twists", muscle_group: "Oblicuos" },
  { name: "Leñador", muscle_group: "Oblicuos" },

]
