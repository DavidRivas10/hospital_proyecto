export type Urgencia = 1 | 2 | 3;

export type TriageTicket = {
  id: string;
  patientId: string;
  sintomas: string;
  signosVitales?: {
    FC?: number;
    FR?: number;
    TA?: string;
    Temp?: number;
    SpO2?: number;
  };
  urgencia: Urgencia;
  llegadaAt: string;
  arrivalSeq: number;
  estado: "waiting" | "in_service" | "done";
};

export type QueueSnapshot = {
  items: TriageTicket[];
  size: number;
};
