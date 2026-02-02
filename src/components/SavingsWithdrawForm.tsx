import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface SavingsWithdrawFormProps {
  userId: number;
  onSuccess: () => void;
}

export const SavingsWithdrawForm = ({ userId, onSuccess }: SavingsWithdrawFormProps) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast({ title: 'Некорректная сумма', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/04e17fbf-ad37-43ec-b2bd-4fc86088f12a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, amount: withdrawAmount })
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Успешно!', description: `${withdrawAmount} ₽ снято с накопительного счёта` });
        setAmount('');
        onSuccess();
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка сети', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div>
        <Label htmlFor="withdraw-amount">Сумма снятия</Label>
        <Input
          id="withdraw-amount"
          type="number"
          placeholder="1000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <Button onClick={handleWithdraw} disabled={loading} className="w-full">
        {loading ? 'Снятие...' : 'Снять'}
      </Button>
    </div>
  );
};
