import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Logo/Title */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            ReborDev Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Современная платформа для управления проектами, фрилансом и командной работой.
            Все инструменты разработчика в одном месте.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            {
              title: "Управление проектами",
              description: "Отслеживайте задачи, дедлайны и прогресс в реальном времени",
            },
            {
              title: "Фриланс биржа",
              description: "Находите заказы или исполнителей для ваших проектов",
            },
            {
              title: "Командная работа",
              description: "Общайтесь с командой и управляйте доступами",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4 mt-12">
          <Link href="/login">
            <Button size="lg" className="gap-2">
              Войти
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">
              Регистрация
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 text-sm text-muted-foreground">
          <p>© 2024 ReborDev. Все права защищены.</p>
        </div>
      </div>
    </main>
  );
}
