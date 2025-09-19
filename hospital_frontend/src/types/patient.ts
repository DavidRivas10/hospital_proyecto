export type Sex = "M" | "F" | "O";

export type Patient = {
  id: string;
  docId: string;
  fullName: string;
  birthDate?: string; // ISO
  sex?: Sex;
  phone?: string;
  email?: string;
  address?: string;
  allergies: string[];
  chronicConditions: string[];
};
