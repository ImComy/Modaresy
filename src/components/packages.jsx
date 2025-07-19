import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const SubscriptionCard = ({
  titleKey,
  descriptionKey,
  perkKeys,
  price,
  isSelected,
  onSelect,
  theme = {
    borderColor: 'border-primary',
    bgFrom: 'from-primary/10',
  },
  direction = 'ltr',
}) => {
  const { t } = useTranslation();
  const isRTL = direction === 'rtl';

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      dir={direction}
      className={`relative group cursor-pointer rounded-xl border-2 p-5 sm:p-6 shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 flex flex-col justify-between ${
        isSelected
          ? `bg-background ring-2 ring-primary ${theme.borderColor}`
          : 'border-border hover:border-primary/50 hover:shadow-md'
      }`}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 z-0 bg-gradient-to-tr opacity-30 pointer-events-none rounded-lg ${theme.bgFrom} to-transparent`}
      />

      {/* Radio Indicator */}
      <div
        className={`absolute top-4 ${
          isRTL ? 'left-4' : 'right-4'
        } w-5 h-5 border-2 rounded-full flex items-center justify-center z-10 ${
          isSelected ? 'border-primary bg-primary' : 'border-muted'
        }`}
      >
        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
      </div>

      {/* Card Content */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-primary mb-2">
            {t(titleKey)}
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {price}
          </p>
          <p className="text-muted-foreground text-sm sm:text-base italic mb-2">
            {t(descriptionKey)}
          </p>
        </div>
        <ul className="space-y-2 mt-auto">
          {perkKeys.map((key, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-sm sm:text-base text-foreground"
            >
              <span className="text-success mt-[2px]">✓</span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const SubscriptionSection = () => {
  const { i18n, t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState('free');

  const direction = i18n.dir(); // automatically uses 'rtl' or 'ltr'

  useEffect(() => {
    setSelectedPlan('free');
  }, []);

  const handleSelect = (plan) => setSelectedPlan(plan);

  return (
    <section
      className="bg-background text-foreground py-8 sm:py-12 px-4 w-full"
      dir={direction}
    >
      <div className="w-full max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary mb-2">
            {t('subscription.choosePlan')}
          </h1>
          {!selectedPlan && (
            <p className="text-sm sm:text-base text-muted-foreground animate-pulse">
              {t('subscription.selectToContinue')}
            </p>
          )}
        </div>

        <div
          className="flex flex-col sm:flex-col gap-6 justify-center items-stretch"
          role="radiogroup"
        >
          <SubscriptionCard
            titleKey="subscription.free.title"
            descriptionKey="subscription.free.description"
            perkKeys={[
              'subscription.free.perk1',
              'subscription.free.perk2',
              'subscription.free.perk3',
              'subscription.free.perk4',
            ]}
            price="0 EGP"
            isSelected={selectedPlan === 'free'}
            onSelect={() => handleSelect('free')}
            theme={{
              borderColor: 'border-blue-500',
              bgFrom: 'from-blue-100',
            }}
            direction={direction}
          />
          <SubscriptionCard
            titleKey="subscription.special.title"
            descriptionKey="subscription.special.description"
            perkKeys={[
              'subscription.special.perk1',
              'subscription.special.perk2',
              'subscription.special.perk3',
              'subscription.special.perk4',
            ]}
            price="1000 EGP"
            isSelected={selectedPlan === 'special'}
            onSelect={() => handleSelect('special')}
            theme={{
              borderColor: 'border-yellow-500',
              bgFrom: 'from-yellow-100',
            }}
            direction={direction}
          />
        </div>
      </div>
    </section>
  );
};

export default SubscriptionSection;
