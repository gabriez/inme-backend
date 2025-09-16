import type { Client } from "@/database/entities/Client";

export interface GetClientsResponse {
  total: number;
  clients: Client[];
}
