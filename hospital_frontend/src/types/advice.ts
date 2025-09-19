export type Urgencia = 1 | 2 | 3;

export type Vitales = {
  FC?: number;  // frecuencia cardiaca
  FR?: number;  // frecuencia respiratoria
  TA?: string;  // "120/80"
  Temp?: number;
  SpO2?: number;
};

export type AdviceInput = {
  sintomas: string;     // texto libre
  vitales?: Vitales;    // opcional
};

export type AdviceOutput = {
  urgencia: Urgencia;   // sugerida (1 crítica, 2 urgente, 3 normal)
  reasons: string[];    // por qué
  recommendation: string; // recomendación textual (educativa, no diagnóstica)
};
