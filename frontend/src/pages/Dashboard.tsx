import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, FileText, BarChart3, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      title: '공수 기록',
      description: '일일 작업 공수를 기록합니다',
      icon: Calendar,
      path: '/work-record',
      color: 'bg-blue-500',
    },
    {
      title: '작업자 관리',
      description: '작업자를 추가, 수정, 삭제합니다',
      icon: Users,
      path: '/workers',
      color: 'bg-green-500',
    },
    {
      title: '월별 현황',
      description: '월별 작업 현황을 확인합니다',
      icon: BarChart3,
      path: '/monthly-report',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">건설 현장 관리 시스템</h1>
            <p className="text-gray-600 mt-2">
              {isAdmin ? '관리자' : user?.teamName || user?.email} - {user?.email}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card
              key={item.path}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(item.path)}
            >
              <CardHeader>
                <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {isAdmin && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>관리자 권한</CardTitle>
              <CardDescription>
                모든 팀의 데이터를 조회하고 수정할 수 있습니다
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* <Card className="mt-8">
          <CardHeader>
            <CardTitle>API 연동 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-600">
              ✓ Backend API와 연동됨 ({import.meta.env.VITE_API_URL || 'http://localhost:8000'})
            </p>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}