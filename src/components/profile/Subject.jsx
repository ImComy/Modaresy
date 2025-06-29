import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Banknote,
  User,
  Star,
  Info,
  BookText,
  Percent,
  Calendar,
  BadgePercent,
  Wallet,
  CreditCard,
  Landmark,
  Smartphone,
  BadgeCheck,
} from "lucide-react";
import { format } from "date-fns";
import Tooltip from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

const SubjectPricingInfo = ({
  price,
  pricePeriod = 1, // Default to month (1)
  privatePricing,
  additionalPricing = [],
  subjectBio,
  subjectRating,
  offer,
  paymentTiming,
  paymentMethods = [],
}) => {
  const { t } = useTranslation();

  const periodLabels = {
    1: t('month', 'month'),
    2: t('session', 'session'),
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} size={14} className="text-yellow-400 fill-yellow-400" />
      );
    }

    if (halfStar) {
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

  const renderOfferSection = () =>
    offer?.percentage && (
      <div className="p-4 border border-green-300 bg-lime-200 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-green-700 font-medium">
          <Percent size={18} />
          <span>{offer.percentage}% {t('discount', 'Off')}</span>
        </div>
        {(offer.from || offer.to) && (
          <div className="flex items-center gap-2 text-sm text-green-800">
            <Calendar size={16} />
            <span>
              {offer.from && format(new Date(offer.from), "MMM d, yyyy")} –{" "}
              {offer.to && format(new Date(offer.to), "MMM d, yyyy")}
            </span>
          </div>
        )}
        {offer.description && (
          <div className="flex items-start gap-2 text-sm text-green-900 bg-white/70 border border-green-200 rounded-md p-2">
            <Info size={14} className="mt-0.5 text-green-700" />
            <span>{offer.description}</span>
          </div>
        )}
      </div>
    );

  const renderPriceWithOffer = (basePrice) => (
    <div className="flex items-center gap-2">
      <span className="text-sm line-through text-muted-foreground">{t("EGP")} {basePrice}</span>
      <span className="text-sm font-semibold text-green-700">
        {t("EGP")} {(basePrice * (1 - offer.percentage / 100)).toFixed(0)}
      </span>
      <BadgePercent className="text-green-700" variant="outline">
        -{offer.percentage}%
      </BadgePercent>
    </div>
  );

  const paymentIcons = {
    1: <Smartphone className="w-4 h-4" />, // Vodafone Cash
    2: <Landmark className="w-4 h-4" />, // Bank Transfer
    3: <CreditCard className="w-4 h-4" />, // Credit Card
    4: <Wallet className="w-4 h-4" />, // Cash
  };

  const paymentLabels = {
    1: t('vodafoneCash', 'Vodafone Cash'),
    2: t('bankTransfer', 'Bank Transfer'),
    3: t('creditCard', 'Credit Card'),
    4: t('cash', 'Cash'),
  };

  return (
    <Card className="w-full border-muted shadow-sm rounded-xl relative overflow-visible">
      {typeof subjectRating === "number" && (
        <div className="absolute -top-3 right-4 bg-background px-3 py-1 border border-muted rounded-full shadow-sm flex items-center gap-1 text-sm">
          {renderStars(subjectRating)}
          <span className="text-xs text-muted-foreground">
            ({subjectRating.toFixed(1)})
          </span>
        </div>
      )}

      <CardContent className="p-4 space-y-5">
        {/* Subject Bio */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-muted">
          <div className="flex items-center gap-2 text-primary">
            <BookText size={20} />
            <h2 className="text-xl font-semibold">{t('subjectOverview', 'Subject Overview')}</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {subjectBio || <span className="italic">{t('noBio', 'No bio available for this subject.')}</span>}
          </p>
        </div>

        {renderOfferSection()}

        {/* Payment Info */}
        <div className="p-4 bg-muted/20 rounded-xl border border-muted space-y-2">
          <div className="flex items-center gap-2 text-primary font-medium mb-2">
            <BadgeCheck size={20} className="text-blue-600" />
            <span>{t('paymentInfo', 'Payment Information')}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 bg-background px-3 py-1 rounded-full border border-muted shadow-sm">
              <Wallet size={16} className="text-purple-600" />
              <span className="text-primary font-medium">
                {t('paymentTiming', 'Payment:')}{" "}
                <span className="font-bold text-foreground">
                  {paymentTiming === true
                    ? t('paidUpfront', 'مقدم')
                    : paymentTiming === false
                    ? t('paidAfter', 'مؤخر')
                    : t('unspecified', 'غير محدد')}
                </span>
              </span>
            </div>

            {paymentMethods?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method}
                    className="flex items-center gap-2 bg-background px-3 py-1 rounded-full border border-muted shadow-sm"
                  >
                    {paymentIcons[method] || <Wallet size={14} />}
                    <span>{paymentLabels[method] || t('unknownMethod', 'Unknown Method')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-muted/40 rounded-lg px-4 py-3 flex items-start gap-3">
              <Banknote size={20} className="text-green-500 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('groupPricing', 'Group Pricing')}</p>
                {typeof price !== "number" || price <= 0 ? (
                  <p className="text-sm font-medium text-muted-foreground italic min-h-[1.25rem]">
                    {t('noPriceSpecified', 'No price has been specified')}
                  </p>
                ) : offer?.for === "group" && offer?.percentage ? (
                  renderPriceWithOffer(price)
                ) : (
                  <p className="text-sm font-semibold text-primary min-h-[1.25rem]">
                    {t("EGP")} {price} / {periodLabels[pricePeriod] || t('month', 'month')}
                  </p>
                )}
              </div>
            </div>

            {/* Private Pricing */}
            <div className="flex-1 bg-muted/40 rounded-lg px-4 py-3 flex items-start gap-3">
              <div className="flex items-center gap-2 text-primary flex-col">
                <User size={20} className="text-blue-500 mt-0.5" />
                {privatePricing?.note && (
                  <div className="hidden sm:flex mt-2 items-center gap-1 text-xs text-muted-foreground">
                    <Tooltip content={privatePricing.note}>
                      <Info className="w-4 h-4 cursor-pointer" />
                    </Tooltip>
                  </div>
                )}
              </div>
              <div className="w-full">
                <p className="text-sm text-muted-foreground mb-1">{t('privateSessions', 'Private Sessions')}</p>
                {privatePricing ? (
                  <>
                    {offer?.for === "private" && offer?.percentage ? (
                      renderPriceWithOffer(privatePricing.price)
                    ) : (
                      <p className="text-sm font-semibold text-primary">
                        {t("EGP")} {privatePricing.price} / {periodLabels[privatePricing.pricePeriod] || t('session', 'session')}
                      </p>
                    )}

                    {privatePricing?.note && (
                      <div className="sm:hidden mt-2 flex items-start gap-2 text-xs bg-background/50 text-primary-muted px-3 py-2 rounded-md border border-foreground-muted">
                        <Info size={14} className="mt-0.5 shrink-0" />
                        <span>{privatePricing.note}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm italic text-muted-foreground">{t('groupOnly', 'Group only')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Pricing */}
          {additionalPricing?.length > 0 && (
            <section className="space-y-6">
              {/* Section Title */}
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-full bg-primary/10 text-primary p-2">
                  <Banknote size={20} />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {t('additionalPricing', 'Additional Pricing')}
                </h3>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {additionalPricing.map((item, index) => (
                  <div
                    key={index}
                    className="relative flex flex-col gap-4 bg-card rounded-xl border border-border shadow-sm p-5 hover:shadow-lg hover:border-primary transition-all"
                  >
                    {/* Vertical Accent Bar */}
                    <div className="absolute top-4 left-0 h-10 w-1.5 bg-accent rounded-r" />

                    {/* Title and Price */}
                    <div className="pl-3">
                      <p className="text-sm font-semibold text-foreground mb-1">
                        {item.name}
                      </p>
                      <div className="text-base font-bold text-primary flex items-center gap-1">
                        {t("EGP")} {item.price}
                        <span className="text-sm font-normal text-muted-foreground">
                          / {periodLabels[item.period] || t('session', 'session')}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <div className="pl-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectPricingInfo;