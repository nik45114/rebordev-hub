"use client";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  FolderIcon,
  UsersIcon,
  ClockIcon,
  DollarSign,
  PlusIcon,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  // Mock данные для демонстрации
  const metrics = [
    {
      title: "Активные проекты",
      value: "12",
      description: "+2 за последнюю неделю",
      icon: FolderIcon,
      trend: { value: 16.7, isPositive: true },
    },
    {
      title: "Члены команды",
      value: "24",
      description: "8 онлайн",
      icon: UsersIcon,
      trend: { value: 4.3, isPositive: true },
    },
    {
      title: "Часов отработано",
      value: "156",
      description: "В этом месяце",
      icon: ClockIcon,
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: "Доход",
      value: "$12,450",
      description: "За текущий месяц",
      icon: DollarSign,
      trend: { value: 8.2, isPositive: true },
    },
  ];

  const recentProjects = [
    { id: 1, name: "ReborDev Hub", status: "В работе", progress: 75, deadline: "2024-03-15" },
    { id: 2, name: "API Gateway", status: "В работе", progress: 45, deadline: "2024-03-20" },
    { id: 3, name: "Mobile App", status: "Планирование", progress: 10, deadline: "2024-04-01" },
  ];

  const teamActivity = [
    { user: "Иван Иванов", action: "завершил задачу", project: "ReborDev Hub", time: "5 мин назад" },
    { user: "Мария Петрова", action: "создала новый проект", project: "Dashboard v2", time: "1 час назад" },
    { user: "Петр Сидоров", action: "оставил комментарий", project: "API Gateway", time: "2 часа назад" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Добро пожаловать, {user?.name || "Пользователь"}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Вот что происходит в ваших проектах сегодня
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Projects and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Недавние проекты</CardTitle>
            <Button size="sm" className="gap-2">
              <PlusIcon className="w-4 h-4" />
              Новый проект
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Дедлайн: {new Date(project.deadline).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {project.status}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Активность команды</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamActivity.map((activity, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-muted-foreground">{activity.action}</span>{' '}
                      <span className="font-medium">{activity.project}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Создать проект", icon: FolderIcon },
              { label: "Пригласить в команду", icon: UsersIcon },
              { label: "Новая задача", icon: ClockIcon },
              { label: "Добавить счёт", icon: DollarSign },
            ].map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex flex-col gap-2"
              >
                <action.icon className="w-5 h-5" />
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
