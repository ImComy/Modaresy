import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Banknote,
  User,
  Star,
  Info,
  BookText,
  Percent,
  Calendar,
  CreditCard,
  Landmark,
  Smartphone,
  BadgeCheck,
  Plus,
  Trash,
  BadgePercent,
} from "lucide-react";
import Tooltip from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getConstants, getConstantsSync } from "@/api/constantsFetch";

const OfferForm = ({ offer, onChange }) => {
  const { t } = useTranslation();

  const safeOffer = useMemo(() => {
    const formatDate = (dateString) => {
      if (!dateString) return "";
      return dateString.split("T")[0];
    };

    return {
      percentage: offer?.percentage || "",
      from: formatDate(offer?.from),
      to: formatDate(offer?.to),
      description: offer?.description || "",
    };
  }, [offer]);

  return (
    <div className="mt-4 p-4 border border-green-700 bg-lime-800/10 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 text-green-300 font-medium">
          <BadgePercent size={16} />
          <span>{t("offer", "Offer")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          type="number"
          value={safeOffer.percentage}
          onChange={(e) => onChange("percentage", e.target.value)}
          placeholder={t("percentage", "Percentage")}
          className="h-9 text-sm border-green-300 focus:border-green-500 focus:ring-green-300 transition-colors shadow-sm"
        />
        <Input
          type="date"
          value={safeOffer.from}
          onChange={(e) => onChange("from", e.target.value)}
          placeholder={t("startDate", "Start Date")}
          className="h-9 text-sm border-green-300 focus:border-green-500 focus:ring-green-300 transition-colors shadow-sm"
        />
        <Input
          type="date"
          value={safeOffer.to}
          onChange={(e) => onChange("to", e.target.value)}
          placeholder={t("endDate", "End Date")}
          className="h-9 text-sm border-green-300 focus:border-green-500 focus:ring-green-300 transition-colors shadow-sm"
        />
      </div>
      <Textarea
        value={safeOffer.description}
        onChange={(e) => onChange("description", e.target.value)}
        placeholder={t("offerDescription", "Describe the offer...")}
        className="w-full mt-3 min-h-[60px] text-sm border-green-300 focus:border-green-500 focus:ring-green-300 transition-colors shadow-sm"
      />
    </div>
  );
};

const SubjectPricingInfoEdit = ({ subject, onChange }) => {
  const { t, i18n } = useTranslation();
  const dir = typeof i18n?.dir === "function" ? i18n.dir() : "ltr";

  const [pricePeriods, setPricePeriods] = useState(() => {
    try {
      const sync = getConstantsSync?.();
      return (sync && sync.PricePeriod) || ["Session", "Month"];
    } catch {
      return ["Session", "Month"];
    }
  });

  const convertLegacyPeriod = (val) => {
    if (!val && val !== 0) return pricePeriods[0] || t("session", "Session");
    if (pricePeriods.includes(val)) return val;
    if (String(val) === "1") return pricePeriods.find((p) => /month/i.test(p)) || pricePeriods[0];
    if (String(val) === "2") return pricePeriods.find((p) => /session/i.test(p)) || pricePeriods[0];
    return pricePeriods.find((p) => p.toLowerCase().includes(String(val).toLowerCase())) || pricePeriods[0];
  };

  const subjectData = subject || {};

  const group_pricing = useMemo(() => {
    const gp = subjectData.group_pricing || {};
    return {
      price: gp.price ?? 0,
      price_period: convertLegacyPeriod(gp.price_period),
      offer: gp.offer || {
        percentage: "",
        from: "",
        to: "",
        description: "",
      },
      ...gp,
    };
  }, [subjectData, pricePeriods]);

  const private_pricing = useMemo(() => {
    const pp = subjectData.private_pricing || {};
    return {
      price: pp.price ?? 0,
      price_period: convertLegacyPeriod(pp.price_period),
      note: pp.note ?? "",
      offer: pp.offer || {
        percentage: "",
        from: "",
        to: "",
        description: "",
      },
      ...pp,
    };
  }, [subjectData, pricePeriods]);

  const additional_pricing = useMemo(() => {
    const ap = Array.isArray(subjectData.additional_pricing) ? subjectData.additional_pricing : [];
    return ap.map((it) => ({
      name: it.name ?? "",
      price: it.price ?? 0,
      period: convertLegacyPeriod(it.period ?? it.price_period ?? pricePeriods[0]),
      description: it.description ?? "",
      offer: it.offer || {
        percentage: "",
        from: "",
        to: "",
        description: "",
      },
      ...it,
    }));
  }, [subjectData, pricePeriods]);

  const description = subjectData.description || "";
  const subjectRating = subjectData.subjectRating;

  const periodOptions = pricePeriods.map((p) => ({
    value: p,
    label: t(`constants.PricePeriod.${p}`, { defaultValue: p }),
  }));

  const handleDescriptionChange = (value) => {
    onChange("description", value);
  };

  const handleGroupPricingChange = (field, value) => {
    onChange("group_pricing", {
      ...group_pricing,
      [field]: field === "price" ? Number(value) || 0 : value,
    });
  };

  const handlePrivatePricingChange = (field, value) => {
    onChange("private_pricing", {
      ...private_pricing,
      [field]: field === "price" ? Number(value) || 0 : value,
    });
  };

  const handleGroupOfferChange = (field, value) => {
    const formattedValue = field === "percentage" ? Number(value) : value;

    onChange("group_pricing", {
      ...group_pricing,
      offer: {
        ...group_pricing.offer,
        [field]: formattedValue,
      },
    });
  };

  const handlePrivateOfferChange = (field, value) => {
    const formattedValue = field === "percentage" ? Number(value) : value;

    onChange("private_pricing", {
      ...private_pricing,
      offer: {
        ...private_pricing.offer,
        [field]: formattedValue,
      },
    });
  };

  const handleAdditionalPricingChange = (index, field, value) => {
    const updated = [...additional_pricing];
    updated[index] = { ...updated[index], [field]: value };
    onChange("additional_pricing", updated);
  };

  const handleAdditionalOfferChange = (index, field, value) => {
    const formattedValue = field === "percentage" ? Number(value) : value;

    const updated = [...additional_pricing];
    updated[index] = {
      ...updated[index],
      offer: {
        ...updated[index].offer,
        [field]: formattedValue,
      },
    };

    onChange("additional_pricing", updated);
  };

  const handleAddAdditionalPricing = () => {
    const newItem = {
      name: "",
      price: 0,
      period: pricePeriods[0] || t("session", "Session"),
      description: "",
      offer: {
        percentage: "",
        from: "",
        to: "",
        description: "",
      },
    };
    onChange("additional_pricing", [...additional_pricing, newItem]);
  };

  const handleRemoveAdditionalPricing = (index) => {
    const updated = additional_pricing.filter((_, i) => i !== index);
    onChange("additional_pricing", updated);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const halfStar = (rating || 0) % 1 >= 0.5;

    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={14} className="text-yellow-400 fill-yellow-400" />
        ))}
        {halfStar && <Star key="half" size={14} className="text-yellow-400 fill-yellow-400 opacity-50" />}
        {[...Array(5 - fullStars - (halfStar ? 1 : 0))].map((_, i) => (
          <Star key={`empty-${i}`} size={14} className="text-muted-foreground" />
        ))}
      </>
    );
  };

  return (
    <div dir={dir} style={{ direction: dir }} className="w-full max-w-3xl mx-auto">
      <Card className="border-primary/30 shadow-lg rounded-xl relative overflow-visible bg-gradient-to-br from-primary/5 to-primary/10">
        {typeof subjectRating === "number" && (
          <div
            className={cn(
              "absolute -top-3 bg-background px-3 py-1 border border-primary/30 rounded-full shadow-md flex items-center gap-1 text-sm",
              dir === "rtl" ? "left-4" : "right-4"
            )}
          >
            {renderStars(subjectRating)}
            <span className="text-xs text-muted-foreground">({subjectRating.toFixed(1)})</span>
          </div>
        )}

        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* SUBJECT OVERVIEW (first) */}
          <div className="space-y-3 p-4 sm:p-5 bg-muted/20 rounded-xl border border-primary/30 transition-all hover:shadow-md">
            <div className="flex items-center gap-2 text-primary">
              <BookText size={20} className={cn("w-5 h-5", dir === "rtl" ? "ml-2" : "mr-2")} />
              <h2 className="text-lg sm:text-xl font-semibold">{t("subjectOverview", "Subject Overview")}</h2>
            </div>
            <Textarea
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder={t("subjectBioPlaceholder", "Write something about this subject...")}
              className="w-full min-h-[120px] border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm text-sm"
            />
          </div>

          {/* PRICING (second) */}
          <div className="flex flex-col gap-5">
            {/* Group Pricing */}
            <div className="bg-muted/20 rounded-lg p-4 sm:p-5 transition-all hover:shadow-md border border-primary/30">
              <div className="flex items-start gap-3">
                <Banknote size={20} className="text-green-500 mt-0.5" />
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-muted-foreground">{t("groupPricing", "Group Pricing")}</p>
                    <div className="flex items-center gap-2">
                      {group_pricing.offer?.percentage && <BadgePercent size={16} className="text-green-600" />}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <Input
                      type="number"
                      value={group_pricing.price}
                      onChange={(e) => handleGroupPricingChange("price", e.target.value)}
                      placeholder={t("price", "Price")}
                      className="w-full sm:max-w-xs h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm"
                    />
                    <Select
                      value={group_pricing.price_period}
                      onValueChange={(value) => handleGroupPricingChange("price_period", value)}
                    >
                      <SelectTrigger className="w-full sm:max-w-[120px] h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {periodOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <OfferForm offer={group_pricing.offer} onChange={(field, value) => handleGroupOfferChange(field, value)} />
                </div>
              </div>
            </div>

            {/* Private Pricing */}
            <div className="bg-muted/20 rounded-lg p-4 sm:p-5 transition-all hover:shadow-md border border-primary/30">
              <div className="flex items-start gap-3">
                <div className="flex flex-col">
                  <User size={20} className="text-blue-500" />
                  {private_pricing.note && (
                    <div className="hidden sm:flex mt-2 items-center gap-1 text-xs text-muted-foreground">
                      <Tooltip content={private_pricing.note}>
                        <Info className="w-4 h-4 cursor-pointer" />
                      </Tooltip>
                    </div>
                  )}
                </div>
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-muted-foreground">{t("privateSessions", "Private Sessions")}</p>
                    <div className="flex items-center gap-2">
                      {private_pricing.offer?.percentage && <BadgePercent size={16} className="text-green-600" />}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <Input
                        type="number"
                        value={private_pricing.price}
                        onChange={(e) => handlePrivatePricingChange("price", e.target.value)}
                        placeholder={t("price", "Price")}
                        className="w-full sm:max-w-xs h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm"
                      />
                      <Select
                        value={private_pricing.price_period}
                        onValueChange={(value) => handlePrivatePricingChange("price_period", value)}
                      >
                        <SelectTrigger className="w-full sm:max-w-[120px] h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {periodOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      value={private_pricing.note || ""}
                      onChange={(e) => handlePrivatePricingChange("note", e.target.value)}
                      placeholder={t("note", "Add a note...")}
                      className="w-full min-h-[60px] text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm sm:hidden"
                    />
                    <Input
                      value={private_pricing.note || ""}
                      onChange={(e) => handlePrivatePricingChange("note", e.target.value)}
                      placeholder={t("note", "Add a note...")}
                      className="w-full h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm hidden sm:block"
                    />

                    <OfferForm offer={private_pricing.offer} onChange={(field, value) => handlePrivateOfferChange(field, value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Pricing */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-full bg-primary/10 text-primary p-2">
                  <Banknote size={20} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">{t("additionalPricing", "Additional Pricing")}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {additional_pricing.map((item, index) => (
                  <div
                    key={index}
                    className="relative flex flex-col gap-4 bg-card rounded-xl border border-primary/30 shadow-sm p-4 sm:p-5 hover:shadow-lg hover:border-primary transition-all"
                  >
                    <div
                      className={cn(
                        "absolute top-4 h-10 w-1.5 bg-accent",
                        dir === "rtl" ? "right-0 rounded-l" : "left-0 rounded-r"
                      )}
                    />
                    <div className="pl-3 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Input
                          value={item.name}
                          onChange={(e) => handleAdditionalPricingChange(index, "name", e.target.value)}
                          placeholder={t("pricingName", "Pricing Name")}
                          className="h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAdditionalPricing(index)}
                          className="hover:bg-destructive/10 h-9 w-9"
                        >
                          <Trash size={16} className="text-destructive" />
                        </Button>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleAdditionalPricingChange(index, "price", e.target.value)}
                          placeholder={t("price", "Price")}
                          className="h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm"
                        />
                        <Select value={item.period} onValueChange={(value) => handleAdditionalPricingChange(index, "period", value)}>
                          <SelectTrigger className="w-full sm:max-w-[120px] h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {periodOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Textarea
                        value={item.description}
                        onChange={(e) => handleAdditionalPricingChange(index, "description", e.target.value)}
                        placeholder={t("description", "Description")}
                        className="w-full min-h-[80px] text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm"
                      />

                      <OfferForm offer={item.offer} onChange={(field, value) => handleAdditionalOfferChange(index, field, value)} />
                    </div>
                  </div>
                ))}
                <div className="relative flex flex-col gap-4 bg-card rounded-xl border border-primary/30 shadow-sm p-4 sm:p-5 hover:shadow-lg hover:border-primary transition-all">
                  <div
                    className={cn(
                      "absolute top-4 h-10 w-1.5 bg-accent",
                      dir === "rtl" ? "right-0 rounded-l" : "left-0 rounded-r"
                    )}
                  />
                  <div className="pl-3 space-y-3">
                    <Button type="button" onClick={handleAddAdditionalPricing} className="bg-primary hover:bg-primary/90 transition-colors shadow-sm h-9 text-sm w-full">
                      <Plus size={16} className={cn(dir === "rtl" ? "ml-2" : "mr-2")} />
                      {t("addPricing", "Add Pricing")}
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Payment moved to Tutor (teacher) profile; removed from subject-level editing */}
        </CardContent>
      </Card>
    </div>
  );
};

// Custom comparator: only re-render if subject._id or key pricing fields change
const areEqualSubjectPricing = (prevProps, nextProps) => {
  const pa = prevProps.subject || {};
  const pb = nextProps.subject || {};
  if (pa._id && pb._id) {
    if (String(pa._id) !== String(pb._id)) return false;
  } else {
    // fallback shallow compare of name+grade
    if ((pa.name || "") !== (pb.name || "")) return false;
    if ((pa.grade || "") !== (pb.grade || "")) return false;
  }
  // check crucial nested pricing fields shallowly
  const fields = ["private_pricing", "group_pricing", "additional_pricing"];
  // include description as well so editing it updates the UI
  if ((pa.description || "") !== (pb.description || "")) return false;
  for (const f of fields) {
    if (JSON.stringify(pa[f] || "") !== JSON.stringify(pb[f] || "")) return false;
  }
  return true;
};

export default React.memo(SubjectPricingInfoEdit, areEqualSubjectPricing);
