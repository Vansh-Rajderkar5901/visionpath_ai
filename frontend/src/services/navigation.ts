import type {
  Building,
  Facility,
  Floor,
  GraphNode,
  NavigationDestination,
  NavigationHistoryEntry,
  NavigationRoute,
} from '@/types';
import { api } from './api';

export interface RouteQuery {
  /** A node id, a room name, or anything the server can resolve to a node. */
  from?: string;
  to?: string;
  fromLocationId?: number;
  toLocationId?: number;
  /** Set false for previews that should not appear in the user's history. */
  record?: boolean;
}

export const navigationService = {
  async getBuildings(): Promise<Building[]> {
    return api.get<Building[]>('/api/navigation/buildings');
  },

  async getBuilding(buildingCode: string): Promise<Building> {
    return api.get<Building>(`/api/navigation/buildings/${encodeURIComponent(buildingCode)}`);
  },

  async getFloors(buildingCode: string): Promise<Floor[]> {
    return api.get<Floor[]>(
      `/api/navigation/buildings/${encodeURIComponent(buildingCode)}/floors`
    );
  },

  async getDestinations(query?: string): Promise<NavigationDestination[]> {
    return api.get<NavigationDestination[]>('/api/navigation/destinations', {
      params: query ? { query } : undefined,
    });
  },

  async searchDestinations(query: string): Promise<NavigationDestination[]> {
    return this.getDestinations(query);
  },

  /** Every routable point — used to populate the "I am here" picker. */
  async getNodes(): Promise<GraphNode[]> {
    return api.get<GraphNode[]>('/api/navigation/nodes');
  },

  async getFacilities(
    buildingCode?: string,
    floorLevel?: number,
    type?: string
  ): Promise<Facility[]> {
    return api.get<Facility[]>('/api/navigation/facilities', {
      params: { buildingCode, floorLevel, type },
    });
  },

  async getNearbyWashrooms(buildingCode?: string, floorLevel?: number): Promise<Facility[]> {
    return this.getFacilities(buildingCode, floorLevel, 'washroom');
  },

  /** Shortest walking route, computed by the server over the campus graph. */
  async getRoute(query: RouteQuery): Promise<NavigationRoute> {
    return api.post<NavigationRoute>('/api/navigation/route', {
      fromNode: query.from,
      toNode: query.to,
      fromLocationId: query.fromLocationId,
      toLocationId: query.toLocationId,
      record: query.record ?? true,
    });
  },

  async getHistory(limit = 20): Promise<NavigationHistoryEntry[]> {
    return api.get<NavigationHistoryEntry[]>('/api/navigation/history', {
      params: { limit },
    });
  },
};
