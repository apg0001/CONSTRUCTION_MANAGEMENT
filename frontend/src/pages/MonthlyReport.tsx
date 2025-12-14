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
  sites: {
    siteName: string;
    totalQuantity: number;
  }[];
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
      const teamId = isAdmin ? selectedTeamId : user?.teamId;
      if (!teamId) {
        setWorkerSummaries([]);
        setEquipmentSummaries([]);
        setIsLoading(false);
        return;
      }

      const allRecords = await getWorkRecords(teamId);
      const allEquipment = await getEquipmentRecords(teamId);
      const teamName = teams.find(t => t.id === teamId)?.name || '';

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

      // Group equipment by type and site
      const equipmentMap = new Map<string, EquipmentSummary>();
      monthEquipment.forEach(record => {
        if (!equipmentMap.has(record.equipmentType)) {
          equipmentMap.set(record.equipmentType, {
            equipmentType: record.equipmentType,
            sites: [],
          });
        }

        const equipment = equipmentMap.get(record.equipmentType)!;
        const existingSite = equipment.sites.find(s => s.siteName === record.siteName);

        if (existingSite) {
          existingSite.totalQuantity += record.quantity;
        } else {
          equipment.sites.push({
            siteName: record.siteName,
            totalQuantity: record.quantity,
          });
        }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="container mx-auto max-w-6xl">
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
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-[180px]"
            />
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>작업자별 월별 현황</CardTitle>
            </CardHeader>
            <CardContent>
              {workerSummaries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  해당 월의 작업 기록이 없습니다
                </p>
              ) : (
                <div className="space-y-6">
                  {workerSummaries.map((worker, idx) => (
                    <div key={idx} className="border-b pb-4 last:border-b-0">
                      <div className="font-semibold text-lg mb-3">
                        {worker.workerName} ({worker.teamName})
                      </div>
                      <div className="space-y-2">
                        {worker.sites.map((site, siteIdx) => (
                          <div
                            key={siteIdx}
                            className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="text-sm text-muted-foreground">현장</p>
                              <p className="font-medium">{site.siteName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">작업일수</p>
                              <p className="font-medium">{site.workDays}일</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">총 공수</p>
                              <p className="font-medium">{site.totalHours.toFixed(1)}일</p>
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

          <Card>
            <CardHeader>
              <CardTitle>장비별 월별 현황</CardTitle>
            </CardHeader>
            <CardContent>
              {equipmentSummaries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  해당 월의 장비 기록이 없습니다
                </p>
              ) : (
                <div className="space-y-6">
                  {equipmentSummaries.map((equipment, idx) => (
                    <div key={idx} className="border-b pb-4 last:border-b-0">
                      <div className="font-semibold text-lg mb-3">
                        {equipment.equipmentType}
                      </div>
                      <div className="space-y-2">
                        {equipment.sites.map((site, siteIdx) => (
                          <div
                            key={siteIdx}
                            className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="text-sm text-muted-foreground">현장</p>
                              <p className="font-medium">{site.siteName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">총 수량</p>
                              <p className="font-medium">{site.totalQuantity}대</p>
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
        </div>
      </div>
    </div>
  );
}