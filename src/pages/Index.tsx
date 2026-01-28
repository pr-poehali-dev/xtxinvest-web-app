import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);

  const balance = 1247850.50;
  const savingsBalance = 450000.00;

  const cards = [
    { id: 1, type: 'МИР', number: '•••• 4892', balance: 247850.50, color: 'from-blue-600 to-blue-400' },
    { id: 2, type: 'VISA', number: '•••• 7231', balance: 1000000.00, color: 'from-purple-600 to-purple-400' },
    { id: 3, type: 'Mastercard', number: '•••• 5678', balance: 0.00, color: 'from-cyan-600 to-cyan-400' },
  ];

  const transactions = [
    { id: 1, title: 'Яндекс.Маркет', amount: -12450, date: '28 янв', category: 'Покупки', icon: 'ShoppingBag' },
    { id: 2, title: 'Зарплата', amount: +150000, date: '27 янв', category: 'Доход', icon: 'TrendingUp' },
    { id: 3, title: 'Wildberries', amount: -5680, date: '26 янв', category: 'Покупки', icon: 'ShoppingBag' },
    { id: 4, title: 'Кэшбэк', amount: +1250, date: '25 янв', category: 'Бонусы', icon: 'Gift' },
  ];

  const rewards = [
    { title: 'Кэшбэк на покупки', value: '5%', icon: 'Percent' },
    { title: 'Бонусные рубли', value: '12,450', icon: 'Coins' },
    { title: 'Уровень привилегий', value: 'Premium', icon: 'Crown' },
  ];

  const renderHome = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Добрый день, Александр
          </h1>
          <p className="text-muted-foreground mt-1">Добро пожаловать в XTXinvest</p>
        </div>
        <Avatar className="h-14 w-14 border-2 border-primary">
          <AvatarImage src="" />
          <AvatarFallback className="bg-gradient-blue text-white text-lg">АИ</AvatarFallback>
        </Avatar>
      </div>

      <Card className="glass-effect border-primary/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Общий баланс</span>
          <Icon name="Eye" size={20} className="text-muted-foreground" />
        </div>
        <div className="text-4xl font-bold mb-6">
          {balance.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: 'Send', label: 'Перевод' },
            { icon: 'Smartphone', label: 'Платежи' },
            { icon: 'QrCode', label: 'QR-код' },
            { icon: 'MoreHorizontal', label: 'Ещё' }
          ].map((action) => (
            <Button key={action.label} variant="ghost" className="flex-col h-auto py-3 hover:bg-primary/10">
              <Icon name={action.icon} size={24} className="mb-2" />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Мои карты</h2>
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {cards.map((card) => (
              <Card key={card.id} className={`min-w-[320px] h-48 p-6 bg-gradient-to-br ${card.color} border-0 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <div className="relative z-10 h-full flex flex-col justify-between text-white">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium opacity-90">{card.type}</span>
                    <Icon name="CreditCard" size={32} className="opacity-50" />
                  </div>
                  <div>
                    <div className="text-2xl font-mono mb-2">{card.number}</div>
                    <div className="text-xl font-semibold">
                      {card.balance.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Card className="min-w-[320px] h-48 p-6 border-dashed border-2 border-primary/30 flex items-center justify-center hover:border-primary/60 transition-colors cursor-pointer">
              <div className="text-center">
                <Icon name="Plus" size={48} className="mx-auto mb-2 text-primary" />
                <span className="text-sm text-muted-foreground">Добавить карту</span>
              </div>
            </Card>
          </div>
        </ScrollArea>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Последние операции</h2>
          <Button variant="ghost" size="sm">
            Все <Icon name="ChevronRight" size={16} className="ml-1" />
          </Button>
        </div>
        <Card className="glass-effect border-primary/20 divide-y divide-border">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Icon name={tx.icon} size={20} className="text-primary" />
                </div>
                <div>
                  <div className="font-medium">{tx.title}</div>
                  <div className="text-sm text-muted-foreground">{tx.date} · {tx.category}</div>
                </div>
              </div>
              <div className={`text-lg font-semibold ${tx.amount > 0 ? 'text-green-400' : 'text-foreground'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Мои карты</h1>
      
      {cards.map((card) => (
        <Card key={card.id} className="glass-effect border-primary/20 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
              <Icon name="CreditCard" size={32} className="text-white" />
            </div>
            <Badge variant="outline" className="border-primary/40">{card.type}</Badge>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Номер карты</div>
              <div className="text-2xl font-mono">{card.number}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Баланс</div>
              <div className="text-3xl font-bold">{card.balance.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-4">
              <Button variant="outline" size="sm" className="hover:bg-primary/10">
                <Icon name="Settings" size={16} className="mr-2" />
                Настроить
              </Button>
              <Button variant="outline" size="sm" className="hover:bg-primary/10">
                <Icon name="Lock" size={16} className="mr-2" />
                Заблокировать
              </Button>
              <Button variant="outline" size="sm" className="hover:bg-primary/10">
                <Icon name="MoreVertical" size={16} className="mr-2" />
                Ещё
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <Button className="w-full gradient-blue hover:opacity-90 h-14">
        <Icon name="Plus" size={20} className="mr-2" />
        Создать виртуальную карту
      </Button>
    </div>
  );

  const renderTransfers = () => (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Переводы</h1>
      
      <Card className="glass-effect border-primary/20 p-6">
        <div className="space-y-4">
          <div>
            <Label>Получатель</Label>
            <Input placeholder="Номер телефона или карты" className="mt-2 bg-background/50" />
          </div>
          <div>
            <Label>Сумма</Label>
            <Input placeholder="0.00 ₽" className="mt-2 bg-background/50 text-2xl font-semibold h-14" />
          </div>
          <div>
            <Label>Комментарий</Label>
            <Input placeholder="Необязательно" className="mt-2 bg-background/50" />
          </div>
          <Button className="w-full gradient-blue hover:opacity-90 h-12 mt-4">
            <Icon name="Send" size={20} className="mr-2" />
            Отправить перевод
          </Button>
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Быстрые переводы</h2>
        <div className="grid grid-cols-4 gap-4">
          {['Мария', 'Иван', 'Елена', 'Дмитрий'].map((name) => (
            <div key={name} className="text-center">
              <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-primary/30">
                <AvatarFallback className="bg-primary/20">{name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-sm">{name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRewards = () => (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Поощрения</h1>
      
      <Card className="glass-effect border-primary/20 p-6 gradient-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Доступно бонусов</div>
            <div className="text-4xl font-bold">12,450 ₽</div>
          </div>
          <div className="w-16 h-16 rounded-full bg-gradient-blue flex items-center justify-center">
            <Icon name="Gift" size={32} className="text-white" />
          </div>
        </div>
        <Button className="w-full" variant="outline">Потратить бонусы</Button>
      </Card>

      <div className="grid gap-4">
        {rewards.map((reward) => (
          <Card key={reward.title} className="glass-effect border-primary/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon name={reward.icon} size={24} className="text-primary" />
              </div>
              <div className="font-medium">{reward.title}</div>
            </div>
            <div className="text-2xl font-bold text-primary">{reward.value}</div>
          </Card>
        ))}
      </div>

      <Card className="glass-effect border-primary/20 p-6">
        <h3 className="font-semibold mb-4">Специальные предложения</h3>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Кэшбэк 10%</span>
              <Badge className="bg-accent">Новое</Badge>
            </div>
            <p className="text-sm text-muted-foreground">На покупки в категории "Рестораны"</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Повышенный процент</span>
              <Badge variant="outline">До 31.01</Badge>
            </div>
            <p className="text-sm text-muted-foreground">8% годовых на накопительный счёт</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAdmin = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Панель администратора</h1>
        <Badge className="bg-accent">Admin</Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: 'Всего пользователей', value: '1,247', icon: 'Users', color: 'from-blue-600 to-blue-400' },
          { title: 'Активных карт', value: '3,891', icon: 'CreditCard', color: 'from-purple-600 to-purple-400' },
          { title: 'Транзакций сегодня', value: '5,678', icon: 'TrendingUp', color: 'from-cyan-600 to-cyan-400' },
        ].map((stat) => (
          <Card key={stat.title} className={`p-6 bg-gradient-to-br ${stat.color} border-0 text-white`}>
            <Icon name={stat.icon} size={32} className="mb-4 opacity-80" />
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm opacity-90">{stat.title}</div>
          </Card>
        ))}
      </div>

      <Card className="glass-effect border-primary/20">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Управление пользователями</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-4">
            <Input placeholder="Поиск по имени или ID..." className="flex-1 bg-background/50" />
            <Button className="gradient-blue">
              <Icon name="Plus" size={20} className="mr-2" />
              Добавить пользователя
            </Button>
          </div>
          
          <div className="space-y-2">
            {[
              { name: 'Александр Иванов', id: 'USR-001', balance: 1247850, status: 'active' },
              { name: 'Мария Петрова', id: 'USR-002', balance: 850000, status: 'active' },
              { name: 'Иван Сидоров', id: 'USR-003', balance: 420000, status: 'pending' },
            ].map((user) => (
              <div key={user.id} className="p-4 rounded-lg bg-card border border-border flex items-center justify-between hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/30">
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">{user.balance.toLocaleString('ru-RU')} ₽</div>
                    <Badge variant={user.status === 'active' ? 'default' : 'outline'} className="mt-1">
                      {user.status === 'active' ? 'Активен' : 'Ожидание'}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Icon name="MoreVertical" size={20} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass-effect border-primary/20 p-6">
        <h2 className="text-xl font-semibold mb-4">Настройки платёжных систем</h2>
        <div className="space-y-4">
          {[
            { name: 'МИР', enabled: true },
            { name: 'VISA / Mastercard (Международные)', enabled: false },
            { name: 'Крипто-интеграция', enabled: false },
            { name: 'Пользовательские платёжные системы', enabled: false },
          ].map((system) => (
            <div key={system.name} className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
              <div className="font-medium">{system.name}</div>
              <Switch defaultChecked={system.enabled} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Профиль</h1>
      
      <Card className="glass-effect border-primary/20 p-6">
        <div className="flex items-center gap-6 mb-6">
          <Avatar className="h-24 w-24 border-4 border-primary/30">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-blue text-white text-3xl">АИ</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Александр Иванов</h2>
            <p className="text-muted-foreground">+7 (999) 123-45-67</p>
            <Badge className="mt-2 bg-accent">Premium клиент</Badge>
          </div>
          <Button variant="outline">Редактировать</Button>
        </div>
        
        <Separator className="my-6" />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Icon name="Shield" size={20} className="text-primary" />
              <span>Безопасность</span>
            </div>
            <Icon name="ChevronRight" size={20} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Icon name="Bell" size={20} className="text-primary" />
              <span>Уведомления</span>
            </div>
            <Icon name="ChevronRight" size={20} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Icon name="HelpCircle" size={20} className="text-primary" />
              <span>Поддержка</span>
            </div>
            <Icon name="ChevronRight" size={20} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Icon name="Settings" size={20} className="text-primary" />
              <span>Настройки</span>
            </div>
            <Icon name="ChevronRight" size={20} />
          </div>
        </div>
      </Card>

      <Card className="glass-effect border-primary/20 p-6">
        <h3 className="font-semibold mb-4">Счета и накопления</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-gradient-card border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Основной счёт</span>
              <Icon name="Wallet" size={20} className="text-primary" />
            </div>
            <div className="text-2xl font-bold">{balance.toLocaleString('ru-RU')} ₽</div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-card border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Накопительный счёт (8% годовых)</span>
              <Icon name="TrendingUp" size={20} className="text-green-400" />
            </div>
            <div className="text-2xl font-bold">{savingsBalance.toLocaleString('ru-RU')} ₽</div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 border-r border-border p-6 min-h-screen glass-effect sticky top-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              XTXinvest
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Premium Banking</p>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'home', icon: 'Home', label: 'Главная' },
              { id: 'cards', icon: 'CreditCard', label: 'Карты' },
              { id: 'transfers', icon: 'Send', label: 'Переводы' },
              { id: 'rewards', icon: 'Gift', label: 'Поощрения' },
              { id: 'profile', icon: 'User', label: 'Профиль' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeSection === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-primary/10'
                }`}
              >
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </button>
            ))}
            
            <Separator className="my-4" />
            
            <button
              onClick={() => {
                setIsAdmin(!isAdmin);
                if (!isAdmin) setActiveSection('admin');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isAdmin && activeSection === 'admin'
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/10'
              }`}
            >
              <Icon name="Shield" size={20} />
              <span>Админ-панель</span>
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-8 max-w-6xl">
          {activeSection === 'home' && renderHome()}
          {activeSection === 'cards' && renderCards()}
          {activeSection === 'transfers' && renderTransfers()}
          {activeSection === 'rewards' && renderRewards()}
          {activeSection === 'profile' && renderProfile()}
          {activeSection === 'admin' && renderAdmin()}
        </main>
      </div>
    </div>
  );
};

export default Index;
