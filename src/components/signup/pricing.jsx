/*
  SubjectPricingInfoEdit.hollow.jsx

  A *hollow* (UI-only) version of SubjectPricingInfoEdit meant for onboarding pages.
  - No network calls, no global constants fetch.
  - All data comes from props (subject, constants) and changes are emitted via onChange.
  - Simple, fully commented, beginner-friendly code so you can drop this into an onboarding step.

  How to use:
    <SubjectPricingInfoEditHollow
      subject={subject}                           // object with optional pricing fields
      onChange={(updatedSubject) => setSubject(updatedSubject)} // receive whole updated subject
      constants={{                                  // optional constants, sensible defaults provided
        PaymentTimings: ["Prepaid", "Postpaid"],
        PricePeriod: ["Session", "Month"],
        PaymentMethods: ["Cash", "Bank Transfer", "Credit Card"]
      }}
    />

  Notes for beginners:
  - This file uses the same visual components (Card, Input, Select, etc.) that your app already
    provides. If you don't have them in your small prototype, replace them with plain HTML inputs
    (examples included in comments) or simple wrappers.
  - All inputs are controlled: when the user types, we call `onChange` with the full updated
    `subject` object. This keeps the component "hollow" (UI only) and easy to connect to whatever
    parent state management you prefer (useState, redux, form libraries, etc.).
*/

import React, { useMemo } from "react";
// Keep your design components if available — otherwise replace with regular HTML elements.
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BadgePercent, Banknote, User, BookText, Plus, Trash } from "lucide-react";

// A tiny, safe translation helper for beginner-friendly demos.
const defaultT = (key, defaultValue) => defaultValue || key;

// Small presentational Offer form. Calls `onChange(field, value)` to mutate parent subject.offer.
const OfferForm = ({ offer = {}, onChange = () => {}, t = defaultT }) => {
  const safe = {
    percentage: offer.percentage ?? "",
    from: offer.from ?? "",
    to: offer.to ?? "",
    description: offer.description ?? "",
  };

  return (
    <div className="mt-4 p-4 border border-green-300 bg-lime-100/30 rounded-lg">
      <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
        <BadgePercent size={16} />
        <span>{t("offer", "Offer")}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          type="number"
          value={safe.percentage}
          onChange={(e) => onChange("percentage", e.target.value)}
          placeholder={t("percentage", "Percentage")}
          className="h-9 text-sm"
        />
        <Input
          type="date"
          value={safe.from}
          onChange={(e) => onChange("from", e.target.value)}
          placeholder={t("startDate", "Start Date")}
          className="h-9 text-sm"
        />
        <Input
          type="date"
          value={safe.to}
          onChange={(e) => onChange("to", e.target.value)}
          placeholder={t("endDate", "End Date")}
          className="h-9 text-sm"
        />
      </div>

      <Textarea
        value={safe.description}
        onChange={(e) => onChange("description", e.target.value)}
        placeholder={t("offerDescription", "Describe the offer...")}
        className="w-full mt-3 min-h-[60px] text-sm"
      />
    </div>
  );
};

/**
 * Hollow, beginner-friendly SubjectPricingInfoEdit component.
 * Props:
 *  - subject: object (optional) -- full subject shape is accepted, but only pricing-related fields are used here.
 *  - onChange: function(updatedSubject) called with the full subject object whenever something changes.
 *  - constants: optional object with PaymentTimings, PricePeriod, PaymentMethods arrays.
 *  - t: optional translation function t(key, defaultValue)
 */
