import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getWorkers, addWorker, updateWorker, deleteWorker, getTeams } from '@/lib/storage';
import { Worker } from '@/types';

export default function WorkerManagement() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [workerName, setWorkerName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(user?.teamId || '');
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
    loadWorkers();
  }, [selectedTeamId]);

  const loadWorkers = async () => {
    setIsLoading(true);
    try {
      const teamId = isAdmin ? selectedTeamId : user?.teamId;
      if (teamId) {
        const workerList = await getWorkers(teamId);
        setWorkers(workerList);
      } else {
        setWorkers([]);
      }
    } catch (error) {
      console.error('Error loading workers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workerName.trim()) {
      toast.error('작업자명을 입력해주세요');
      return;
    }

    const teamId = isAdmin ? selectedTeamId : user?.teamId;
    if (!teamId) {
      toast.error('팀을 선택해주세요');
      return;
    }

    try {
      if (editingWorker) {
        await updateWorker(editingWorker.id, { name: workerName });
        toast.success('작업자가 수정되었습니다');
      } else {
        await addWorker({ name: workerName, teamId });
        toast.success('작업자가 추가되었습니다');
      }
    } catch (error) {
      console.error('Error saving worker:', error);
      toast.error('작업자 저장 중 오류가 발생했습니다');
    }

    setShowForm(false);
    setEditingWorker(null);
    setWorkerName('');
    await loadWorkers();
  };

  const handleEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setWorkerName(worker.name);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    setIsLoading(true);
    try {
      await deleteWorker(id);
      await loadWorkers();
      toast.success('작업자가 삭제되었습니다');
    } catch (error) {
      console.error('Error deleting worker:', error);
      toast.error('작업자 삭제 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingWorker(null);
    setWorkerName('');
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="container mx-auto max-w-4xl">
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
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              작업자 추가
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>작업자 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {workers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                등록된 작업자가 없습니다
              </p>
            ) : (
              <div className="space-y-2">
                {workers.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <span className="font-medium">{worker.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(worker)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(worker.id)}
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

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWorker ? '작업자 수정' : '작업자 추가'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>작업자명</Label>
              <Input
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                placeholder="작업자명을 입력하세요"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                취소
              </Button>
              <Button type="submit">
                {editingWorker ? '수정' : '추가'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}