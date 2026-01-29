import { useState, useEffect } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [adminData, setAdminData] = useState<any>(null);
  const [paymentSystems, setPaymentSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createCardOpen, setCreateCardOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCardType, setSelectedCardType] = useState('МИР');
  const [creatingCard, setCreatingCard] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
    fetchAdminData();
    fetchPaymentSystems();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/6c003deb-8849-4f38-84ef-37cc8887b102?user_id=1');
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      toast({ title: 'Ошибка загрузки данных', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/442de5b0-88c5-4622-aa19-5a3048392fc2');
      const data = await response.json();
      setAdminData(data);
    } catch (error) {
      console.error('Ошибка загрузки админ данных:', error);
    }
  };

  const fetchPaymentSystems = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/323a843c-1b38-4d70-8329-564c95a8ff2e');
      const data = await response.json();
      setPaymentSystems(data.payment_systems || []);
    } catch (error) {
      console.error('Ошибка загрузки платёжных систем:', error);
    }
  };

  const createVirtualCard = async () => {
    if (!selectedUserId) {
      toast({ title: 'Выберите пользователя', variant: 'destructive' });
      return;
    }

    setCreatingCard(true);
    try {
      const response = await fetch('https://functions.poehali.dev/411cd977-ca70-4564-8be5-7c59bbaff76e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: parseInt(selectedUserId), card_type: selectedCardType })
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Виртуальная карта создана', description: `Карта ${data.card_type} успешно выпущена` });
        setCreateCardOpen(false);
        fetchAdminData();
      } else {
        toast({ title: 'Ошибка создания карты', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка сети', variant: 'destructive' });
    } finally {
      setCreatingCard(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  const balance = userData?.accounts?.reduce((sum: number, acc: any) => sum + acc.balance, 0) || 0;
  const savingsBalance = userData?.accounts?.find((acc: any) => acc.account_type === 'savings')?.balance || 0;
  
  const getCardColor = (type: string) => {
    if (type === 'МИР') return 'from-blue-600 to-blue-400';
    if (type === 'VISA') return 'from-purple-600 to-purple-400';
    return 'from-cyan-600 to-cyan-400';
  };
  
  const getTransactionIcon = (type: string) => {
    if (type === 'expense') return 'ShoppingBag';
    if (type === 'income') return 'TrendingUp';
    if (type === 'reward') return 'Gift';
    return 'ArrowRightLeft';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const cards = userData?.cards?.map((card: any) => ({
    ...card,
    type: card.card_type,
    number: '•••• ' + card.card_number.slice(-4),
    color: getCardColor(card.card_type)
  })) || [];

  const transactions = userData?.transactions?.map((tx: any) => ({
    ...tx,
    title: tx.recipient_name || tx.description,
    date: formatDate(tx.created_at),
    icon: getTransactionIcon(tx.transaction_type)
  })) || [];

  const rewards = [
    { title: 'Кэшбэк на покупки', value: '5%', icon: 'Percent' },
    { title: 'Бонусные рубли', value: userData?.total_rewards?.toLocaleString('ru-RU') || '0', icon: 'Coins' },
    { title: 'Уровень привилегий', value: userData?.user?.premium_level === 'premium' ? 'Premium' : 'Standard', icon: 'Crown' },
  ];

  const renderHome = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Добрый день, {userData?.user?.full_name?.split(' ')[0] || 'Пользователь'}
          </h1>
          <p className="text-muted-foreground mt-1">Добро пожаловать в XTXinvest</p>
        </div>
        <Avatar className="h-14 w-14 border-2 border-primary">
          <AvatarImage src="" />
          <AvatarFallback className="bg-gradient-blue text-white text-lg">
            {userData?.user?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
          </AvatarFallback>
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
            <div className="text-4xl font-bold">{(userData?.total_rewards || 0).toLocaleString('ru-RU')} ₽</div>
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
          { title: 'Всего пользователей', value: adminData?.stats?.total_users || 0, icon: 'Users', color: 'from-blue-600 to-blue-400' },
          { title: 'Активных карт', value: adminData?.stats?.total_cards || 0, icon: 'CreditCard', color: 'from-purple-600 to-purple-400' },
          { title: 'Транзакций сегодня', value: adminData?.stats?.today_transactions || 0, icon: 'TrendingUp', color: 'from-cyan-600 to-cyan-400' },
        ].map((stat) => (
          <Card key={stat.title} className={`p-6 bg-gradient-to-br ${stat.color} border-0 text-white`}>
            <Icon name={stat.icon} size={32} className="mb-4 opacity-80" />
            <div className="text-3xl font-bold mb-1">{stat.value.toLocaleString('ru-RU')}</div>
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
            {(adminData?.users || []).map((user: any) => (
              <div key={user.id} className="p-4 rounded-lg bg-card border border-border flex items-center justify-between hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/30">
                    <AvatarFallback>{user.full_name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-sm text-muted-foreground">{user.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">{user.total_balance.toLocaleString('ru-RU')} ₽</div>
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
          {paymentSystems.map((system) => (
            <div key={system.id} className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
              <div className="font-medium">{system.system_name}</div>
              <Switch defaultChecked={system.enabled} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="glass-effect border-primary/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Выпуск виртуальных карт</h2>
          <Dialog open={createCardOpen} onOpenChange={setCreateCardOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-blue">
                <Icon name="CreditCard" size={20} className="mr-2" />
                Создать карту
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создание виртуальной карты</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Пользователь</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите пользователя" />
                    </SelectTrigger>
                    <SelectContent>
                      {(adminData?.users || []).map((user: any) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.full_name} ({user.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Тип карты</Label>
                  <Select value={selectedCardType} onValueChange={setSelectedCardType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="МИР">МИР</SelectItem>
                      <SelectItem value="Visa">Visa</SelectItem>
                      <SelectItem value="Mastercard">Mastercard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={createVirtualCard} 
                  disabled={creatingCard}
                  className="w-full gradient-blue"
                >
                  {creatingCard ? 'Создание...' : 'Создать виртуальную карту'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-muted-foreground">
          Выпуск виртуальных карт для пользователей без физического носителя
        </p>
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
            <AvatarFallback className="bg-gradient-blue text-white text-3xl">
              {userData?.user?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{userData?.user?.full_name || 'Пользователь'}</h2>
            <p className="text-muted-foreground">{userData?.user?.phone || ''}</p>
            <Badge className="mt-2 bg-accent">
              {userData?.user?.premium_level === 'premium' ? 'Premium клиент' : 'Стандартный клиент'}
            </Badge>
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