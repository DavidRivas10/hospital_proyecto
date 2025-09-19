export type Urgencia = 1 | 2 | 3;

export interface TriageTicket {
  id: string;             // aquí guardaremos el _id de Mongo como string
  patientId: string;
  sintomas: string;
  signosVitales?: { FC?: number; FR?: number; TA?: string; Temp?: number; SpO2?: number };
  urgencia: Urgencia;
  llegadaAt: string;      // ISO string en el servicio
  arrivalSeq: number;     // prioridad FIFO interna
  estado: "waiting" | "in_service" | "done";
}
