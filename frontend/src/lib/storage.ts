import { User, Team, Worker, WorkRecord, EquipmentRecord } from '@/types';

// 런타임에 API URL 동적으로 결정 (매번 호출 시점에 결정)
// ngrok 사용 시 자동으로 /api 프록시 사용
const getApiUrl = (): string => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  // 로컬 개발 환경
  if (isLocalhost) {
    // 환경 변수가 설정되어 있으면 사용
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    return 'http://localhost:8000';
  }
  
  // 외부 접근 (ngrok 등) - Nginx 프록시 사용
  // nginx.conf에 /api 프록시가 설정되어 있으면 이것을 사용
  // 하나의 ngrok 터널만 필요하고 CORS 문제도 없음
  return '/api';
};

// 함수로 만들어서 매번 호출 시점에 결정
const getApiUrlValue = () => {
  const url = getApiUrl();
  // 디버깅용 (개발 환경에서만)
  if (import.meta.env.DEV) {
    console.log('[API] Using API URL:', url);
  }
  return url;
};

const STORAGE_KEYS = {
  CURRENT_USER: 'construction_current_user',
  ACCESS_TOKEN: 'construction_access_token',
  TEAMS_CACHE: 'construction_teams_cache',
};

// Initialize
export const initializeStorage = () => {
  // No longer needed for default data as it's server-managed
  // But we can initialize empty localStorage if needed
};

// Helper function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
};

