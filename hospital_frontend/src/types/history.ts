export type Urgencia = 1 | 2 | 3;

export type HistoryEventType =
  | "enqueued"
  | "next"
  | "complete"
  | "reprioritize";

export type HistoryItem = {
  id: string;
  type: HistoryEventType;
  at: string; // ISO date
  ticket?: {
    id: string;
    patientId: string;
    urgencia: Urgencia;
  };
  // para reprioritize o campos extra
  prevUrgencia?: Urgencia;
  newUrgencia?: Urgencia;
};
