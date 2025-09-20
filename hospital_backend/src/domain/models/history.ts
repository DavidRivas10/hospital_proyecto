export type HistoryItem = {
  id?: string;
  type: "TRIAGE_CREATED" | "URGENCY_UPDATED" | "QUEUE_NEXT";
  at?: Date; // default en DB
  ticket?: {
    id?: string;
    patientId?: string;
    urgencia?: number;
  };
  prevUrgencia?: number;
  newUrgencia?: number;
};