// Helper function for API calls with automatic token refresh
const apiCall = async (
  endpoint: string,
  method: string = 'GET',
  body?: any,
  requiresAuth: boolean = true
): Promise<any> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        // Token expired, clear storage and redirect to login
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        throw new Error('Token expired. Please login again.');
      }
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      throw new Error('No authentication token found');
    }
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const apiUrl = getApiUrlValue();
  const response = await fetch(`${apiUrl}${endpoint}`, options);

    if (!response.ok) {
      // Handle 401 Unauthorized (token expired or invalid)
      if (response.status === 401) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        throw new Error('Authentication failed. Please login again.');
      }
      
      const error = await response.json().catch(() => ({ 
        detail: `API Error: ${response.status} ${response.statusText}` 
      }));
      throw new Error(error.detail || `API Error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

// User operations
export const getUsers = async (): Promise<User[]> => {
  return apiCall('/users');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!userStr) return null;
  const user = JSON.parse(userStr);
  // Ensure camelCase conversion for stored user (backward compatibility)
  return {
    ...user,
    teamId: user.teamId || user.team_id,
    teamName: user.teamName || user.team_name
  };
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// export const login = async (email: string, password: string): Promise<User | null> => {
//   try {
//     const response = await apiCall(
//       '/auth/login',
//       'POST',
//       { email, password },
//       false
//     );

//     if (response.access_token && response.user) {
//       localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
//       setCurrentUser(response.user);
//       return response.user;
//     }
//     return null;
//   } catch (error) {
//     console.error('Login error:', error);
//     return null;
//   }
// };

// Helper function to convert User from snake_case to camelCase
const convertUser = (user: any): User => ({
  id: user.id,
  email: user.email,
  password: '', // Don't store password
  role: user.role,
  teamId: user.team_id,
  teamName: user.team_name
});

export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    const response = await apiCall(
      '/auth/login',
      'POST',
      { email, password },
      false
    );

    if (response.access_token && response.user) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
      // Convert snake_case to camelCase
      const user = convertUser(response.user);
      setCurrentUser(user);
      return user;
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  setCurrentUser(null);
};

// Team operations
export const getTeams = async (): Promise<Team[]> => {
  try {
    // Try to get from API
    return await apiCall('/teams');
  } catch (error) {
    // Fallback to local cache if API fails
    const cached = localStorage.getItem(STORAGE_KEYS.TEAMS_CACHE);
    return cached ? JSON.parse(cached) : [];
  }
};

// Worker operations
export const getWorkers = async (teamId?: string): Promise<Worker[]> => {
  try {
    let workers: any[];
    if (teamId) {
      workers = await apiCall(`/workers?team_id=${teamId}`);
    } else {
      workers = await apiCall('/workers');
    }
    // Convert snake_case to camelCase
    return workers.map(convertWorker);
  } catch (error) {
    console.error('Error fetching workers:', error);
    return [];
  }
};

export const addWorker = async (worker: Omit<Worker, 'id'>): Promise<Worker> => {
  // Backend expects team_id (snake_case), not teamId (camelCase)
  const response = await apiCall('/workers', 'POST', {
    name: worker.name,
    team_id: worker.teamId
  });
  // Convert response from snake_case to camelCase
  return convertWorker(response);
};

export const updateWorker = async (id: string, updates: Partial<Worker>) => {
  // Note: Backend doesn't have update endpoint for workers yet
  console.warn('Worker update not implemented in backend');
};

export const deleteWorker = async (id: string) => {
  return apiCall(`/workers/${id}`, 'DELETE');
};

// Work record operations
// Helper function to convert snake_case API response to camelCase
const convertWorkRecord = (record: any): WorkRecord => ({
  id: record.id,
  workerId: record.worker_id,
  workerName: record.worker_name,
  siteName: record.site_name,
  workDate: record.work_date,
  workHours: record.work_hours,
  notes: record.notes,
  teamId: record.team_id,
  createdBy: record.created_by,
  createdAt: record.created_at,
  updatedAt: record.updated_at
});

// Helper function to convert EquipmentRecord from snake_case to camelCase
const convertEquipmentRecord = (record: any): EquipmentRecord => ({
  id: record.id,
  workDate: record.work_date,
  siteName: record.site_name,
  equipmentType: record.equipment_type,
  quantity: record.quantity,
  teamId: record.team_id,
  createdBy: record.created_by,
  createdAt: record.created_at,
  updatedAt: record.updated_at
});

// Helper function to convert Worker from snake_case to camelCase
const convertWorker = (worker: any): Worker => ({
  id: worker.id,
  name: worker.name,
  teamId: worker.team_id
});

export const getWorkRecords = async (teamId?: string): Promise<WorkRecord[]> => {
  try {
    let records: any[];
    if (teamId) {
      records = await apiCall(`/work-records?team_id=${teamId}`);
    } else {
      records = await apiCall('/work-records');
    }
    // Convert snake_case to camelCase
    return records.map(convertWorkRecord);
  } catch (error) {
    console.error('Error fetching work records:', error);
    return [];
  }
};

export const addWorkRecord = async (
  record: Omit<WorkRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<WorkRecord> => {
  // Backend expects snake_case, convert from camelCase
  const response = await apiCall('/work-records', 'POST', {
    worker_id: record.workerId,
    worker_name: record.workerName,
    site_name: record.siteName,
    work_date: record.workDate,
    work_hours: record.workHours,
    notes: record.notes || null,
    team_id: record.teamId,
    created_by: record.createdBy
  });
  // Convert response from snake_case to camelCase
  return convertWorkRecord(response);
};

export const updateWorkRecord = async (
  id: string,
  updates: Partial<WorkRecord>
) => {
  // Backend expects snake_case, convert from camelCase
  const backendUpdates: any = {};
  if (updates.workerId !== undefined) backendUpdates.worker_id = updates.workerId;
  if (updates.workerName !== undefined) backendUpdates.worker_name = updates.workerName;
  if (updates.siteName !== undefined) backendUpdates.site_name = updates.siteName;
  if (updates.workHours !== undefined) backendUpdates.work_hours = updates.workHours;
  if (updates.notes !== undefined) backendUpdates.notes = updates.notes || null;
  
  const response = await apiCall(`/work-records/${id}`, 'PUT', backendUpdates);
  // Convert response from snake_case to camelCase
  return convertWorkRecord(response);
};

export const deleteWorkRecord = async (id: string) => {
  return apiCall(`/work-records/${id}`, 'DELETE');
};

export const getWorkRecordsByDate = async (
  date: string,
  teamId?: string
): Promise<WorkRecord[]> => {
  try {
    let records: any[];
    if (teamId) {
      records = await apiCall(`/work-records?team_id=${teamId}&work_date=${date}`);
    } else {
      records = await apiCall(`/work-records?work_date=${date}`);
    }
    // Convert snake_case to camelCase
    return records.map(convertWorkRecord);
  } catch (error) {
    console.error('Error fetching work records by date:', error);
    return [];
  }
};

export const getLastWorkRecord = async (teamId: string): Promise<WorkRecord | null> => {
  try {
    const records = await getWorkRecordsByDate('', teamId);
    if (records.length === 0) return null;
    return records.sort(
      (a, b) =>
        new Date(b.workDate).getTime() - new Date(a.workDate).getTime()
    )[0];
  } catch (error) {
    console.error('Error fetching last work record:', error);
    return null;
  }
};

export const getLastWorkRecords = async (teamId: string): Promise<WorkRecord[]> => {
  try {
    const records = await getWorkRecords(teamId);
    if (records.length === 0) return [];
    
    // 날짜별로 정렬하여 최근 날짜 찾기
    const sorted = records.sort(
      (a, b) =>
        new Date(b.workDate).getTime() - new Date(a.workDate).getTime()
    );
    
    if (sorted.length === 0) return [];
    
    // 최근 날짜
    const lastDate = sorted[0].workDate;
    
    // 같은 날짜의 모든 레코드 반환
    return sorted.filter(r => r.workDate === lastDate);
  } catch (error) {
    console.error('Error fetching last work records:', error);
    return [];
  }
};

// Equipment record operations
export const getEquipmentRecords = async (teamId?: string): Promise<EquipmentRecord[]> => {
  try {
    let records: any[];
    if (teamId) {
      records = await apiCall(`/equipment-records?team_id=${teamId}`);
    } else {
      records = await apiCall('/equipment-records');
    }
    // Convert snake_case to camelCase
    return records.map(convertEquipmentRecord);
  } catch (error) {
    console.error('Error fetching equipment records:', error);
    return [];
  }
};

export const addEquipmentRecord = async (
  record: Omit<EquipmentRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<EquipmentRecord> => {
  // Backend expects snake_case, convert from camelCase
  const response = await apiCall('/equipment-records', 'POST', {
    work_date: record.workDate,
    site_name: record.siteName,
    equipment_type: record.equipmentType,
    quantity: record.quantity,
    team_id: record.teamId,
    created_by: record.createdBy
  });
  // Convert response from snake_case to camelCase
  return convertEquipmentRecord(response);
};

export const updateEquipmentRecord = async (
  id: string,
  updates: Partial<EquipmentRecord>
) => {
  const backendUpdates: any = {};
  
  if (updates.workDate !== undefined) {
    backendUpdates.work_date = updates.workDate;
  }
  if (updates.siteName !== undefined) {
    backendUpdates.site_name = updates.siteName;
  }
  if (updates.equipmentType !== undefined) {
    backendUpdates.equipment_type = updates.equipmentType;
  }
  if (updates.quantity !== undefined) {
    backendUpdates.quantity = updates.quantity;
  }
  
  const response = await apiCall(`/equipment-records/${id}`, 'PUT', backendUpdates);
  return convertEquipmentRecord(response);
};

export const deleteEquipmentRecord = async (id: string) => {
  return apiCall(`/equipment-records/${id}`, 'DELETE');
};

export const getEquipmentRecordsByDate = async (
  date: string,
  teamId?: string
): Promise<EquipmentRecord[]> => {
  try {
    let records: any[];
    if (teamId) {
      records = await apiCall(`/equipment-records?team_id=${teamId}&work_date=${date}`);
    } else {
      records = await apiCall(`/equipment-records?work_date=${date}`);
    }
    // Convert snake_case to camelCase
    return records.map(convertEquipmentRecord);
  } catch (error) {
    console.error('Error fetching equipment records by date:', error);
    return [];
  }
};

export const getLastEquipmentRecords = async (
  teamId: string
): Promise<EquipmentRecord[]> => {
  try {
    const records = await getEquipmentRecords(teamId);
    if (records.length === 0) return [];
    const sorted = records.sort(
      (a, b) =>
        new Date(b.workDate).getTime() - new Date(a.workDate).getTime()
    );
    const lastDate = sorted[0].workDate;
    return sorted.filter(r => r.workDate === lastDate);
  } catch (error) {
    console.error('Error fetching last equipment records:', error);
    return [];
  }
};