const SubjectPricingInfoEditHollow = ({
  subject = {},
  onChange = () => {},
  constants = {},
  t = defaultT,
}) => {
  // Provide sensible defaults if parent didn't pass constants.
  const PaymentTimings = constants.PaymentTimings ?? ["Prepaid", "Postpaid"];
  const PricePeriod = constants.PricePeriod ?? ["Session", "Month"];
  const PaymentMethods = constants.PaymentMethods ?? ["Cash", "Bank Transfer", "Credit Card"];

  // Helper: produce a new subject object and call onChange
  const updateSubject = (patch) => {
    const updated = { ...subject, ...patch };
    onChange(updated);
  };

  // Helpers to update nested pricing structures (group/private/additional)
  const updateNested = (key, value) => {
    updateSubject({ [key]: { ...(subject[key] || {}), ...value } });
  };

  // Additional pricing is array-based. Provide helpers for a simple UX demo.
  const addAdditionalPricing = () => {
    const newItem = { name: "", price: 0, period: PricePeriod[0], description: "", offer: {} };
    updateSubject({ additional_pricing: [ ...(subject.additional_pricing || []), newItem ] });
  };

  const removeAdditionalPricing = (index) => {
    const arr = (subject.additional_pricing || []).filter((_, i) => i !== index);
    updateSubject({ additional_pricing: arr });
  };

  const updateAdditionalPricingItem = (index, patch) => {
    const arr = (subject.additional_pricing || []).map((it, i) => i === index ? { ...it, ...patch } : it);
    updateSubject({ additional_pricing: arr });
  };

  // Local derived values (safe fallbacks to avoid crashes)
  const group_pricing = subject.group_pricing || { price: "", price_period: PricePeriod[0], offer: {} };
  const private_pricing = subject.private_pricing || { price: "", price_period: PricePeriod[0], note: "", offer: {} };
  const additional_pricing = Array.isArray(subject.additional_pricing) ? subject.additional_pricing : [];
  // payment fields moved to tutor-level; onboarding subject pricing should not collect payment methods here

  // Beginner note: this function toggles a payment method on/off and calls onChange with full subject.
  // payment handled at tutor level

  // Simple UI-only render. No side effects, no fetches.
  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="border-primary/30 shadow-lg rounded-xl relative overflow-visible bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4 sm:p-6 space-y-6">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="overview">
                <BookText className="w-4 h-4 mr-2" />
                {t("overview", "Overview")}
              </TabsTrigger>
              <TabsTrigger value="pricing">
                <Banknote className="w-4 h-4 mr-2" />
                {t("pricing", "Pricing")}
              </TabsTrigger>
              {/* Payment tab removed - payment is now collected at the tutor/profile level */}
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-3 p-4 sm:p-5 bg-muted/20 rounded-xl border border-primary/30">
                <div className="flex items-center gap-2 text-primary">
                  <BookText size={20} />
                  <h2 className="text-lg sm:text-xl font-semibold">{t("subjectOverview", "Subject Overview")}</h2>
                </div>
                <Textarea
                  value={subject.description ?? ""}
                  onChange={(e) => updateSubject({ description: e.target.value })}
                  placeholder={t("subjectBioPlaceholder", "Write something about this subject...")}
                  className="w-full min-h-[120px] text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="pricing">
              <div className="flex flex-col gap-5">
                {/* Group pricing */}
                <div className="bg-muted/20 rounded-lg p-4 sm:p-5 border border-primary/30">
                  <div className="flex items-start gap-3">
                    <Banknote size={20} className="text-green-500 mt-0.5" />
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-muted-foreground">{t("groupPricing", "Group Pricing")}</p>
                        <div>
                          {group_pricing.offer?.percentage && <BadgePercent size={16} />}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <Input
                          type="number"
                          value={group_pricing.price}
                          onChange={(e) => updateNested("group_pricing", { ...group_pricing, price: Number(e.target.value) || 0 })}
                          placeholder={t("price", "Price")}
                          className="w-full sm:max-w-xs h-9 text-sm"
                        />
                        <Select
                          value={group_pricing.price_period}
                          onValueChange={(val) => updateNested("group_pricing", { ...group_pricing, price_period: val })}
                        >
                          <SelectTrigger className="w-full sm:max-w-[120px] h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PricePeriod.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <OfferForm
                        offer={group_pricing.offer}
                        onChange={(field, value) => updateNested("group_pricing", { ...group_pricing, offer: { ...(group_pricing.offer || {}), [field]: value } })}
                        t={t}
                      />
                    </div>
                  </div>
                </div>

                {/* Private pricing */}
                <div className="bg-muted/20 rounded-lg p-4 sm:p-5 border border-primary/30">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col">
                      <User size={20} className="text-blue-500" />
                    </div>
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-muted-foreground">{t("privateSessions", "Private Sessions")}</p>
                        <div>{private_pricing.offer?.percentage && <BadgePercent size={16} />}</div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <Input
                          type="number"
                          value={private_pricing.price}
                          onChange={(e) => updateNested("private_pricing", { ...private_pricing, price: Number(e.target.value) || 0 })}
                          placeholder={t("price", "Price")}
                          className="w-full sm:max-w-xs h-9 text-sm"
                        />
                        <Select
                          value={private_pricing.price_period}
                          onValueChange={(val) => updateNested("private_pricing", { ...private_pricing, price_period: val })}
                        >
                          <SelectTrigger className="w-full sm:max-w-[120px] h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PricePeriod.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <Textarea
                        value={private_pricing.note || ""}
                        onChange={(e) => updateNested("private_pricing", { ...private_pricing, note: e.target.value })}
                        placeholder={t("note", "Add a note...")}
                        className="w-full min-h-[60px] text-sm mt-3"
                      />

                      <OfferForm
                        offer={private_pricing.offer}
                        onChange={(field, value) => updateNested("private_pricing", { ...private_pricing, offer: { ...(private_pricing.offer || {}), [field]: value } })}
                        t={t}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional pricing list */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="rounded-full bg-primary/10 text-primary p-2">
                      <Banknote size={20} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">{t("additionalPricing", "Additional Pricing")}</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {additional_pricing.map((item, index) => (
                      <div key={index} className="relative flex flex-col gap-4 bg-card rounded-xl border border-primary/30 p-4">
                        <div className="flex justify-between items-start">
                          <Input
                            value={item.name}
                            onChange={(e) => updateAdditionalPricingItem(index, { name: e.target.value })}
                            placeholder={t("pricingName", "Pricing Name")}
                            className="h-9 text-sm"
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeAdditionalPricing(index)}>
                            <Trash size={16} />
                          </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateAdditionalPricingItem(index, { price: Number(e.target.value) || 0 })}
                            placeholder={t("price", "Price")}
                            className="h-9 text-sm"
                          />
                          <Select
                            value={item.period}
                            onValueChange={(val) => updateAdditionalPricingItem(index, { period: val })}
                          >
                            <SelectTrigger className="w-full sm:max-w-[120px] h-9 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PricePeriod.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>

                        <Textarea
                          value={item.description}
                          onChange={(e) => updateAdditionalPricingItem(index, { description: e.target.value })}
                          placeholder={t("description", "Description")}
                          className="w-full min-h-[80px] text-sm"
                        />

                        <OfferForm
                          offer={item.offer}
                          onChange={(field, value) => updateAdditionalPricingItem(index, { offer: { ...(item.offer || {}), [field]: value } })}
                          t={t}
                        />
                      </div>
                    ))}

                    {/* Add button card */}
                    <div className="relative flex flex-col gap-4 bg-card rounded-xl border border-primary/30 p-4 items-center justify-center">
                      <Button type="button" onClick={addAdditionalPricing} className="bg-primary hover:bg-primary/90 w-full">
                        <Plus size={16} className="mr-2" />
                        {t("addPricing", "Add Pricing")}
                      </Button>
                    </div>
                  </div>
                </section>
              </div>
            </TabsContent>

            {/* Payment content removed */}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Export as memoized component for tiny performance gains in parent onboarding flows.
export default React.memo(SubjectPricingInfoEditHollow);
