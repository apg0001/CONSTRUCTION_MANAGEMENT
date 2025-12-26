import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { getWorkRecords, getEquipmentRecords, getTeams } from '@/lib/storage';
import { WorkRecord, EquipmentRecord } from '@/types';

interface WorkerSummary {
  workerName: string;
  teamName: string;
  sites: {
    siteName: string;
    workDays: number;
    totalHours: number;
  }[];
}

interface EquipmentSummary {
  equipmentType: string;
  totalQuantity: number;
}

export default function MonthlyReport() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedTeamId, setSelectedTeamId] = useState<string>(user?.teamId || '');
  const [workerSummaries, setWorkerSummaries] = useState<WorkerSummary[]>([]);
  const [equipmentSummaries, setEquipmentSummaries] = useState<EquipmentSummary[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.teamId && !isAdmin) {
      setSelectedTeamId('');
    } else if (user?.teamId) {
      setSelectedTeamId(user.teamId);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamsData = await getTeams();
        setTeams(teamsData);
      } catch (error) {
        console.error('Error loading teams:', error);
      }
    };
    loadTeams();
  }, []);

  useEffect(() => {
    loadMonthlyData();
  }, [selectedMonth, selectedTeamId]);

  const loadMonthlyData = async () => {
    setIsLoading(true);
    try {
      // 관리자 계정: 선택한 팀 ID를 파라미터로 전달
      // 팀 계정(manager): 자신의 팀 ID를 파라미터로 전달 (백엔드에서 JWT와 비교하여 검증)
      const teamId = isAdmin ? selectedTeamId : user?.teamId;
      
      if (isAdmin && !selectedTeamId) {
        setWorkerSummaries([]);
        setEquipmentSummaries([]);
        setIsLoading(false);
        return;
      }
      
      // 팀 계정도 teamId가 없으면 조회 불가
      if (!isAdmin && !teamId) {
        setWorkerSummaries([]);
        setEquipmentSummaries([]);
        setIsLoading(false);
        return;
      }

      const allRecords = await getWorkRecords(teamId);
      const allEquipment = await getEquipmentRecords(teamId);
      // 팀명 찾기: teams 배열에서 찾거나, user의 teamName 사용
      const actualTeamId = isAdmin ? selectedTeamId : user?.teamId;
      let teamName = teams.find(t => t.id === actualTeamId)?.name || '';
      if (!teamName && user?.teamName) {
        teamName = user.teamName;
      }

      // Filter by selected month - add null check for workDate
      const monthRecords = allRecords.filter(r => r.workDate && r.workDate.startsWith(selectedMonth));
      const monthEquipment = allEquipment.filter(r => r.workDate && r.workDate.startsWith(selectedMonth));

      // Group work records by worker and site
      const workerMap = new Map<string, WorkerSummary>();
      monthRecords.forEach(record => {
        if (!workerMap.has(record.workerName)) {
          workerMap.set(record.workerName, {
            workerName: record.workerName,
            teamName,
            sites: [],
          });
        }

        const worker = workerMap.get(record.workerName)!;
        const existingSite = worker.sites.find(s => s.siteName === record.siteName);

        if (existingSite) {
          existingSite.workDays += 1;
          existingSite.totalHours += record.workHours;
        } else {
          worker.sites.push({
            siteName: record.siteName,
            workDays: 1,
            totalHours: record.workHours,
          });
        }
      });

      // Group equipment by type (장비 기록에는 현장명이 없으므로 타입별로만 합산)
      const equipmentMap = new Map<string, EquipmentSummary>();
      monthEquipment.forEach(record => {
        if (!equipmentMap.has(record.equipmentType)) {
          equipmentMap.set(record.equipmentType, {
            equipmentType: record.equipmentType,
            totalQuantity: 0,
          });
        }

        const equipment = equipmentMap.get(record.equipmentType)!;
        equipment.totalQuantity += record.quantity;
      });

      setWorkerSummaries(Array.from(workerMap.values()));
      setEquipmentSummaries(Array.from(equipmentMap.values()));
    } catch (error) {
      console.error('Error loading monthly data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-x-hidden w-full max-w-full">
      <div className="container mx-auto max-w-6xl px-2 sm:px-4 md:px-6 py-3 sm:py-6 w-full">
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
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-[180px]"
            />
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6 w-full">
          <Card className="w-full">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-base sm:text-lg">작업자별 월별 현황</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              {workerSummaries.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm">
                  해당 월의 작업 기록이 없습니다
                </p>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {workerSummaries.map((worker, idx) => (
                    <div key={idx} className="border-b pb-3 sm:pb-4 last:border-b-0">
                      <div className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 break-words">
                        {worker.workerName}{worker.teamName ? ` (${worker.teamName})` : ''}
                      </div>
                      <div className="space-y-2">
                        {worker.sites.map((site, siteIdx) => (
                          <div
                            key={siteIdx}
                            className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 p-2 sm:p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="text-xs sm:text-sm text-muted-foreground">현장</p>
                              <p className="font-medium text-sm sm:text-base break-words">{site.siteName}</p>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-muted-foreground">작업일수</p>
                              <p className="font-medium text-sm sm:text-base">{site.workDays}일</p>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-muted-foreground">총 공수</p>
                              <p className="font-medium text-sm sm:text-base">{site.totalHours.toFixed(1)}일</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-base sm:text-lg">장비별 월별 현황</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              {equipmentSummaries.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm">
                  해당 월의 장비 기록이 없습니다
                </p>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {equipmentSummaries.map((equipment, idx) => (
                    <div key={idx} className="border-b pb-3 sm:pb-4 last:border-b-0">
                      <div className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">
                        {equipment.equipmentType}
                      </div>
                      <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">총 수량</p>
                          <p className="font-medium text-sm sm:text-base">{equipment.totalQuantity}대</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}