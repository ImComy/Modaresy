import { format } from 'date-fns';
import { Star, Percent, Calendar, Info, BadgePercent } from 'lucide-react';

export const handleSubjectChange = (field, value, subjectIndex, setTutor, markDirty) => {
  if (!setTutor || typeof subjectIndex !== 'number' || subjectIndex < 0) return;

  setTutor((prev) => {
    if (!prev?.subjects || !Array.isArray(prev.subjects)) return prev;
    const updatedSubjects = [...prev.subjects];
    updatedSubjects[subjectIndex] = {
      ...updatedSubjects[subjectIndex],
      [field]: value,
    };
    return {
      ...prev,
      subjects: updatedSubjects,
    };
  });

  if (markDirty) markDirty();
};

export const handlePriceChange = (value, setPrice, onChange, setHasUnsavedChanges) => {
  const numericValue = value === '' ? '' : Number(value) || 0;
  setPrice(numericValue.toString());
  setHasUnsavedChanges(true);
  onChange('price', numericValue);
};

export const handlePricePeriodChange = (value, setPricePeriod, onChange, setHasUnsavedChanges) => {
  if (!['1', '2'].includes(value)) return;
  setPricePeriod(value);
  setHasUnsavedChanges(true);
  onChange('pricePeriod', value);
};

export const handlePrivatePricingChange = (
  value,
  field,
  privateSession,
  setPrivateSession,
  onChange,
  setHasUnsavedChanges
) => {
  if (!privateSession || !setPrivateSession || !onChange) return;
  const updated = {
    ...privateSession,
    [field]: field === 'price' ? (value === '' ? '' : Number(value) || 0) : value,
  };
  setPrivateSession(updated);
  setHasUnsavedChanges(true);
  onChange('private', updated);
};

export const handleSubjectBioChange = (value, setBio, onChange, setHasUnsavedChanges) => {
  if (typeof value !== 'string') return;
  setBio(value);
  setHasUnsavedChanges(true);
  onChange('bio', value);
};

export const handleOfferChange = (value, field, setOffer, onChange, setHasUnsavedChanges) => {
  if (!setOffer || !onChange) return;
  setOffer((prev) => {
    const updated = {
      ...prev,
      [field]: field === 'percentage' ? (value === '' ? '' : Number(value) || 0) : value,
    };
    onChange('offer', updated);
    setHasUnsavedChanges(true);
    return updated;
  });
};

export const handlePaymentTimingChange = (value, setPaymentTiming, onChange, setHasUnsavedChanges) => {
  if (!['true', 'false', 'unspecified'].includes(value)) return;
  setPaymentTiming(value);
  setHasUnsavedChanges(true);
  onChange('paymentTiming', value === 'unspecified' ? '' : value === 'true');
};

export const handlePaymentMethodToggle = (
  method,
  paymentMethods,
  setPaymentMethods,
  onChange,
  setHasUnsavedChanges
) => {
  if (!setPaymentMethods || !onChange || !Array.isArray(paymentMethods)) return;
  const updated = paymentMethods.includes(method)
    ? paymentMethods.filter((m) => m !== method)
    : [...paymentMethods, method];
  setPaymentMethods(updated);
  setHasUnsavedChanges(true);
  onChange('paymentMethods', updated);
};

export const handleAdditionalPricingChange = (
  index,
  field,
  value,
  additionalPricing,
  setAdditionalPricing,
  onChange,
  setHasUnsavedChanges
) => {
  if (!setAdditionalPricing || !onChange || !Array.isArray(additionalPricing) || index < 0) return;
  const updated = [...additionalPricing];
  updated[index] = {
    ...updated[index],
    [field]: field === 'price' ? (value === '' ? '' : Number(value) || 0) : value,
  };
  setAdditionalPricing(updated);
  setHasUnsavedChanges(true);
  onChange('additionalPricing', updated);
};

export const addAdditionalPricing = (
  newAdditionalPricing,
  additionalPricing,
  setAdditionalPricing,
  setNewAdditionalPricing,
  onChange,
  setHasUnsavedChanges
) => {
  if (
    !newAdditionalPricing.name ||
    !newAdditionalPricing.price ||
    Number(newAdditionalPricing.price) <= 0
  ) {
    return;
  }
  const updated = [
    ...additionalPricing,
    {
      ...newAdditionalPricing,
      price: Number(newAdditionalPricing.price),
      period: newAdditionalPricing.period || '2',
    },
  ];
  setAdditionalPricing(updated);
  setHasUnsavedChanges(true);
  onChange('additionalPricing', updated);
  setNewAdditionalPricing({ name: '', price: '', period: '2', description: '' });
};

export const removeAdditionalPricing = (
  index,
  additionalPricing,
  setAdditionalPricing,
  onChange,
  setHasUnsavedChanges
) => {
  if (!setAdditionalPricing || !onChange || !Array.isArray(additionalPricing) || index < 0) return;
  const updated = additionalPricing.filter((_, i) => i !== index);
  setAdditionalPricing(updated);
  setHasUnsavedChanges(true);
  onChange('additionalPricing', updated);
};

export const renderStars = (rating) => {
  if (typeof rating !== 'number' || rating < 0 || rating > 5) return [];
  const stars = [];
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={`full-${i}`} size={14} className="text-yellow-400 fill-yellow-400" />
    );
  }

  if (halfStar && stars.length < 5) {
    stars.push(
      <Star key="half" size={14} className="text-yellow-400 fill-yellow-400 opacity-50" />
    );
  }

  while (stars.length < 5) {
    stars.push(
      <Star key={`empty-${stars.length}`} size={14} className="text-muted-foreground" />
    );
  }

  return stars;
};

export const renderOfferSection = (offer, t) =>
  offer?.percentage > 0 && (
    <div className="p-4 border border-[hsl(var(--success))] bg-[hsl(var(--success)/0.15)] rounded-xl space-y-2">
      <div className="flex items-center gap-2 text-[hsl(var(--success-foreground))] font-semibold">
        <Percent size={18} className="text-[hsl(var(--success-foreground))]" />
        <span>{offer.percentage}% {t('discount', 'Off')}</span>
      </div>

      {(offer.from || offer.to) && (
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--success-foreground)/0.9)]">
          <Calendar size={16} />
          <span>
            {offer.from && format(new Date(offer.from), 'MMM d, yyyy')} –{' '}
            {offer.to && format(new Date(offer.to), 'MMM d, yyyy')}
          </span>
        </div>
      )}

      {offer.description && (
        <div className="flex items-start gap-2 text-sm text-[hsl(var(--success-foreground))] bg-background border border-[hsl(var(--success)/0.3)] rounded-md p-2">
          <Info size={14} className="mt-0.5 text-[hsl(var(--success-foreground))]" />
          <span>{offer.description}</span>
        </div>
      )}
    </div>
  );

export const renderPriceWithOffer = (basePrice, percentage, t) => {
  if (typeof basePrice !== 'number' || typeof percentage !== 'number' || percentage <= 0) {
    return <span className="text-sm font-semibold">{t('EGP')} {basePrice}</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm line-through text-muted-foreground">{t('EGP')} {basePrice}</span>
      <span className="text-sm font-semibold text-green-700">
        {t('EGP')} {(basePrice * (1 - percentage / 100)).toFixed(0)}
      </span>
      <BadgePercent className="text-green-700" variant="outline">
        -{percentage}%
      </BadgePercent>
    </div>
  );
};