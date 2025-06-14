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
} from "lucide-react";
import { format } from "date-fns";
import  Tooltip  from "@/components/ui/tooltip";

const SubjectPricingInfo = ({
  price,
  privatePricing,
  subjectBio,
  subjectRating,
  offer,
}) => {
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
          <span>{offer.percentage}% Off</span>
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
      <span className="text-sm line-through text-muted-foreground">EGP {basePrice}</span>
      <span className="text-sm font-semibold text-green-700">
        EGP {(basePrice * (1 - offer.percentage / 100)).toFixed(0)}
      </span>
      <BadgePercent className="text-green-700" variant="outline">
        -{offer.percentage}%
      </BadgePercent>
    </div>
  );

  return (
    <Card className="w-full border-muted shadow-sm rounded-xl relative overflow-visible">
      {/* Rating Badge */}
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
            <h2 className="text-xl font-semibold">Subject Overview</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {subjectBio || <span className="italic">No bio available for this subject.</span>}
          </p>
        </div>

        {/* Offer */}
        {renderOfferSection()}

        {/* Pricing Section */}
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          {/* Group Pricing */}
          <div className="flex-1 bg-muted/40 rounded-lg px-4 py-3 flex items-start gap-3">
            <Banknote size={20} className="text-green-500 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Group Pricing</p>
              {offer?.for === "group" && offer?.percentage ? (
                renderPriceWithOffer(price)
              ) : (
                <p className="text-sm font-semibold text-primary">EGP {price} / month</p>
              )}
            </div>
          </div>

          {/* Private Pricing */}
          <div className="flex-1 bg-muted/40 rounded-lg px-4 py-3 flex items-start gap-3">
            <div className="flex items-center gap-2 text-primary flex-col">
              <User size={20} className="text-blue-500 mt-0.5" />
              {/* Note: Desktop (tooltip) */}
              {privatePricing?.note && (
                <div className="hidden sm:flex mt-2 items-center gap-1 text-xs text-muted-foreground">
                  <Tooltip content={privatePricing.note}>
                    <Info className="w-4 h-4 cursor-pointer" />
                  </Tooltip>
                </div>
              )}
            </div>
            <div className="w-full">
              <p className="text-sm text-muted-foreground mb-1">Private Sessions</p>
              {privatePricing ? (
                <>
                  {offer?.for === "private" && offer?.percentage ? (
                    renderPriceWithOffer(privatePricing.price)
                  ) : (
                    <p className="text-sm font-semibold text-primary">
                      EGP {privatePricing.price} / month
                    </p>
                  )}



                  {/* Note: Mobile (inline block) */}
                  {privatePricing?.note && (
                    <div className="sm:hidden mt-2 flex items-start gap-2 text-xs bg-background/50 text-primary-muted px-3 py-2 rounded-md border border-foreground-muted">
                      <Info size={14} className="mt-0.5 shrink-0" />
                      <span>{privatePricing.note}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm italic text-muted-foreground">Group only</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectPricingInfo;
