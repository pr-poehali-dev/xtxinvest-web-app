import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface SavingsDepositFormProps {
  userId: number;
  onSuccess: () => void;
}

export const SavingsDepositForm = ({ userId, onSuccess }: SavingsDepositFormProps) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast({ title: 'Некорректная сумма', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/7f5968ea-5199-4fb7-8833-920e7b0ec3c9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, amount: depositAmount })
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Успешно!', description: `${depositAmount} ₽ переведено на накопительный счёт` });
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
        <Label htmlFor="deposit-amount">Сумма пополнения</Label>
        <Input
          id="deposit-amount"
          type="number"
          placeholder="1000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <Button onClick={handleDeposit} disabled={loading} className="w-full">
        {loading ? 'Перевод...' : 'Пополнить'}
      </Button>
    </div>
  );
};
