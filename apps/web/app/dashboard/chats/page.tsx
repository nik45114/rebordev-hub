"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MagnifyingGlassIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

const chats = [
  { id: 1, name: "Иван Иванов", lastMessage: "Отлично, спасибо!", time: "2 мин", unread: 2 },
  { id: 2, name: "Проект: ReborDev Hub", lastMessage: "Обсудим завтра", time: "15 мин", unread: 0 },
  { id: 3, name: "Мария Петрова", lastMessage: "Отправила макеты", time: "1 час", unread: 5 },
];

export default function ChatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Чаты</h1>
        <p className="text-muted-foreground mt-2">
          Общайтесь с командой и клиентами
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Chat List */}
        <Card className="lg:col-span-1 flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Поиск чатов..." className="pl-10" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="p-4 border-b hover:bg-muted cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {chat.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{chat.name}</p>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage}
                      </p>
                      {chat.unread > 0 && (
                        <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 flex flex-col">
          <div className="p-4 border-b flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                ИИ
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Иван Иванов</p>
              <p className="text-xs text-green-500">В сети</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex justify-start">
              <div className="max-w-[70%] rounded-lg bg-muted p-3">
                <p className="text-sm">Привет! Как дела с проектом?</p>
                <span className="text-xs text-muted-foreground mt-1 block">10:30</span>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[70%] rounded-lg bg-primary text-primary-foreground p-3">
                <p className="text-sm">Всё отлично! Завершаю последние правки</p>
                <span className="text-xs opacity-70 mt-1 block">10:32</span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input placeholder="Введите сообщение..." />
              <Button size="icon">
                <PaperAirplaneIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
