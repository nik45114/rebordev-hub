"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServerIcon, CpuChipIcon, CircleStackIcon } from "@heroicons/react/24/outline";

const servers = [
  {
    name: "Production Server",
    status: "online",
    cpu: 45,
    memory: 62,
    disk: 38,
    ip: "192.168.1.10"
  },
  {
    name: "Development Server",
    status: "online",
    cpu: 23,
    memory: 41,
    disk: 55,
    ip: "192.168.1.11"
  },
  {
    name: "Staging Server",
    status: "offline",
    cpu: 0,
    memory: 0,
    disk: 72,
    ip: "192.168.1.12"
  },
];

export default function ServersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Серверы</h1>
          <p className="text-muted-foreground mt-2">
            Мониторинг и управление серверами
          </p>
        </div>
        <Button>Добавить сервер</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servers.map((server, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ServerIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{server.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{server.ip}</p>
                  </div>
                </div>
                <span
                  className={`w-3 h-3 rounded-full ${
                    server.status === "online" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CpuChipIcon className="w-4 h-4 text-muted-foreground" />
                    <span>CPU</span>
                  </div>
                  <span className="font-medium">{server.cpu}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${server.cpu}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CircleStackIcon className="w-4 h-4 text-muted-foreground" />
                    <span>Memory</span>
                  </div>
                  <span className="font-medium">{server.memory}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${server.memory}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Disk</span>
                  <span className="font-medium">{server.disk}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${server.disk}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  Детали
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Перезагрузить
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
