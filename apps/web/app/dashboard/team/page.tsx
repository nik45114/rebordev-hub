"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const teamMembers = [
  { id: 1, name: "Иван Иванов", role: "Team Lead", email: "ivan@rebordev.com", status: "online" },
  { id: 2, name: "Мария Петрова", role: "Frontend Developer", email: "maria@rebordev.com", status: "online" },
  { id: 3, name: "Петр Сидоров", role: "Backend Developer", email: "petr@rebordev.com", status: "offline" },
  { id: 4, name: "Анна Смирнова", role: "Designer", email: "anna@rebordev.com", status: "online" },
  { id: 5, name: "Дмитрий Козлов", role: "DevOps", email: "dmitry@rebordev.com", status: "offline" },
];

export default function TeamPage() {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Команда</h1>
          <p className="text-muted-foreground mt-2">
            Управляйте членами команды и их доступами
          </p>
        </div>
        <Button className="gap-2">
          <PlusIcon className="w-4 h-4" />
          Пригласить
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Поиск по команде..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                        member.status === "online" ? "bg-green-500" : "bg-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Профиль
                  </Button>
                  <Button variant="outline" size="sm">
                    Сообщение
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
