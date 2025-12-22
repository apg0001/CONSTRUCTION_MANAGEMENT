import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { WorkRecord, EQUIPMENT_TYPES, EquipmentRecord, EquipmentType } from '@/types';
import { getLastWorkRecords, getLastEquipmentRecords } from '@/lib/storage';

interface WorkRecordRow {
  id: string;
  workerName: string;
  siteName: string;
  workHours: number;
}

interface WorkRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (records: Omit<WorkRecord, 'id' | 'createdAt' | 'updatedAt'>[], equipmentData: Omit<EquipmentRecord, 'id' | 'createdAt' | 'updatedAt'>[], notes: string) => void;
  teamId: string;
  record?: WorkRecord;
}

const createEmptyEquipment = (): Record<EquipmentType, number> => ({
  '6w': 0,
  '3w': 0,
  '035': 0,
  '덤프': 0,
  '1t': 0,
  '3.5t': 0,
  '살수차': 0,
  '모범수': 0
});

export function WorkRecordForm({ isOpen, onClose, onSave, teamId, record }: WorkRecordFormProps) {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState<WorkRecordRow[]>([
    { 
      id: '1', 
      workerName: '', 
      siteName: '', 
      workHours: 1
    }
  ]);
  const [equipment, setEquipment] = useState<Record<EquipmentType, number>>(createEmptyEquipment());
  const [notes, setNotes] = useState<string>('');

  // 최근 기록 불러오기 (새로 작성할 때만)
  useEffect(() => {
    if (isOpen && !record && teamId && teamId.trim() !== '') {
      const loadLastRecord = async () => {
        try {
          const lastWorkRecords = await getLastWorkRecords(teamId);
          const lastEquipmentRecords = await getLastEquipmentRecords(teamId);
          
          // 작업자 정보 불러오기 (최근 날짜의 모든 작업자)
          if (lastWorkRecords.length > 0) {
            const workerRows = lastWorkRecords.map((wr, index) => ({
              id: (index + 1).toString(),
              workerName: wr.workerName,
              siteName: wr.siteName,
              workHours: wr.workHours
            }));
            setRows(workerRows);
            
            // 비고 불러오기 (첫 번째 레코드의 비고 사용)
            if (lastWorkRecords[0].notes) {
              setNotes(lastWorkRecords[0].notes);
            }
          }
          
          // 장비 정보 불러오기
          if (lastEquipmentRecords.length > 0) {
            const equipmentData = createEmptyEquipment();
            lastEquipmentRecords.forEach(equipRecord => {
              if (equipRecord.equipmentType in equipmentData) {
                equipmentData[equipRecord.equipmentType as EquipmentType] = equipRecord.quantity;
              }
            });
            setEquipment(equipmentData);
          }
        } catch (error) {
          console.error('Error loading last record:', error);
        }
      };
      
      loadLastRecord();
    }
  }, [isOpen, record, teamId]);

  useEffect(() => {
    if (record) {
      setDate(record.workDate);
      setRows([{
        id: '1',
        workerName: record.workerName,
        siteName: record.siteName,
        workHours: record.workHours
      }]);
      setNotes(record.notes || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setRows([{ 
        id: '1', 
        workerName: '', 
        siteName: '', 
        workHours: 1
      }]);
      setEquipment(createEmptyEquipment());
      setNotes('');
    }
  }, [record, isOpen]);

  const addRow = () => {
    const newId = (Math.max(...rows.map(r => parseInt(r.id)), 0) + 1).toString();
    setRows([...rows, { 
      id: newId, 
      workerName: '', 
      siteName: '', 
      workHours: 1
    }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
    }
  };

  const updateRow = (id: string, field: string, value: string | number) => {
    setRows(prevRows => prevRows.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const updateEquipment = (equipmentType: EquipmentType, value: number) => {
    setEquipment(prev => ({
      ...prev,
      [equipmentType]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validRows = rows.filter(row => row.workerName && row.siteName && row.workHours > 0);
    
    if (validRows.length === 0) {
      alert('최소 한 명의 작업자 정보를 입력해주세요.');
      return;
    }

    const workRecords = validRows.map(row => ({
      workerId: '', // 작업자 ID는 더 이상 사용하지 않음
      workerName: row.workerName,
      siteName: row.siteName,
      workHours: row.workHours,
      workDate: date,
      notes: notes,
      teamId: '',
      createdBy: ''
    }));

    // 장비 레코드는 전체 팀 기준으로 하나만 생성
    const equipmentRecords: Omit<EquipmentRecord, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    EQUIPMENT_TYPES.forEach(equipType => {
      const quantity = equipment[equipType];
      if (quantity > 0) {
        equipmentRecords.push({
          workDate: date,
          siteName: '', // 장비는 전체 팀 기준이므로 현장명 없음
          equipmentType: equipType,
          quantity: quantity,
          teamId: '',
          createdBy: ''
        });
      }
    });

    onSave(workRecords, equipmentRecords, notes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[calc(100vw-1rem)] sm:!max-w-[95vw] md:!max-w-4xl !max-h-[calc(100vh-1rem)] sm:!max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6 !m-2 sm:!m-4 !w-[calc(100vw-1rem)] sm:!w-auto !left-[50%] !top-[50%] !translate-x-[-50%] !translate-y-[-50%]">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">{record ? '공수 기록 수정' : '공수 기록 추가'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="date">작업 날짜</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* 작업자 정보 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">작업자 정보</Label>
              {!record && (
                <Button type="button" onClick={addRow} size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  작업자 추가
                </Button>
              )}
            </div>

            <div className="border rounded-lg overflow-x-auto -mx-1 sm:mx-0 w-full">
              <table className="w-full min-w-[500px] sm:min-w-0 max-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium min-w-[100px] sm:min-w-[120px]">작업자명</th>
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium min-w-[100px] sm:min-w-[120px]">현장명</th>
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium min-w-[60px] sm:min-w-[70px]">공수</th>
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-medium min-w-[40px] sm:min-w-[50px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="p-2 sm:p-3">
                        <Input
                          value={row.workerName}
                          onChange={(e) => updateRow(row.id, 'workerName', e.target.value)}
                          placeholder="이름"
                          className="text-sm"
                          required
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        <Input
                          value={row.siteName}
                          onChange={(e) => updateRow(row.id, 'siteName', e.target.value)}
                          placeholder="현장"
                          className="text-sm"
                          required
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        <Input
                          type="number"
                          value={row.workHours}
                          onChange={(e) => updateRow(row.id, 'workHours', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.5"
                          className="text-sm"
                          required
                        />
                      </td>
                      <td className="p-2 sm:p-3">
                        {!record && rows.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRow(row.id)}
                            className="h-7 w-7 sm:h-10 sm:w-10"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 장비 투입 섹션 */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">장비 투입 (대수) - 전체 팀</Label>
              <p className="text-sm text-muted-foreground mt-1">
                이 날짜의 전체 팀 장비 투입 현황입니다.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-4">
              {EQUIPMENT_TYPES.map((equipType) => {
                const currentValue = equipment[equipType];
                const inputId = `equipment-${equipType.replace(/\./g, '-')}`;
                return (
                  <div key={equipType} className="space-y-1 sm:space-y-2">
                    <Label htmlFor={inputId} className="text-xs sm:text-sm">{equipType}</Label>
                    <Input
                      id={inputId}
                      type="number"
                      min="0"
                      step="1"
                      value={currentValue === 0 ? '' : currentValue.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d+$/.test(value)) {
                          const numValue = value === '' ? 0 : parseInt(value, 10);
                          updateEquipment(equipType, isNaN(numValue) ? 0 : numValue);
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '') {
                          updateEquipment(equipType, 0);
                        }
                      }}
                      placeholder="0"
                      className="text-sm"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 비고 섹션 */}
          <div className="space-y-2">
            <Label htmlFor="notes">작업내용 및 특이사항</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="작업 내용을 입력하세요"
              className="min-h-[100px] resize-y"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              취소
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              {record ? '수정' : '공수 기록'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
