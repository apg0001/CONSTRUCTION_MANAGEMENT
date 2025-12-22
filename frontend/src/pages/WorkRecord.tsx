import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Edit, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import {
  getWorkRecordsByDate,
  getEquipmentRecordsByDate,
  deleteWorkRecord,
  deleteEquipmentRecord,
  getTeams,
  addWorkRecord,
  updateWorkRecord,
  addEquipmentRecord,
  updateEquipmentRecord,
} from '@/lib/storage';
import { WorkRecord, EquipmentRecord } from '@/types';
import { WorkRecordForm } from '@/components/WorkRecordForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { EQUIPMENT_TYPES, EquipmentType } from '@/types';

export default function WorkRecordPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [equipmentRecords, setEquipmentRecords] = useState<EquipmentRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WorkRecord | undefined>(undefined);
  const [editingEquipmentRecord, setEditingEquipmentRecord] = useState<EquipmentRecord | undefined>(undefined);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load teams
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamsData = await getTeams();
        setTeams(teamsData);
      } catch (error) {
        console.error('Error loading teams:', error);
        toast.error('팀 정보를 불러올 수 없습니다');
      }
    };
    loadTeams();
  }, []);

  // Set team ID when user loads or changes
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        // Admin: use selectedTeamId if set, otherwise use first team or empty
        if (!selectedTeamId && teams.length > 0) {
          setSelectedTeamId(teams[0].id);
        }
      } else {
        // Manager: always use their team ID
        if (user.teamId) {
          setSelectedTeamId(user.teamId);
        }
      }
    }
  }, [user, isAdmin, teams]);

  useEffect(() => {
    loadRecords();
  }, [selectedDate, selectedTeamId]);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const teamId = isAdmin ? selectedTeamId : user?.teamId;
      
      console.log('loadRecords - isAdmin:', isAdmin, 'selectedTeamId:', selectedTeamId, 'user?.teamId:', user?.teamId, 'teamId:', teamId, 'dateStr:', dateStr);
      
      if (teamId) {
        const works = await getWorkRecordsByDate(dateStr, teamId);
        const equipment = await getEquipmentRecordsByDate(dateStr, teamId);
        console.log('Loaded records - works:', works.length, 'equipment:', equipment.length, 'works sample:', works.slice(0, 2));
        setWorkRecords(works);
        setEquipmentRecords(equipment);
      } else {
        setWorkRecords([]);
        setEquipmentRecords([]);
      }
    } catch (error) {
      console.error('Error loading records:', error);
      toast.error('기록을 불러올 수 없습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, type: 'work' | 'equipment') => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        if (type === 'work') {
          await deleteWorkRecord(id);
        } else {
          await deleteEquipmentRecord(id);
        }
        await loadRecords();
        toast.success('삭제되었습니다');
      } catch (error) {
        console.error('Error deleting record:', error);
        toast.error('삭제 중 오류가 발생했습니다');
      }
    }
  };

  const handleEdit = (record: WorkRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleEditEquipment = (record: EquipmentRecord) => {
    setEditingEquipmentRecord(record);
    setShowEquipmentForm(true);
  };

  const handleSave = async (records: Omit<WorkRecord, 'id' | 'createdAt' | 'updatedAt'>[], equipmentData: Omit<EquipmentRecord, 'id' | 'createdAt' | 'updatedAt'>[], notes: string) => {
    // Manager는 자동으로 자신의 팀 ID 사용, Admin은 선택한 팀 ID 사용
    const teamId = isAdmin ? selectedTeamId : (user?.teamId || '');
    
    console.log('handleSave - isAdmin:', isAdmin, 'selectedTeamId:', selectedTeamId, 'user?.teamId:', user?.teamId, 'teamId:', teamId);
    
    if (!teamId) {
      if (isAdmin) {
        toast.error('팀을 선택해주세요');
      } else {
        toast.error('팀 정보를 불러올 수 없습니다. 다시 로그인해주세요.');
      }
      return;
    }

    const createdBy = user?.email || '';

    try {
      if (editingRecord) {
        // 수정 모드: 단일 레코드만 업데이트
        await updateWorkRecord(editingRecord.id, { ...records[0], teamId, createdBy, notes });
        toast.success('공수 기록이 수정되었습니다');
      } else {
        // 추가 모드: 여러 레코드 추가
        for (const record of records) {
          console.log('Adding work record with teamId:', teamId, 'record:', record);
          await addWorkRecord({ ...record, teamId, createdBy, notes });
        }
        
        // 장비 레코드 추가
        for (const equipment of equipmentData) {
          console.log('Adding equipment record with teamId:', teamId, 'equipment:', equipment);
          await addEquipmentRecord({ ...equipment, teamId, createdBy });
        }
        
        if (records.length > 0 && equipmentData.length > 0) {
          toast.success(`${records.length}명의 공수 기록과 장비 기록이 추가되었습니다`);
        } else if (records.length > 0) {
          toast.success(`${records.length}명의 공수 기록이 추가되었습니다`);
        } else if (equipmentData.length > 0) {
          toast.success('장비 기록이 추가되었습니다');
        }
      }
      
      handleFormClose();
      // 저장 후 레코드 다시 불러오기
      await loadRecords();
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error('저장 중 오류가 발생했습니다');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRecord(undefined);
    loadRecords();
  };

  const handleEquipmentFormClose = () => {
    setShowEquipmentForm(false);
    setEditingEquipmentRecord(undefined);
    loadRecords();
  };

  const handleSaveEquipment = async (updates: Partial<EquipmentRecord>) => {
    if (!editingEquipmentRecord) return;

    try {
      const teamId = isAdmin ? selectedTeamId : (user?.teamId || '');
      console.log('handleSaveEquipment - isAdmin:', isAdmin, 'selectedTeamId:', selectedTeamId, 'user?.teamId:', user?.teamId, 'teamId:', teamId);
      
      if (!teamId) {
        if (isAdmin) {
          toast.error('팀을 선택해주세요');
        } else {
          toast.error('팀 정보를 불러올 수 없습니다. 다시 로그인해주세요.');
        }
        return;
      }
      
      const createdBy = user?.email || '';
      const dateStr = selectedDate.toISOString().split('T')[0];
      const quantity = updates.quantity || 0;

      if (quantity <= 0) {
        toast.error('수량은 0보다 커야 합니다');
        return;
      }

      // 항상 추가 (백엔드에서 같은 날짜/같은 장비 타입이면 자동으로 누적)
      console.log('Adding equipment record with teamId:', teamId, 'updates:', updates);
      await addEquipmentRecord({
        workDate: dateStr,
        equipmentType: updates.equipmentType || editingEquipmentRecord.equipmentType,
        quantity,
        teamId,
        createdBy,
      });
      toast.success('장비 기록이 추가되었습니다');
      handleEquipmentFormClose();
    } catch (error) {
      console.error('Error saving equipment record:', error);
      toast.error('저장 중 오류가 발생했습니다');
    }
  };



  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  // 장비별로 그룹화 (같은 날짜/같은 장비 타입은 합산, 0인 경우 제외)
  const equipmentByType = EQUIPMENT_TYPES.map((equipType) => {
    const records = equipmentRecords.filter(r => r.equipmentType === equipType);
    const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
    return {
      equipmentType: equipType,
      totalQuantity,
      records,
    };
  }).filter(equip => equip.totalQuantity > 0); // 0인 경우 제외

  // 장비 추가 핸들러 (누적 합산)
  const handleEquipmentAdd = (equipmentType: EquipmentType) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const newRecord: EquipmentRecord = {
      id: '',
      workDate: dateStr,
      equipmentType,
      quantity: 0,
      teamId: isAdmin ? selectedTeamId : (user?.teamId || ''),
      createdBy: user?.email || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingEquipmentRecord(newRecord);
    setShowEquipmentForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-x-hidden w-full max-w-full">
      <div className="container mx-auto max-w-7xl px-2 sm:px-4 md:px-6 py-3 sm:py-6 w-full">
        <div className="flex flex-col gap-3 mb-4 sm:mb-6 w-full">
          <Button variant="ghost" onClick={() => navigate('/')} className="w-full sm:w-auto self-start">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">대시보드로 돌아가기</span>
            <span className="sm:hidden">돌아가기</span>
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center w-full">
            {isAdmin && (
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="팀 선택" />
                </SelectTrigger>
                <SelectContent 
                  position="popper" 
                  className="w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-1rem)] sm:max-w-none z-[100]"
                  sideOffset={4}
                >
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">공수 기록 추가</span>
              <span className="sm:hidden">추가</span>
            </Button>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6 w-full">
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">날짜 선택</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="date-select" className="text-sm">조회 날짜</Label>
                <Input
                  id="date-select"
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={handleDateChange}
                  className="w-full sm:max-w-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg break-words">
                {selectedDate.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })} 작업 기록
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 w-full">
              {workRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  기록된 작업이 없습니다
                </p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {workRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 w-full sm:w-auto">
                          <div>
                            <p className="text-xs sm:text-sm text-muted-foreground">작업자명</p>
                            <p className="font-medium text-sm sm:text-base break-words">{record.workerName}</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-muted-foreground">현장명</p>
                            <p className="font-medium text-sm sm:text-base break-words">{record.siteName}</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-muted-foreground">공수</p>
                            <p className="font-medium text-sm sm:text-base">{record.workHours}일</p>
                          </div>
                        </div>
                        <div className="flex gap-2 self-end sm:self-auto">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(record)}
                            className="h-8 w-8 sm:h-10 sm:w-10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(record.id, 'work')}
                            className="h-8 w-8 sm:h-10 sm:w-10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {record.notes && (
                        <div className="pt-2 border-t">
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1">비고</p>
                          <p className="text-sm sm:text-base break-words whitespace-pre-wrap">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-base sm:text-lg">장비 기록</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 w-full">
              {equipmentByType.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  기록된 장비가 없습니다
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {equipmentByType.map((equip) => (
                    <div
                      key={equip.equipmentType}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1">장비</p>
                        <p className="font-medium text-sm sm:text-base">{equip.equipmentType}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          수량: <span className="font-medium">{equip.totalQuantity}대</span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEquipmentAdd(equip.equipmentType)}
                        className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
                        title="추가"
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // 모든 장비 타입 중 0인 것 추가
                    const dateStr = selectedDate.toISOString().split('T')[0];
                    const newRecord: EquipmentRecord = {
                      id: '',
                      workDate: dateStr,
                      equipmentType: EQUIPMENT_TYPES[0],
                      quantity: 0,
                      teamId: isAdmin ? selectedTeamId : (user?.teamId || ''),
                      createdBy: user?.email || '',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };
                    setEditingEquipmentRecord(newRecord);
                    setShowEquipmentForm(true);
                  }}
                  className="w-full sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  장비 추가
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <WorkRecordForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSave={handleSave}
        teamId={isAdmin ? selectedTeamId : user?.teamId || ''}
        record={editingRecord}
      />

      {/* 장비 기록 수정 다이얼로그 */}
      <Dialog open={showEquipmentForm} onOpenChange={handleEquipmentFormClose}>
        <DialogContent className="!max-w-[calc(100vw-1rem)] sm:!max-w-lg !m-2 sm:!m-4 !w-[calc(100vw-1rem)] sm:!w-auto !left-[50%] !top-[50%] !translate-x-[-50%] !translate-y-[-50%]">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">장비 기록 추가</DialogTitle>
          </DialogHeader>
          {editingEquipmentRecord && (
            <EquipmentEditForm
              record={editingEquipmentRecord}
              onSave={handleSaveEquipment}
              onCancel={handleEquipmentFormClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 장비 기록 추가 폼 컴포넌트
function EquipmentEditForm({
  record,
  onSave,
  onCancel,
}: {
  record: EquipmentRecord;
  onSave: (updates: Partial<EquipmentRecord>) => void;
  onCancel: () => void;
}) {
  const [equipmentType, setEquipmentType] = useState(record.equipmentType);
  const [quantity, setQuantity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      equipmentType,
      quantity: parseInt(quantity, 10) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="equipment-type">장비 종류</Label>
        <Select value={equipmentType} onValueChange={setEquipmentType}>
          <SelectTrigger>
            <SelectValue placeholder="장비 선택" />
          </SelectTrigger>
          <SelectContent>
            {EQUIPMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="equipment-quantity">추가할 수량</Label>
        <Input
          id="equipment-quantity"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || /^\d+$/.test(value)) {
              setQuantity(value);
            }
          }}
          placeholder="추가할 수량 입력"
          required
        />
        <p className="text-xs text-muted-foreground">같은 날짜의 같은 장비 타입이면 자동으로 누적됩니다</p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">추가</Button>
      </DialogFooter>
    </form>
  );
}