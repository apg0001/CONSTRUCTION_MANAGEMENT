import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
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
import { EQUIPMENT_TYPES } from '@/types';

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
      
      if (teamId) {
        const works = await getWorkRecordsByDate(dateStr, teamId);
        const equipment = await getEquipmentRecordsByDate(dateStr, teamId);
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
          await addWorkRecord({ ...record, teamId, createdBy, notes });
        }
        
        // 장비 레코드 추가
        for (const equipment of equipmentData) {
          await addEquipmentRecord({ ...equipment, teamId, createdBy });
        }
        
        toast.success(`${records.length}명의 공수 기록이 추가되었습니다`);
      }
      
      handleFormClose();
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
      await updateEquipmentRecord(editingEquipmentRecord.id, updates);
      toast.success('장비 기록이 수정되었습니다');
      handleEquipmentFormClose();
    } catch (error) {
      console.error('Error updating equipment record:', error);
      toast.error('수정 중 오류가 발생했습니다');
    }
  };



  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            대시보드로 돌아가기
          </Button>
          <div className="flex gap-4 items-center">
            {isAdmin && (
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="팀 선택" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              공수 기록 추가
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>날짜 선택</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="date-select">조회 날짜</Label>
                <Input
                  id="date-select"
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={handleDateChange}
                  className="max-w-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })} 작업 기록
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  기록된 작업이 없습니다
                </p>
              ) : (
                <div className="space-y-4">
                  {workRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">작업자명</p>
                          <p className="font-medium">{record.workerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">현장명</p>
                          <p className="font-medium">{record.siteName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">공수</p>
                          <p className="font-medium">{record.workHours}일</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(record.id, 'work')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>장비 기록</CardTitle>
            </CardHeader>
            <CardContent>
              {equipmentRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  기록된 장비가 없습니다
                </p>
              ) : (
                <div className="space-y-4">
                  {equipmentRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">현장명</p>
                          <p className="font-medium">{record.siteName || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">장비</p>
                          <p className="font-medium">{record.equipmentType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">수량</p>
                          <p className="font-medium">{record.quantity}대</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditEquipment(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(record.id, 'equipment')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>장비 기록 수정</DialogTitle>
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

// 장비 기록 수정 폼 컴포넌트
function EquipmentEditForm({
  record,
  onSave,
  onCancel,
}: {
  record: EquipmentRecord;
  onSave: (updates: Partial<EquipmentRecord>) => void;
  onCancel: () => void;
}) {
  const [workDate, setWorkDate] = useState(record.workDate);
  const [siteName, setSiteName] = useState(record.siteName || '');
  const [equipmentType, setEquipmentType] = useState(record.equipmentType);
  const [quantity, setQuantity] = useState(record.quantity.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      workDate,
      siteName,
      equipmentType,
      quantity: parseInt(quantity, 10) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="equipment-date">작업 날짜</Label>
        <Input
          id="equipment-date"
          type="date"
          value={workDate}
          onChange={(e) => setWorkDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="equipment-site">현장명</Label>
        <Input
          id="equipment-site"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder="현장명"
        />
      </div>

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
        <Label htmlFor="equipment-quantity">수량</Label>
        <Input
          id="equipment-quantity"
          type="number"
          min="0"
          step="1"
          value={quantity}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || /^\d+$/.test(value)) {
              setQuantity(value);
            }
          }}
          required
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">수정</Button>
      </DialogFooter>
    </form>
  );
}