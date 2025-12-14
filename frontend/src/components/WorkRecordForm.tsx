import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { Worker, WorkRecord, EQUIPMENT_TYPES, EquipmentRecord, EquipmentType } from '@/types';

interface WorkRecordRow {
  id: string;
  workerId: string;
  workerName: string;
  siteName: string;
  workHours: number;
  equipment: Record<EquipmentType, number>;
}

interface WorkRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (records: Omit<WorkRecord, 'id' | 'createdAt' | 'updatedAt'>[], equipmentData: Omit<EquipmentRecord, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  workers: Worker[];
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

export function WorkRecordForm({ isOpen, onClose, onSave, workers, record }: WorkRecordFormProps) {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState<WorkRecordRow[]>([
    { 
      id: '1', 
      workerId: '', 
      workerName: '', 
      siteName: '', 
      workHours: 1,
      equipment: createEmptyEquipment()
    }
  ]);

  useEffect(() => {
    if (record) {
      setDate(record.workDate);
      setRows([{
        id: '1',
        workerId: record.workerId,
        workerName: record.workerName,
        siteName: record.siteName,
        workHours: record.workHours,
        equipment: createEmptyEquipment()
      }]);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setRows([{ 
        id: '1', 
        workerId: '', 
        workerName: '', 
        siteName: '', 
        workHours: 1,
        equipment: createEmptyEquipment()
      }]);
    }
  }, [record, isOpen]);

  const addRow = () => {
    const newId = (Math.max(...rows.map(r => parseInt(r.id))) + 1).toString();
    setRows([...rows, { 
      id: newId, 
      workerId: '', 
      workerName: '', 
      siteName: '', 
      workHours: 1,
      equipment: createEmptyEquipment()
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
        if (field === 'workerId') {
          const worker = workers.find(w => w.id === value);
          return {
            ...row,
            workerId: value as string,
            workerName: worker?.name || ''
          };
        }
        
        if (field.startsWith('equipment.')) {
          // 'equipment.' 이후의 모든 문자열을 equipmentType으로 사용
          // '3.5t'처럼 점이 포함된 경우를 위해 첫 번째 점만 제거
          const equipmentType = field.substring('equipment.'.length) as EquipmentType;
          // 정수만 허용 (장비 수량은 정수)
          const numValue = typeof value === 'number' ? Math.floor(value) : (value === '' ? 0 : parseInt(value as string, 10));
          const finalValue = isNaN(numValue) || numValue < 0 ? 0 : numValue;
          
          return {
            ...row,
            equipment: {
              ...row.equipment,
              [equipmentType]: finalValue
            }
          };
        }
        
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validRows = rows.filter(row => row.workerId && row.siteName && row.workHours > 0);
    
    if (validRows.length === 0) {
      alert('최소 한 명의 작업자 정보를 입력해주세요.');
      return;
    }

    const workRecords = validRows.map(row => ({
      workerId: row.workerId,
      workerName: row.workerName,
      siteName: row.siteName,
      workHours: row.workHours,
      workDate: date,
      teamId: '',
      createdBy: ''
    }));

    const equipmentRecords: Omit<EquipmentRecord, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    validRows.forEach(row => {
      EQUIPMENT_TYPES.forEach(equipType => {
        const quantity = row.equipment[equipType];
        if (quantity > 0) {
          equipmentRecords.push({
            workDate: date,
            siteName: row.siteName,
            equipmentType: equipType,
            quantity: quantity,
            teamId: '',
            createdBy: ''
          });
        }
      });
    });

    onSave(workRecords, equipmentRecords);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? '공수 기록 수정' : '공수 기록 추가'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium min-w-[150px]">작업자명</th>
                    <th className="p-3 text-left text-sm font-medium min-w-[150px]">현장명</th>
                    <th className="p-3 text-left text-sm font-medium min-w-[80px]">공수</th>
                    <th className="p-3 text-left text-sm font-medium min-w-[80px]">6w</th>
                    <th className="p-3 text-left text-sm font-medium min-w-[80px]">3w</th>
                    <th className="p-3 text-left text-sm font-medium min-w-[80px]">035</th>
                    <th className="p-3 text-left text-sm font-medium min-w-[80px]">덤프</th>
                    <th className="p-3 text-left text-sm font-medium min-w-[80px]">1t</th>
                    <th className="p-3 text-left text-sm font-medium min-w-[80px]">3.5t</th>
                    <th className="p-3 text-left text-sm font-medium min-w-[80px]">살수차</th>
                    <th className="p-3 text-left text-sm font-medium min-w-[80px]">모범수</th>
                    <th className="p-3 text-left text-sm font-medium min-w-[60px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="p-3">
                        <Select
                          value={row.workerId}
                          onValueChange={(value) => updateRow(row.id, 'workerId', value)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {workers.map((worker) => (
                              <SelectItem key={worker.id} value={worker.id}>
                                {worker.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <Input
                          value={row.siteName}
                          onChange={(e) => updateRow(row.id, 'siteName', e.target.value)}
                          placeholder="현장명"
                          required
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={row.workHours}
                          onChange={(e) => updateRow(row.id, 'workHours', parseFloat(e.target.value))}
                          min="0.5"
                          step="0.5"
                          required
                        />
                      </td>
                      {EQUIPMENT_TYPES.map((equipType) => {
                        const currentValue = row.equipment[equipType];
                        // 3.5t 등 점(.)이 포함된 필드명을 안전하게 처리
                        const inputId = `equipment-${row.id}-${equipType.replace(/\./g, '-')}`;
                        return (
                          <td key={equipType} className="p-3">
                            <Input
                              id={inputId}
                              type="number"
                              min="0"
                              step="1"
                              value={currentValue === 0 ? '' : currentValue.toString()}
                              onChange={(e) => {
                                const value = e.target.value;
                                // 숫자만 허용 (빈 문자열 또는 양수 정수)
                                if (value === '' || /^\d+$/.test(value)) {
                                  const numValue = value === '' ? 0 : parseInt(value, 10);
                                  const fieldName = 'equipment.' + equipType;
                                  updateRow(row.id, fieldName, isNaN(numValue) ? 0 : numValue);
                                }
                              }}
                              onBlur={(e) => {
                                // 포커스가 벗어날 때 빈 값이면 0으로 설정
                                if (e.target.value === '') {
                                  const fieldName = 'equipment.' + equipType;
                                  updateRow(row.id, fieldName, 0);
                                }
                              }}
                              placeholder="0"
                            />
                          </td>
                        );
                      })}
                      <td className="p-3">
                        {!record && rows.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRow(row.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">
              {record ? '수정' : '저장'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}