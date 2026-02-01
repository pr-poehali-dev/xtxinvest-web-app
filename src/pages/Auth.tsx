import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin 
        ? 'https://functions.poehali.dev/6d1d8ac7-e3fa-4dba-9f54-9a72566b16e5' // login
        : 'https://functions.poehali.dev/56263a08-83a9-4660-9c27-1227f40eff6e'; // register

      const body = isLogin 
        ? { phone }
        : { phone, full_name: fullName };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        // Сохраняем user_id в localStorage
        if (data.user && data.user.id) {
          localStorage.setItem('user_id', data.user.id.toString());
        }
        
        toast({ 
          title: isLogin ? '✨ Добро пожаловать!' : '🎉 Аккаунт создан!',
          description: isLogin ? 'Вход выполнен успешно' : 'Регистрация прошла успешно'
        });
        
        // Redirect to main app
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        console.error('Registration error:', data);
        toast({ 
          title: 'Ошибка', 
          description: data.error || data.message || 'Что-то пошло не так',
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Network error:', error);
      toast({ 
        title: 'Ошибка сети', 
        description: error instanceof Error ? error.message : 'Проверьте подключение к интернету',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <Card className="w-full max-w-md glass-effect border-primary/20 shadow-2xl relative z-10 overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-accent" />
        
        <div className="p-8 space-y-6">
          {/* Logo & Title */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-2 shadow-lg">
              <Icon name="TrendingUp" size={40} className="text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              XTXinvest
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
            </p>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <Icon name="User" size={16} className="text-primary" />
                  Полное имя
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Иван Иванов"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="border-primary/20 focus:border-primary transition-colors"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Icon name="Phone" size={16} className="text-primary" />
                Номер телефона
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="border-primary/20 focus:border-primary transition-colors"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full gradient-blue h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Загрузка...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Icon name={isLogin ? 'LogIn' : 'UserPlus'} size={20} />
                  {isLogin ? 'Войти' : 'Зарегистрироваться'}
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">или</span>
            </div>
          </div>

          {/* Toggle Auth Mode */}
          <Button
            type="button"
            variant="ghost"
            className="w-full border border-primary/20 hover:border-primary/40 hover:bg-primary/5"
            onClick={() => {
              setIsLogin(!isLogin);
              setPhone('');
              setFullName('');
            }}
          >
            {isLogin ? (
              <>
                <Icon name="UserPlus" size={18} className="mr-2" />
                Нет аккаунта? Создайте новый
              </>
            ) : (
              <>
                <Icon name="LogIn" size={18} className="mr-2" />
                Уже есть аккаунт? Войдите
              </>
            )}
          </Button>

          {/* Features */}
          <div className="pt-6 space-y-3 border-t border-primary/10">
            <p className="text-xs text-center text-muted-foreground mb-3">
              Преимущества XTXinvest:
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="space-y-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Shield" size={18} className="text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Безопасно</p>
              </div>
              <div className="space-y-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Icon name="Zap" size={18} className="text-secondary" />
                </div>
                <p className="text-xs text-muted-foreground">Быстро</p>
              </div>
              <div className="space-y-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Icon name="Globe" size={18} className="text-accent" />
                </div>
                <p className="text-xs text-muted-foreground">Удобно</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-xs text-muted-foreground">
          © 2024 XTXinvest. Все права защищены
        </p>
      </div>
    </div>
  );
};

export default Auth;