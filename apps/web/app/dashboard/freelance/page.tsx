"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FreelancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Фриланс биржа</h1>
          <p className="text-muted-foreground mt-2">
            Находите проекты или предлагайте свои услуги
          </p>
        </div>
        <Button>Создать заказ</Button>
      </div>

      <div className="grid gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>Разработка веб-приложения #{i}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Требуется разработать современное веб-приложение с использованием
                    React и Node.js. Опыт работы от 2 лет.
                  </p>
                </div>
                <span className="text-lg font-bold text-primary whitespace-nowrap ml-4">
                  $1,500
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    React
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    Node.js
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    TypeScript
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  Подробнее
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
