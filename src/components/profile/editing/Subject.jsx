import React, { useState, useEffect } from "react";
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
  BadgePercent,
  Wallet,
  CreditCard,
  Landmark,
  Smartphone,
  BadgeCheck,
  Plus,
  Trash,
} from "lucide-react";
import { format } from "date-fns";
import Tooltip from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const SubjectPricingInfoEdit = ({
  price: initialPrice = 0,
  pricePeriod: initialPricePeriod = "1",
  private: initialPrivatePricing = { price: "", pricePeriod: "2", note: "" },
  additionalPricing: initialAdditionalPricing = [],
  bio: initialSubjectBio = "",
  subjectRating,
  offer: initialOffer = { percentage: "", for: "group", from: "", to: "", description: "" },
  paymentTiming: initialPaymentTiming = "",
  paymentMethods: initialPaymentMethods = [],
  onChange,
}) => {
  const { t } = useTranslation();
  const [price, setPrice] = useState(initialPrice.toString());
  const [pricePeriod, setPricePeriod] = useState(initialPricePeriod.toString() || "1");
  const [privateSession, setPrivateSession] = useState({
    price: initialPrivatePricing.price?.toString() || "",
    pricePeriod: initialPrivatePricing.pricePeriod?.toString() || "2",
    note: initialPrivatePricing.note || "",
  });
  const [additionalPricing, setAdditionalPricing] = useState(
    initialAdditionalPricing.map((item) => ({
      ...item,
      price: item.price?.toString() || "",
      period: item.period?.toString() || "2",
      name: item.name || "",
      description: item.description || "",
    }))
  );
  const [bio, setBio] = useState(initialSubjectBio);
  const [offer, setOffer] = useState({
    percentage: initialOffer.percentage?.toString() || "",
    for: initialOffer.for || "group",
    from: initialOffer.from || "",
    to: initialOffer.to || "",
    description: initialOffer.description || "",
  });
  const [paymentTiming, setPaymentTiming] = useState(
    initialPaymentTiming === true ? "true" : initialPaymentTiming === false ? "false" : ""
  );
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [newAdditionalPricing, setNewAdditionalPricing] = useState({
    name: "",
    price: "",
    period: "2",
    description: "",
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync state with props when they change (subject switch)
  useEffect(() => {
    if (price !== initialPrice.toString()) {
      if (hasUnsavedChanges) {
        console.warn("Subject switched with unsaved price changes.");
      } else {
        console.log("Syncing price:", initialPrice);
        setPrice(initialPrice.toString());
      }
    }
  }, [initialPrice]);

  useEffect(() => {
    if (pricePeriod !== initialPricePeriod.toString()) {
      if (hasUnsavedChanges) {
        console.warn("Subject switched with unsaved pricePeriod changes.");
      } else {
        console.log("Syncing pricePeriod:", initialPricePeriod);
        setPricePeriod(initialPricePeriod.toString() || "1");
      }
    }
  }, [initialPricePeriod]);

  useEffect(() => {
    if (
      JSON.stringify(privateSession) !==
      JSON.stringify({
        price: initialPrivatePricing.price?.toString() || "",
        pricePeriod: initialPrivatePricing.pricePeriod?.toString() || "2",
        note: initialPrivatePricing.note || "",
      })
    ) {
      if (hasUnsavedChanges) {
        console.warn("Subject switched with unsaved privateSession changes.");
      } else {
        console.log("Syncing privateSession:", initialPrivatePricing);
        setPrivateSession({
          price: initialPrivatePricing.price?.toString() || "",
          pricePeriod: initialPrivatePricing.pricePeriod?.toString() || "2",
          note: initialPrivatePricing.note || "",
        });
      }
    }
  }, [initialPrivatePricing]);

  useEffect(() => {
    if (JSON.stringify(additionalPricing) !== JSON.stringify(initialAdditionalPricing)) {
      if (hasUnsavedChanges) {
        console.warn("Subject switched with unsaved additionalPricing changes.");
      } else {
        console.log("Syncing additionalPricing:", initialAdditionalPricing);
        setAdditionalPricing(
          initialAdditionalPricing.map((item) => ({
            ...item,
            price: item.price?.toString() || "",
            period: item.period?.toString() || "2",
            name: item.name || "",
            description: item.description || "",
          }))
        );
      }
    }
  }, [initialAdditionalPricing]);

  useEffect(() => {
    if (bio !== initialSubjectBio) {
      if (hasUnsavedChanges) {
        console.warn("Subject switched with unsaved bio changes.");
      } else {
        console.log("Syncing bio:", initialSubjectBio);
        setBio(initialSubjectBio);
      }
    }
  }, [initialSubjectBio]);

  useEffect(() => {
    if (
      JSON.stringify(offer) !==
      JSON.stringify({
        percentage: initialOffer.percentage?.toString() || "",
        for: initialOffer.for || "group",
        from: initialOffer.from || "",
        to: initialOffer.to || "",
        description: initialOffer.description || "",
      })
    ) {
      if (hasUnsavedChanges) {
        console.warn("Subject switched with unsaved offer changes.");
      } else {
        console.log("Syncing offer:", initialOffer);
        setOffer({
          percentage: initialOffer.percentage?.toString() || "",
          for: initialOffer.for || "group",
          from: initialOffer.from || "",
          to: initialOffer.to || "",
          description: initialOffer.description || "",
        });
      }
    }
  }, [initialOffer]);

  useEffect(() => {
    const normalizedPaymentTiming =
      initialPaymentTiming === true ? "true" : initialPaymentTiming === false ? "false" : "";
    if (paymentTiming !== normalizedPaymentTiming) {
      if (hasUnsavedChanges) {
        console.warn("Subject switched with unsaved paymentTiming changes.");
      } else {
        console.log("Syncing paymentTiming:", initialPaymentTiming);
        setPaymentTiming(normalizedPaymentTiming);
      }
    }
  }, [initialPaymentTiming]);

  useEffect(() => {
    if (JSON.stringify(paymentMethods) !== JSON.stringify(initialPaymentMethods)) {
      if (hasUnsavedChanges) {
        console.warn("Subject switched with unsaved paymentMethods changes.");
      } else {
        console.log("Syncing paymentMethods:", initialPaymentMethods);
        setPaymentMethods(initialPaymentMethods);
      }
    }
  }, [initialPaymentMethods]);

  const periodOptions = [
    { value: "1", label: t("month", "month") },
    { value: "2", label: t("session", "session") },
  ];

  const paymentOptions = [
    { value: 1, label: t("vodafoneCash", "Vodafone Cash"), icon: <Smartphone className="w-4 h-4" /> },
    { value: 2, label: t("bankTransfer", "Bank Transfer"), icon: <Landmark className="w-4 h-4" /> },
    { value: 3, label: t("creditCard", "Credit Card"), icon: <CreditCard className="w-4 h-4" /> },
    { value: 4, label: t("cash", "Cash"), icon: <Wallet className="w-4 h-4" /> },
  ];

  const handleFieldChange = (field, value) => {
    setHasUnsavedChanges(true);
    onChange(field, value);
  };

  const handlePriceChange = (value) => {
    setPrice(value);
    handleFieldChange("price", Number(value) || 0);
  };

  const handlePricePeriodChange = (value) => {
    setPricePeriod(value);
    handleFieldChange("pricePeriod", value);
  };

  const handlePrivatePricingChange = (field, value) => {
    const updated = { ...privateSession, [field]: field === "price" ? value : value };
    setPrivateSession(updated);
    handleFieldChange("private", updated);
  };

  const handleSubjectBioChange = (value) => {
    setBio(value);
    handleFieldChange("bio", value);
  };

  const handleOfferChange = (field, value) => {
    const updated = { ...offer, [field]: field === "percentage" ? value : value };
    setOffer(updated);
    handleFieldChange("offer", updated);
  };

  const handlePaymentTimingChange = (value) => {
    setPaymentTiming(value);
    handleFieldChange("paymentTiming", value === "unspecified" ? "" : value === "true");
  };

  const handlePaymentMethodToggle = (method) => {
    const updated = paymentMethods.includes(method)
      ? paymentMethods.filter((m) => m !== method)
      : [...paymentMethods, method];
    setPaymentMethods(updated);
    handleFieldChange("paymentMethods", updated);
  };

  const handleAdditionalPricingChange = (index, field, value) => {
    const updated = [...additionalPricing];
    updated[index] = { ...updated[index], [field]: field === "price" ? value : value };
    setAdditionalPricing(updated);
    handleFieldChange("additionalPricing", updated);
  };

  const addAdditionalPricing = () => {
    if (newAdditionalPricing.name && newAdditionalPricing.price) {
      const updated = [
        ...additionalPricing,
        { ...newAdditionalPricing, price: newAdditionalPricing.price, period: newAdditionalPricing.period || "2" },
      ];
      setAdditionalPricing(updated);
      handleFieldChange("additionalPricing", updated);
      setNewAdditionalPricing({ name: "", price: "", period: "2", description: "" });
    }
  };

  const removeAdditionalPricing = (index) => {
    const updated = additionalPricing.filter((_, i) => i !== index);
    setAdditionalPricing(updated);
    handleFieldChange("additionalPricing", updated);
  };

  const handleSave = () => {
    setHasUnsavedChanges(false);
    console.log("Changes saved:", {
      price,
      pricePeriod,
      privateSession,
      additionalPricing,
      bio,
      offer,
      paymentTiming,
      paymentMethods,
    });
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

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="border-primary/30 shadow-lg rounded-xl relative overflow-visible bg-gradient-to-br from-primary/5 to-primary/10">
        {typeof subjectRating === "number" && (
          <div className="absolute -top-3 right-4 bg-background px-3 py-1 border border-primary/30 rounded-full shadow-md flex items-center gap-1 text-sm">
            {renderStars(subjectRating)}
            <span className="text-xs text-muted-foreground">
              ({subjectRating.toFixed(1)})
            </span>
          </div>
        )}

        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Subject Bio */}
          <div className="space-y-3 p-4 sm:p-5 bg-muted/20 rounded-xl border border-primary/30 transition-all hover:shadow-md">
            <div className="flex items-center gap-2 text-primary">
              <BookText size={20} />
              <h2 className="text-lg sm:text-xl font-semibold">{t("subjectOverview", "Subject Overview")}</h2>
            </div>
            <Textarea
              value={bio}
              onChange={(e) => handleSubjectBioChange(e.target.value)}
              placeholder={t("subjectBioPlaceholder", "Write something about this subject...")}
              className="w-full min-h-[120px] border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm text-sm"
            />
          </div>

          {/* Offer Section */}
          <div className="p-4 sm:p-5 border border-green-300 bg-lime-200/30 rounded-xl space-y-4 transition-all hover:shadow-md">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <Percent size={18} />
              <span>{t("discount", "Discount")}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                value={offer.percentage}
                onChange={(e) => handleOfferChange("percentage", e.target.value)}
                placeholder={t("percentage", "Percentage")}
                className="h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm"
              />
              <Select
                value={offer.for}
                onValueChange={(value) => handleOfferChange("for", value)}
              >
                <SelectTrigger className="h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm">
                  <SelectValue placeholder={t("applyTo", "Apply to")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="group">{t("groupPricing", "Group Pricing")}</SelectItem>
                  <SelectItem value="private">{t("privateSessions", "Private Sessions")}</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={offer.from}
                onChange={(e) => handleOfferChange("from", e.target.value)}
                placeholder={t("startDate", "Start Date")}
                className="h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm"
              />
              <Input
                type="date"
                value={offer.to}
                onChange={(e) => handleOfferChange("to", e.target.value)}
                placeholder={t("endDate", "End Date")}
                className="h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm"
              />
            </div>
            <Textarea
              value={offer.description}
              onChange={(e) => handleOfferChange("description", e.target.value)}
              placeholder={t("offerDescription", "Describe the offer...")}
              className="w-full min-h-[80px] text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm"
            />
          </div>

          {/* Payment Info */}
          <div className="p-4 sm:p-5 bg-muted/20 rounded-xl border border-primary/30 space-y-4 transition-all hover:shadow-md">
            <div className="flex items-center gap-2 text-primary font-medium mb-2">
              <BadgeCheck size={20} className="text-blue-600" />
              <span>{t("paymentInfo", "Payment Information")}</span>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Wallet size={16} className="text-purple-600 sm:mt-0 mt-1" />
                <Select
                  value={paymentTiming}
                  onValueChange={handlePaymentTimingChange}
                >
                  <SelectTrigger className="w-full sm:max-w-xs h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm">
                    <SelectValue placeholder={t("selectPaymentTiming", "Select Payment Timing")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">{t("paidUpfront", "Paid Upfront")}</SelectItem>
                    <SelectItem value="false">{t("paidAfter", "Paid After")}</SelectItem>
                    <SelectItem value="unspecified">{t("unspecified", "Unspecified")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                {paymentOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={paymentMethods.includes(option.value) ? "default" : "outline"}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-full shadow-sm transition-all text-sm h-9",
                      paymentMethods.includes(option.value)
                        ? "bg-primary hover:bg-primary/90"
                        : "border-primary/30 hover:bg-primary/10 hover:border-primary"
                    )}
                    onClick={() => handlePaymentMethodToggle(option.value)}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-muted/20 rounded-lg px-4 sm:px-5 py-4 flex items-start gap-3 transition-all hover:shadow-md border border-primary/30">
                <Banknote size={20} className="text-green-500 mt-0.5" />
                <div className="w-full">
                  <p className="text-sm text-muted-foreground mb-2">{t("groupPricing", "Group Pricing")}</p>
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder={t("price", "Price")}
                      className="w-full sm:max-w-xs h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm"
                    />
                    <Select
                      value={pricePeriod}
                      onValueChange={handlePricePeriodChange}
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
                </div>
              </div>

              <div className="flex-1 bg-muted/20 rounded-lg px-4 sm:px-5 py-4 flex items-start gap-3 transition-all hover:shadow-md border border-primary/30">
                <div className="flex items-center gap-2 text-primary flex-col">
                  <User size={20} className="text-blue-500 mt-0.5" />
                  {privateSession.note && (
                    <div className="hidden sm:flex mt-2 items-center gap-1 text-xs text-muted-foreground">
                      <Tooltip content={privateSession.note}>
                        <Info className="w-4 h-4 cursor-pointer" />
                      </Tooltip>
                    </div>
                  )}
                </div>
                <div className="w-full">
                  <p className="text-sm text-muted-foreground mb-2">{t("privateSessions", "Private Sessions")}</p>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <Input
                        type="number"
                        value={privateSession.price}
                        onChange={(e) => handlePrivatePricingChange("price", e.target.value)}
                        placeholder={t("price", "Price")}
                        className="w-full sm:max-w-xs h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm"
                      />
                      <Select
                        value={privateSession.pricePeriod}
                        onValueChange={(value) => handlePrivatePricingChange("pricePeriod", value)}
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
                      value={privateSession.note}
                      onChange={(e) => handlePrivatePricingChange("note", e.target.value)}
                      placeholder={t("note", "Add a note...")}
                      className="w-full min-h-[60px] text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm sm:hidden"
                    />
                    <Input
                      value={privateSession.note}
                      onChange={(e) => handlePrivatePricingChange("note", e.target.value)}
                      placeholder={t("note", "Add a note...")}
                      className="w-full h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm hidden sm:block"
                    />
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
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {t("additionalPricing", "Additional Pricing")}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {additionalPricing.map((item, index) => (
                  <div
                    key={index}
                    className="relative flex flex-col gap-4 bg-card rounded-xl border border-primary/30 shadow-sm p-4 sm:p-5 hover:shadow-lg hover:border-primary transition-all"
                  >
                    <div className="absolute top-4 left-0 h-10 w-1.5 bg-accent rounded-r" />
                    <div className="pl-3 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Input
                          value={item.name}
                          onChange={(e) => handleAdditionalPricingChange(index, "name", e.target.value)}
                          placeholder={t("pricingName", "Pricing Name")}
                          className="h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAdditionalPricing(index)}
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
                        <Select
                          value={item.period}
                          onValueChange={(value) => handleAdditionalPricingChange(index, "period", value)}
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
                        value={item.description}
                        onChange={(e) => handleAdditionalPricingChange(index, "description", e.target.value)}
                        placeholder={t("description", "Description")}
                        className="w-full min-h-[80px] text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm"
                      />
                    </div>
                  </div>
                ))}
                <div className="relative flex flex-col gap-4 bg-card rounded-xl border border-primary/30 shadow-sm p-4 sm:p-5 hover:shadow-lg hover:border-primary transition-all">
                  <div className="absolute top-4 left-0 h-10 w-1.5 bg-accent rounded-r" />
                  <div className="pl-3 space-y-3">
                    <Input
                      value={newAdditionalPricing.name}
                      onChange={(e) =>
                        setNewAdditionalPricing((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder={t("pricingName", "Pricing Name")}
                      className="h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm"
                    />
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <Input
                        type="number"
                        value={newAdditionalPricing.price}
                        onChange={(e) =>
                          setNewAdditionalPricing((prev) => ({ ...prev, price: e.target.value }))
                        }
                        placeholder={t("price", "Price")}
                        className="h-9 text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm"
                      />
                      <Select
                        value={newAdditionalPricing.period}
                        onValueChange={(value) =>
                          setNewAdditionalPricing((prev) => ({ ...prev, period: value }))
                        }
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
                      value={newAdditionalPricing.description}
                      onChange={(e) =>
                        setNewAdditionalPricing((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder={t("description", "Description")}
                      className="w-full min-h-[80px] text-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-colors shadow-sm"
                    />
                    <Button
                      onClick={addAdditionalPricing}
                      className="bg-primary hover:bg-primary/90 transition-colors shadow-sm h-9 text-sm w-full sm:w-auto"
                    >
                      <Plus size={16} className="mr-2" />
                      {t("addPricing", "Add Pricing")}
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectPricingInfoEdit;