import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, DollarSign } from 'lucide-react';
import { SearchableSelectContent } from '@/components/ui/searchSelect';
import { useTranslation } from 'react-i18next';

const SUBJECTS = ['Math', 'Science', 'English'];

const PAYMENT_METHODS = [
  { id: 1, label: 'vodafoneCash', defaultLabel: 'Vodafone Cash' },
  { id: 2, label: 'bankTransfer', defaultLabel: 'Bank Transfer' },
  { id: 3, label: 'creditCard', defaultLabel: 'Credit Card' },
  { id: 4, label: 'cash', defaultLabel: 'Cash' },
];

const PRICE_PERIODS = [
  { id: 1, label: 'month', defaultLabel: 'Month' },
  { id: 2, label: 'session', defaultLabel: 'Session' },
];

const PricesAndOffersSection = () => {
  const { t } = useTranslation();
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [pricingData, setPricingData] = useState(
    SUBJECTS.reduce((acc, subject) => {
      acc[subject] = {
        groupPrice: '',
        groupPricePeriod: 1, // Default to month
        privatePrice: '',
        privatePricePeriod: 2, // Default to session
        privateNote: '',
        additionalPricing: [],
        paymentMethods: [],
        paymentTiming: true, // Default to upfront
        offer: null,
      };
      return acc;
    }, {})
  );

  const handleUpdate = (field, value) => {
    setPricingData((prev) => ({
      ...prev,
      [selectedSubject]: {
        ...prev[selectedSubject],
        [field]: value,
      },
    }));
  };

  const updateOfferField = (field, value) => {
    setPricingData((prev) => ({
      ...prev,
      [selectedSubject]: {
        ...prev[selectedSubject],
        offer: {
          ...prev[selectedSubject].offer,
          [field]: value,
        },
      },
    }));
  };

  const addOffer = () => {
    setPricingData((prev) => ({
      ...prev,
      [selectedSubject]: {
        ...prev[selectedSubject],
        offer: { percentage: '', description: '', from: '', to: '', for: 'group' },
      },
    }));
  };

  const removeOffer = () => {
    setPricingData((prev) => ({
      ...prev,
      [selectedSubject]: {
        ...prev[selectedSubject],
        offer: null,
      },
    }));
  };

  const addAdditionalPricing = () => {
    setPricingData((prev) => ({
      ...prev,
      [selectedSubject]: {
        ...prev[selectedSubject],
        additionalPricing: [
          ...prev[selectedSubject].additionalPricing,
          { name: '', price: '', period: 2, description: '' }, // Default to session
        ],
      },
    }));
  };

  const updateAdditionalPricing = (index, field, value) => {
    setPricingData((prev) => ({
      ...prev,
      [selectedSubject]: {
        ...prev[selectedSubject],
        additionalPricing: prev[selectedSubject].additionalPricing.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  const removeAdditionalPricing = (index) => {
    setPricingData((prev) => ({
      ...prev,
      [selectedSubject]: {
        ...prev[selectedSubject],
        additionalPricing: prev[selectedSubject].additionalPricing.filter((_, i) => i !== index),
      },
    }));
  };

  const togglePaymentMethod = (methodId) => {
    setPricingData((prev) => ({
      ...prev,
      [selectedSubject]: {
        ...prev[selectedSubject],
        paymentMethods: prev[selectedSubject].paymentMethods.includes(methodId)
          ? prev[selectedSubject].paymentMethods.filter((id) => id !== methodId)
          : [...prev[selectedSubject].paymentMethods, methodId],
      },
    }));
  };

  const data = pricingData[selectedSubject];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <Card className="bg-muted/10 border border-border shadow-md">
        <CardHeader className="-mb-9">
          <CardTitle className="flex items-center gap-2 text-primary text-lg">
            <DollarSign className="w-10 h-10" />
            {t('pricesAndOffers', 'Prices and Offers')}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Subject Selection */}
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Label className="text-sm font-semibold text-primary">{t('selectSubject', 'Select Subject')}</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="mt-1 bg-background border-muted rounded-lg shadow-sm hover:border-primary transition-colors">
                <SelectValue placeholder={t('selectSubjectPlaceholder', 'Select Subject')} />
              </SelectTrigger>
              <SearchableSelectContent
                searchPlaceholder={t('searchSubjectPlaceholder', 'Search subject...')}
                items={SUBJECTS.map((subject) => ({
                  value: subject,
                  label: t(subject.toLowerCase(), subject),
                }))}
              />
            </Select>
          </motion.div>

          {/* Group and Private Pricing */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-4"
            >
              <Label className="text-sm font-semibold text-primary">{t('groupPricing', 'Group Lesson Price')}</Label>
              <div className="flex gap-2 items-end">
                <Input
                  type="number"
                  placeholder={t('groupPricePlaceholder', 'e.g. 200')}
                  value={data.groupPrice}
                  onChange={(e) => handleUpdate('groupPrice', e.target.value)}
                  className="bg-background border-muted hover:border-primary transition-colors"
                />
                <Select
                  value={data.groupPricePeriod}
                  onValueChange={(value) => handleUpdate('groupPricePeriod', parseInt(value))}
                >
                  <SelectTrigger className="w-32 bg-background border-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_PERIODS.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {t(period.label, period.defaultLabel)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="space-y-4"
            >
              <Label className="text-sm font-semibold text-primary">{t('privatePricing', 'Private Lesson Price (optional)')}</Label>
              <div className="flex gap-2 items-end">
                <Input
                  type="number"
                  placeholder={t('privatePricePlaceholder', 'e.g. 300')}
                  value={data.privatePrice}
                  onChange={(e) => handleUpdate('privatePrice', e.target.value)}
                  className="bg-background border-muted hover:border-primary transition-colors"
                />
                <Select
                  value={data.privatePricePeriod}
                  onValueChange={(value) => handleUpdate('privatePricePeriod', parseInt(value))}
                >
                  <SelectTrigger className="w-32 bg-background border-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_PERIODS.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {t(period.label, period.defaultLabel)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          </div>

          {/* Private Lesson Note */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Label className="text-sm font-semibold text-primary">{t('privateNote', 'Private Lesson Note (optional)')}</Label>
            <Input
              placeholder={t('privateNotePlaceholder', 'e.g. Only available on weekends')}
              value={data.privateNote}
              onChange={(e) => handleUpdate('privateNote', e.target.value)}
              className="bg-background border-muted hover:border-primary transition-colors"
            />
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="space-y-3"
          >
            <Label className="text-sm font-semibold text-primary">{t('paymentMethods', 'Payment Methods')}</Label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <div key={method.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={data.paymentMethods.includes(method.id)}
                    onCheckedChange={() => togglePaymentMethod(method.id)}
                    className="border-muted data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className="text-sm text-muted-foreground">{t(method.label, method.defaultLabel)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Payment Timing */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="space-y-3"
          >
            <Label className="text-sm font-semibold text-primary">{t('paymentTiming', 'Payment Timing')}</Label>
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdate('paymentTiming', true)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200
                  ${data.paymentTiming === true
                    ? 'bg-primary text-white border-primary'
                    : 'bg-muted border-border text-muted-foreground hover:border-primary'
                  }`}
                type="button"
              >
                {t('paidUpfront', 'Upfront')}
              </button>
              <button
                onClick={() => handleUpdate('paymentTiming', false)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200
                  ${data.paymentTiming === false
                    ? 'bg-primary text-white border-primary'
                    : 'bg-muted border-border text-muted-foreground hover:border-primary'
                  }`}
                type="button"
              >
                {t('paidAfter', 'After')}
              </button>
            </div>
          </motion.div>

          {/* Offer Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="space-y-3 pt-2"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">{t('offer', 'Offer')}</h4>
              {!data.offer && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={addOffer}
                  className="gap-1 border border-border hover:bg-muted/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('addOffer', 'Add Offer')}
                </Button>
              )}
            </div>

            <AnimatePresence>
              {data.offer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border border-border p-4 rounded-xl bg-muted/10 space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-primary">{t('offerPercentage', 'Offer Percentage')}</Label>
                      <Input
                        type="number"
                        value={data.offer.percentage}
                        onChange={(e) => updateOfferField('percentage', e.target.value)}
                        placeholder={t('offerPercentagePlaceholder', 'e.g. 20')}
                        className="bg-background border-muted hover:border-primary transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm font-semibold text-primary">{t('from', 'From')}</Label>
                        <Input
                          type="date"
                          value={data.offer.from}
                          onChange={(e) => updateOfferField('from', e.target.value)}
                          className="bg-background border-muted hover:border-primary transition-colors"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-primary">{t('to', 'To')}</Label>
                        <Input
                          type="date"
                          value={data.offer.to}
                          onChange={(e) => updateOfferField('to', e.target.value)}
                          className="bg-background border-muted hover:border-primary transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-primary">{t('offerType', 'Offer Type')}</Label>
                    <div className="flex gap-2">
                      {['group', 'private'].map((type) => (
                        <button
                          key={type}
                          onClick={() => updateOfferField('for', type)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200
                            ${data.offer.for === type
                              ? 'bg-primary text-white border-primary'
                              : 'bg-muted border-border text-muted-foreground hover:border-primary'
                            }`}
                          type="button"
                        >
                          {t(type === 'group' ? 'groupLessons' : 'privateLessons', type === 'group' ? 'Group Lessons' : 'Private Lessons')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-row gap-4 items-end">
                    <div className="flex-1">
                      <Label className="text-sm font-semibold text-primary">{t('description', 'Description')}</Label>
                      <Input
                        value={data.offer.description}
                        onChange={(e) => updateOfferField('description', e.target.value)}
                        placeholder={t('offerDescriptionPlaceholder', 'e.g. 20% off for new students until June 30')}
                        className="bg-background border-muted hover:border-primary transition-colors"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeOffer}
                      className="hover:bg-destructive/10 mt-1"
                    >
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Additional Pricing */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="space-y-3 pt-2"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">{t('additionalPricing', 'Additional Pricing')}</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={addAdditionalPricing}
                className="gap-1 border border-border hover:bg-muted/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('addPricing', 'Add Pricing')}
              </Button>
            </div>

            <AnimatePresence>
              {data.additionalPricing.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="group relative bg-background/80 p-4 rounded-lg border border-muted shadow-sm hover:shadow-md hover:border-primary transition-all duration-300"
                >
                  <div className="relative space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-semibold text-primary">{t('pricingName', 'Pricing Name')}</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateAdditionalPricing(index, 'name', e.target.value)}
                          placeholder={t('pricingNamePlaceholder', 'e.g. Final Exam Review')}
                          className="bg-background border-muted hover:border-primary transition-colors"
                        />
                      </div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label className="text-sm font-semibold text-primary">{t('price', 'Price')}</Label>
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateAdditionalPricing(index, 'price', e.target.value)}
                            placeholder={t('pricePlaceholder', 'e.g. 25')}
                            className="bg-background border-muted hover:border-primary transition-colors"
                          />
                        </div>
                        <div className="w-32">
                          <Label className="text-sm font-semibold text-primary">{t('period', 'Period')}</Label>
                          <Select
                            value={item.period}
                            onValueChange={(value) => updateAdditionalPricing(index, 'period', parseInt(value))}
                          >
                            <SelectTrigger className="bg-background border-muted">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PRICE_PERIODS.map((period) => (
                                <SelectItem key={period.id} value={period.id}>
                                  {t(period.label, period.defaultLabel)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row gap-4 items-end">
                      <div className="flex-1">
                        <Label className="text-sm font-semibold text-primary">{t('description', 'Description')}</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateAdditionalPricing(index, 'description', e.target.value)}
                          placeholder={t('additionalDescriptionPlaceholder', 'e.g. Additional fee for exam preparation materials')}
                          className="bg-background border-muted hover:border-primary transition-colors"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAdditionalPricing(index)}
                        className="hover:bg-destructive/10 mt-1"
                      >
                        <Trash2 className="w-5 h-5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PricesAndOffersSection;