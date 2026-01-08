import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { 
  Check, 
  CreditCard, 
  Download,
  Zap,
  Building2,
  Users,
  Sparkles,
  Shield,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

type Plan = 'free' | 'pro' | 'enterprise';

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'cancelled';
  plan: Plan;
}

const Billing = () => {
  const { t, language } = useLanguage();
  const [currentPlan, setCurrentPlan] = useState<Plan>('free');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan>('pro');
  const [isProcessing, setIsProcessing] = useState(false);
  const dateLocale = language === 'fr' ? fr : enUS;

  // Demo invoices
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: '1', number: 'INV-2025-001', date: new Date(2025, 0, 15).toISOString(), amount: 15000, status: 'paid', plan: 'pro' },
    { id: '2', number: 'INV-2024-012', date: new Date(2024, 11, 15).toISOString(), amount: 15000, status: 'paid', plan: 'pro' },
    { id: '3', number: 'INV-2024-011', date: new Date(2024, 10, 15).toISOString(), amount: 15000, status: 'paid', plan: 'pro' },
  ]);

  const plans: { key: Plan; icon: React.ElementType; popular?: boolean }[] = [
    { key: 'free', icon: Users },
    { key: 'pro', icon: Zap, popular: true },
    { key: 'enterprise', icon: Building2 },
  ];

  const getPlanPrice = (plan: Plan) => {
    switch (plan) {
      case 'free': return 0;
      case 'pro': return 15000;
      case 'enterprise': return 50000;
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    if (plan === currentPlan) return;
    setSelectedPlan(plan);
    if (plan !== 'free') {
      setShowPaymentDialog(true);
    } else {
      // Downgrade to free
      setCurrentPlan('free');
      toast.success(language === 'fr' ? 'Plan mis à jour vers Gratuit' : 'Plan updated to Free');
    }
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create new invoice
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      number: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString(),
      amount: getPlanPrice(selectedPlan),
      status: 'paid',
      plan: selectedPlan,
    };
    
    setInvoices(prev => [newInvoice, ...prev]);
    setCurrentPlan(selectedPlan);
    setIsProcessing(false);
    setShowPaymentDialog(false);
    
    toast.success(t.billing.paymentSimulated);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(language === 'fr' ? 'fr-CM' : 'en-CM').format(amount);
  };

  return (
    <DashboardLayout title={t.billing.title} subtitle="">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Current Plan Banner */}
        {currentPlan !== 'free' && (
          <div className="p-6 rounded-xl gradient-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">
                    {t.billing.plans[currentPlan].name}
                  </h3>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {t.billing.active}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">
                  {formatPrice(getPlanPrice(currentPlan))} {t.common.currency}
                  <span className="text-sm font-normal opacity-80">{t.billing.perMonth}</span>
                </p>
                <p className="text-sm opacity-80 mt-1">
                  {t.billing.nextRenewal} {format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'dd MMMM yyyy', { locale: dateLocale })}
                </p>
              </div>
              <Sparkles className="w-12 h-12 opacity-50" />
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-6">{language === 'fr' ? 'Choisir un plan' : 'Choose a plan'}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(({ key, icon: Icon, popular }) => {
              const planData = t.billing.plans[key];
              const isCurrentPlan = currentPlan === key;
              
              return (
                <Card 
                  key={key} 
                  className={cn(
                    "relative transition-all hover:shadow-lg",
                    popular && "border-primary shadow-md",
                    isCurrentPlan && "ring-2 ring-primary"
                  )}
                >
                  {popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="default" className="gradient-primary border-0">
                        {language === 'fr' ? 'Plus populaire' : 'Most popular'}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className={cn(
                      "w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4",
                      key === 'free' ? 'bg-muted' : key === 'pro' ? 'gradient-primary' : 'bg-accent'
                    )}>
                      <Icon className={cn(
                        "w-6 h-6",
                        key === 'free' ? 'text-muted-foreground' : 'text-white'
                      )} />
                    </div>
                    <CardTitle>{planData.name}</CardTitle>
                    <CardDescription>{planData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{planData.price}</span>
                      {key !== 'free' && (
                        <span className="text-muted-foreground ml-1">
                          {t.common.currency}{t.billing.perMonth}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-3 text-left">
                      {planData.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-status-done shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant={isCurrentPlan ? "secondary" : popular ? "gradient" : "outline"}
                      className="w-full"
                      onClick={() => handleSelectPlan(key)}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan 
                        ? t.billing.currentlyActive 
                        : key === 'free' 
                          ? (language === 'fr' ? 'Rétrograder' : 'Downgrade')
                          : `${t.billing.upgrade} ${planData.name}`
                      }
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t.billing.paymentMethod}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
              <div className="w-16 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded flex items-center justify-center text-white text-xs font-bold">
                MTN
              </div>
              <div className="flex-1">
                <p className="font-medium">MTN Mobile Money</p>
                <p className="text-sm text-muted-foreground">+237 6XX XXX XXX</p>
              </div>
              <Button variant="outline" size="sm">{t.billing.edit}</Button>
            </div>
            <div className="flex items-center gap-4 p-4 border border-border rounded-lg mt-3">
              <div className="w-16 h-10 bg-gradient-to-r from-orange-600 to-orange-400 rounded flex items-center justify-center text-white text-xs font-bold">
                OM
              </div>
              <div className="flex-1">
                <p className="font-medium">Orange Money</p>
                <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Ajouter un compte' : 'Add account'}</p>
              </div>
              <Button variant="outline" size="sm">{t.common.add}</Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>{t.billing.invoices}</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="space-y-3">
                {invoices.map(invoice => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{invoice.number}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(invoice.date), 'dd MMMM yyyy', { locale: dateLocale })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(invoice.amount)} {t.common.currency}</p>
                        <Badge 
                          variant={invoice.status === 'paid' ? 'default' : invoice.status === 'pending' ? 'secondary' : 'destructive'}
                          className={invoice.status === 'paid' ? 'bg-status-done' : ''}
                        >
                          {t.billing[invoice.status]}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {language === 'fr' ? 'Aucune facture' : 'No invoices'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Payment Simulation Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t.billing.simulatePayment}</DialogTitle>
              <DialogDescription>
                {language === 'fr' 
                  ? `Simuler le paiement pour le plan ${t.billing.plans[selectedPlan].name}` 
                  : `Simulate payment for ${t.billing.plans[selectedPlan].name} plan`
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-secondary rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>{t.billing.plans[selectedPlan].name}</span>
                  <span className="font-medium">{formatPrice(getPlanPrice(selectedPlan))} {t.common.currency}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{language === 'fr' ? 'Période' : 'Period'}</span>
                  <span>{language === 'fr' ? '1 mois' : '1 month'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>{language === 'fr' ? 'Numéro Mobile Money' : 'Mobile Money Number'}</Label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 bg-secondary rounded-lg">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">+237</span>
                  </div>
                  <Input placeholder="6XX XXX XXX" defaultValue="699 123 456" />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  {language === 'fr' 
                    ? 'Ceci est une simulation. Aucun paiement réel ne sera effectué.' 
                    : 'This is a simulation. No real payment will be processed.'
                  }
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                {t.common.cancel}
              </Button>
              <Button 
                onClick={handleSimulatePayment} 
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    {language === 'fr' ? 'Traitement...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    {t.billing.simulatePayment}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
