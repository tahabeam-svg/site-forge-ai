import { useState } from "react";
import { useAuth } from "@/lib/auth";
import DashboardLayout from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Plus,
  Trash2,
  Star,
  Shield,
  X,
} from "lucide-react";

interface PaymentCard {
  id: string;
  last4: string;
  brand: string;
  expiry: string;
  isDefault: boolean;
}

export default function PaymentMethodsPage() {
  const { language } = useAuth();
  const lang = language;
  const [showAddCard, setShowAddCard] = useState(false);
  const [cards, setCards] = useState<PaymentCard[]>([
    { id: "1", last4: "4242", brand: "Visa", expiry: "12/27", isDefault: true },
  ]);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const handleSetDefault = (id: string) => {
    setCards(cards.map((c) => ({ ...c, isDefault: c.id === id })));
  };

  const handleRemove = (id: string) => {
    setCards(cards.filter((c) => c.id !== id));
  };

  const handleAdd = () => {
    if (!cardNumber || !expiry || !cvc) return;
    const newCard: PaymentCard = {
      id: Date.now().toString(),
      last4: cardNumber.replace(/\s/g, "").slice(-4),
      brand: cardNumber.startsWith("4") ? "Visa" : "Mastercard",
      expiry,
      isDefault: cards.length === 0,
    };
    setCards([...cards, newCard]);
    setShowAddCard(false);
    setCardNumber("");
    setExpiry("");
    setCvc("");
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-payment-title">
              <CreditCard className="w-6 h-6 text-emerald-600" />
              {lang === "ar" ? "طرق الدفع" : "Payment Methods"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {lang === "ar" ? "إدارة بطاقاتك وطرق الدفع" : "Manage your cards and payment methods"}
            </p>
          </div>
          <Button
            onClick={() => setShowAddCard(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
            data-testid="button-add-card"
          >
            <Plus className="w-4 h-4 me-1" />
            {lang === "ar" ? "إضافة بطاقة" : "Add Card"}
          </Button>
        </div>

        {showAddCard && (
          <Card className="p-5 border-emerald-200 dark:border-emerald-800" data-testid="card-add-payment">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {lang === "ar" ? "إضافة بطاقة جديدة" : "Add New Card"}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddCard(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {lang === "ar" ? "رقم البطاقة" : "Card Number"}
                </label>
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  data-testid="input-card-number"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {lang === "ar" ? "تاريخ الانتهاء" : "Expiry Date"}
                  </label>
                  <Input
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    data-testid="input-card-expiry"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">CVC</label>
                  <Input
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    type="password"
                    data-testid="input-card-cvc"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAdd} className="bg-emerald-600" data-testid="button-save-card">
                  {lang === "ar" ? "حفظ البطاقة" : "Save Card"}
                </Button>
                <Button variant="outline" onClick={() => setShowAddCard(false)}>
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />
              {lang === "ar" ? "معلومات الدفع مشفرة وآمنة" : "Payment information is encrypted and secure"}
            </div>
          </Card>
        )}

        <div className="space-y-3">
          {cards.length === 0 ? (
            <Card className="p-12 text-center">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {lang === "ar" ? "لا توجد بطاقات مضافة" : "No cards added yet"}
              </p>
            </Card>
          ) : (
            cards.map((card) => (
              <Card key={card.id} className={`p-5 ${card.isDefault ? "border-emerald-300 dark:border-emerald-700" : ""}`} data-testid={`card-payment-${card.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-10 rounded-lg flex items-center justify-center ${
                      card.brand === "Visa" ? "bg-blue-100 dark:bg-blue-900" : "bg-orange-100 dark:bg-orange-900"
                    }`}>
                      <CreditCard className={`w-6 h-6 ${
                        card.brand === "Visa" ? "text-blue-700 dark:text-blue-300" : "text-orange-700 dark:text-orange-300"
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{card.brand} •••• {card.last4}</p>
                        {card.isDefault && (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs">
                            <Star className="w-3 h-3 me-1" />
                            {lang === "ar" ? "الافتراضية" : "Default"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {lang === "ar" ? "تنتهي في" : "Expires"} {card.expiry}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!card.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(card.id)}
                        data-testid={`button-set-default-${card.id}`}
                      >
                        {lang === "ar" ? "تعيين كافتراضي" : "Set Default"}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemove(card.id)}
                      data-testid={`button-remove-card-${card.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <Card className="p-5">
          <h3 className="font-semibold mb-3">
            {lang === "ar" ? "طرق دفع أخرى" : "Other Payment Methods"}
          </h3>
          <div className="space-y-2">
            {[
              { name: lang === "ar" ? "مدى" : "Mada", desc: lang === "ar" ? "بطاقات مدى السعودية" : "Saudi Mada cards", available: true },
              { name: "Apple Pay", desc: lang === "ar" ? "الدفع عبر أبل باي" : "Pay with Apple Pay", available: true },
              { name: "STC Pay", desc: lang === "ar" ? "الدفع عبر STC Pay" : "Pay with STC Pay", available: false },
            ].map((method, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border" data-testid={`row-payment-method-${i}`}>
                <div>
                  <p className="text-sm font-medium">{method.name}</p>
                  <p className="text-xs text-muted-foreground">{method.desc}</p>
                </div>
                <Badge variant={method.available ? "secondary" : "outline"}>
                  {method.available
                    ? (lang === "ar" ? "متاح" : "Available")
                    : (lang === "ar" ? "قريباً" : "Coming Soon")}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
