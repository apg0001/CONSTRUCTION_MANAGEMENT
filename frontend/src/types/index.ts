export interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'manager';
  teamId?: string;
  teamName?: string;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
}

export interface Worker {
  id: string;
  name: string;
  teamId: string;
}

export interface WorkRecord {
  id: string;
  workerId: string;
  workerName: string;
  siteName: string;
  workDate: string;
  workHours: number;
  teamId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentRecord {
  id: string;
  workDate: string;
  siteName: string;
  equipmentType: string;
  quantity: number;
  teamId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type EquipmentType = '6w' | '3w' | '035' | '덤프' | '1t' | '3.5t' | '살수차' | '모범수';

export const EQUIPMENT_TYPES: EquipmentType[] = ['6w', '3w', '035', '덤프', '1t', '3.5t', '살수차', '모범수'];