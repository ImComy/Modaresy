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

const OfferDisplay = ({ offer }) => {
  const { t } = useTranslation();
  
  if (!offer || !offer.percentage) return null;
  
  return (
    <div className="mt-2 p-2 border border-green-300 bg-lime-100/30 rounded-md">
      <div className="flex items-center gap-2 text-green-700">
        <BadgePercent size={14} />
        <span className="font-medium">
          {offer.percentage}% {t('discount', 'Off')}
        </span>
      </div>
      
      {offer.description && (
        <p className="text-green-600 text-sm mt-1">{offer.description}</p>
      )}
      
      {(offer.from || offer.to) && (
        <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
          <Calendar size={12} />
          <span>
            {offer.from && format(new Date(offer.from), "MMM d")} -{" "}
            {offer.to && format(new Date(offer.to), "MMM d, yyyy")}
          </span>
        </div>
      )}
    </div>
  );
};

const SubjectPricingInfoDisplay = (props) => {
  const { t } = useTranslation();

  // Support two input shapes:
  // 1) Flattened props previously used in this display component
  // 2) The "subject" object shape with nested pricing and offers
  const {
    subject,
    price: propPrice,
    pricePeriod: propPricePeriod,
    private: propPrivatePricing,
    additionalPricing: propAdditionalPricing,
    bio: propBio,
    rating: propRating,
    offer: propOffer,
    paymentTiming: propPaymentTiming,
    paymentMethods: propPaymentMethods,
  } = props;

  // Normalize input into a single consistent shape
  const normalized = (() => {
    const fromSubject = subject || {};

    const group = fromSubject.group_pricing || {};
    const privateP = fromSubject.private_pricing || {};
    const additional = Array.isArray(fromSubject.additional_pricing)
      ? fromSubject.additional_pricing
      : fromSubject.additionalPricing || [];

    return {
      groupPricing: {
        price: group.price ?? propPrice ?? null,
        period: group.price_period ?? propPricePeriod ?? 1,
        offer: group.offer || null
      },
      privatePricing: {
        price: privateP.price ?? (propPrivatePricing?.price) ?? null,
        period: privateP.price_period ?? (propPrivatePricing?.pricePeriod) ?? 2,
        note: privateP.note ?? (propPrivatePricing?.note) ?? "",
        offer: privateP.offer || null
      },
      additionalPricing: 
        (propAdditionalPricing || additional).map((it) => ({
          name: it.name ?? it.title ?? "",
          price: it.price ?? 0,
          period: it.period ?? it.price_period ?? it.pricePeriod ?? 2,
          description: it.description ?? it.desc ?? "",
          offer: it.offer || null
        })),
      bio: fromSubject.description ?? propBio ?? "",
      rating: fromSubject.subjectRating ?? propRating ?? null,
      paymentTiming: fromSubject.payment_timing ?? propPaymentTiming ?? null,
      paymentMethods: fromSubject.payment_methods ?? propPaymentMethods ?? [],
    };
  })();

  const getPeriodLabel = (period) => {
    if (period === 1 || period === "1" || String(period).toLowerCase().includes("month")) 
      return t('month', 'month');
    if (period === 2 || period === "2" || String(period).toLowerCase().includes("session")) 
      return t('session', 'session');
    return String(period);
  };

  const toBooleanPaymentTimingLabel = (timing) => {
    if (typeof timing === "boolean") 
      return timing ? t('paidUpfront', 'مقدم') : t('paidAfter', 'مؤخر');
    if (typeof timing === "string") {
      if (/pre/i.test(timing)) return t('paidUpfront', 'مقدم');
      if (/post/i.test(timing)) return t('paidAfter', 'مؤخر');
    }
    return t('unspecified', 'غير محدد');
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const halfStar = (rating || 0) % 1 >= 0.5;
    
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={14} className="text-yellow-400 fill-yellow-400" />
        ))}
        {halfStar && (
          <Star key="half" size={14} className="text-yellow-400 fill-yellow-400 opacity-50" />
        )}
        {[...Array(5 - fullStars - (halfStar ? 1 : 0))].map((_, i) => (
          <Star key={`empty-${i}`} size={14} className="text-muted-foreground" />
        ))}
      </>
    );
  };

  const renderPriceWithOffer = (basePrice, offer) => {
    if (!offer || !offer.percentage) return null;
    
    return (
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm line-through text-muted-foreground">
          {t("EGP")} {basePrice}
        </span>
        <span className="text-sm font-semibold text-green-700">
          {t("EGP")} {(basePrice * (1 - offer.percentage / 100)).toFixed(0)}
        </span>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
          -{offer.percentage}%
        </span>
      </div>
    );
  };

  const getIconForMethod = (method) => {
    const m = String(method).toLowerCase();
    if (m.includes("vodafone")) return <Smartphone className="w-4 h-4" />;
    if (m.includes("bank") || m.includes("transfer")) return <Landmark className="w-4 h-4" />;
    if (m.includes("credit") || m.includes("card")) return <CreditCard className="w-4 h-4" />;
    return <Wallet className="w-4 h-4" />;
  };

  const getLabelForMethod = (method) => {
    const m = String(method).toLowerCase();
    if (m.includes("vodafone")) return t('vodafoneCash', 'Vodafone Cash');
    if (m.includes("bank") || m.includes("transfer")) return t('bankTransfer', 'Bank Transfer');
    if (m.includes("credit") || m.includes("card")) return t('creditCard', 'Credit Card');
    return t('cash', 'Cash');
  };

  return (
    <Card className="w-full border-muted shadow-sm rounded-xl relative overflow-visible">
      {typeof normalized.rating === "number" && (
        <div className="absolute -top-3 right-4 bg-background px-3 py-1 border border-muted rounded-full shadow-sm flex items-center gap-1 text-sm">
          {renderStars(normalized.rating)}
          <span className="text-xs text-muted-foreground">
            ({normalized.rating.toFixed(1)})
          </span>
        </div>
      )}

      <CardContent className="p-4 space-y-5">
        <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-muted">
          <div className="flex items-center gap-2 text-primary">
            <BookText size={20} />
            <h2 className="text-xl font-semibold">{t('subjectOverview', 'Subject Overview')}</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {normalized.bio || <span className="italic">{t('noBio', 'No bio available for this subject.')}</span>}
          </p>
        </div>

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
                  {toBooleanPaymentTimingLabel(normalized.paymentTiming)}
                </span>
              </span>
            </div>

            {normalized.paymentMethods?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {normalized.paymentMethods.map((method, idx) => (
                  <div
                    key={`${String(method)}-${idx}`}
                    className="flex items-center gap-2 bg-background px-3 py-1 rounded-full border border-muted shadow-sm"
                  >
                    {getIconForMethod(method)}
                    <span>{getLabelForMethod(method)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Group Pricing */}
            <div className="flex-1 bg-muted/40 rounded-lg px-4 py-3 flex items-start gap-3">
              <Banknote size={20} className="text-green-500 mt-0.5" />
              <div className="w-full">
                <p className="text-sm text-muted-foreground mb-1">{t('groupPricing', 'Group Pricing')}</p>
                
                {typeof normalized.groupPricing.price !== "number" || normalized.groupPricing.price <= 0 ? (
                  <p className="text-sm font-medium text-muted-foreground italic min-h-[1.25rem]">
                    {t('noPriceSpecified', 'No price has been specified')}
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-primary min-h-[1.25rem]">
                      {t("EGP")} {normalized.groupPricing.price} / {getPeriodLabel(normalized.groupPricing.period)}
                    </p>
                    {renderPriceWithOffer(normalized.groupPricing.price, normalized.groupPricing.offer)}
                    {normalized.groupPricing.offer && (
                      <OfferDisplay offer={normalized.groupPricing.offer} />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Private Pricing */}
            <div className="flex-1 bg-muted/40 rounded-lg px-4 py-3 flex items-start gap-3">
              <div className="flex items-center gap-2 text-primary flex-col">
                <User size={20} className="text-blue-500 mt-0.5" />
                {normalized.privatePricing.note && (
                  <div className="hidden sm:flex mt-2 items-center gap-1 text-xs text-muted-foreground">
                    <Tooltip content={normalized.privatePricing.note}>
                      <Info className="w-4 h-4 cursor-pointer" />
                    </Tooltip>
                  </div>
                )}
              </div>
              <div className="w-full">
                <p className="text-sm text-muted-foreground mb-1">{t('privateSessions', 'Private Sessions')}</p>
                
                {normalized.privatePricing.price ? (
                  <>
                    <p className="text-sm font-semibold text-primary">
                      {t("EGP")} {normalized.privatePricing.price} / {getPeriodLabel(normalized.privatePricing.period)}
                    </p>
                    {renderPriceWithOffer(normalized.privatePricing.price, normalized.privatePricing.offer)}
                    {normalized.privatePricing.offer && (
                      <OfferDisplay offer={normalized.privatePricing.offer} />
                    )}

                    {normalized.privatePricing.note && (
                      <div className="sm:hidden mt-2 flex items-start gap-2 text-xs bg-background/50 text-primary-muted px-3 py-2 rounded-md border border-foreground-muted">
                        <Info size={14} className="mt-0.5 shrink-0" />
                        <span>{normalized.privatePricing.note}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm italic text-muted-foreground">{t('groupOnly', 'Group only')}</p>
                )}
              </div>
            </div>
          </div>

          {normalized.additionalPricing?.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-full bg-primary/10 text-primary p-2">
                  <Banknote size={20} />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {t('additionalPricing', 'Additional Pricing')}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {normalized.additionalPricing.map((item, index) => (
                  <div
                    key={index}
                    className="relative flex flex-col gap-4 bg-card rounded-xl border border-border shadow-sm p-5 hover:shadow-lg hover:border-primary transition-all"
                  >
                    <div className="absolute top-4 left-0 h-10 w-1.5 bg-accent rounded-r" />

                    <div className="pl-3">
                      <p className="text-sm font-semibold text-foreground mb-1">
                        {item.name}
                      </p>
                      <div className="text-base font-bold text-primary flex items-center gap-1">
                        {t("EGP")} {item.price}
                        <span className="text-sm font-normal text-muted-foreground">
                          / {getPeriodLabel(item.period)}
                        </span>
                      </div>
                      
                      {renderPriceWithOffer(item.price, item.offer)}
                    </div>

                    {item.description && (
                      <div className="pl-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    )}
                    
                    {item.offer && <OfferDisplay offer={item.offer} />}
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

export default SubjectPricingInfoDisplay;