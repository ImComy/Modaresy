import React, { useMemo, useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { BadgePercent, Banknote, User, Plus, Trash } from "lucide-react";
import SubjectSelector from "./SubjectSelector";
import { StepDataContext } from "@/context/StepContext";

const defaultT = (key, defaultValue) => defaultValue || key;

const OfferForm = ({ offer = {}, onChange = () => {}, t = defaultT }) => {
  const safe = {
    percentage: offer.percentage ?? "",
    from: offer.from ?? "",
    to: offer.to ?? "",
    description: offer.description ?? "",
  };

  return (
    <div className="mt-3 p-4 border border-green-700 bg-lime-800/10  rounded-lg">
      <div className="flex items-center gap-2 mb-2 text-sm font-medium text-green-300">
        <BadgePercent size={16} />
        <span>{t("offer", "Offer")}</span>
        {safe.percentage ? (
          <span className="ml-2 text-xs bg-green-100 px-2 py-0.5 rounded">{`${safe.percentage}%`}</span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Input
          type="number"
          value={safe.percentage}
          onChange={(e) => onChange("percentage", e.target.value)}
          placeholder={t("percentage", "Percentage (e.g. 10)")}
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
        placeholder={t("offerDescription", "Optional note about the offer (conditions, who it's for)")}
        className="w-full mt-3 min-h-[60px] text-sm"
      />
    </div>
  );
};

const SubjectPricingOnboard = ({ t = defaultT, constants = {} }) => {
  const { state, setState } = useContext(StepDataContext);
  const subjects = Array.isArray(state?.subjects) ? state.subjects : [];

  const [selectedSubject, setSelectedSubject] = useState(null);

  // If there is a selectedSubjectId in parent state, initialize selection
  useEffect(() => {
    const id = state?.selectedSubjectId;
    if (id && subjects.length > 0) {
      const found = subjects.find((s) => String(s.id) === String(id));
      if (found) setSelectedSubject(found);
    }
  }, [state?.selectedSubjectId, subjects]);

  // When subjects list changes, keep selectedSubject in sync (preserve updates)
  useEffect(() => {
    if (!selectedSubject) return;
    const refreshed = subjects.find((s) => String(s.id) === String(selectedSubject.id));
    if (refreshed) setSelectedSubject(refreshed);
    // if not found, clear selection
    else setSelectedSubject(null);
  }, [subjects]);

  const PricePeriod = constants.PricePeriod ?? ["Session", "Month"];

  // persist a full subject patch into parent state.subjects
  const persistSubject = (patch) => {
    if (!selectedSubject) return;
    const updated = { ...selectedSubject, ...patch };
    setSelectedSubject(updated);
    setState((prev) => {
      const arr = Array.isArray(prev?.subjects) ? prev.subjects : [];
      const updatedSubjects = arr.map((s) =>
        String(s.id) === String(updated.id) ? { ...s, ...updated } : s
      );
      return { ...prev, subjects: updatedSubjects };
    });
  };

  const updateNested = (key, value) => {
    persistSubject({ [key]: { ...(selectedSubject?.[key] || {}), ...value } });
  };

  const addAdditionalPricing = () => {
    const newItem = { name: "", price: "", period: PricePeriod[0], description: "", offer: {} };
    persistSubject({ additional_pricing: [...(selectedSubject.additional_pricing || []), newItem] });
  };

  const removeAdditionalPricing = (index) => {
    const arr = (selectedSubject.additional_pricing || []).filter((_, i) => i !== index);
    persistSubject({ additional_pricing: arr });
  };

  const updateAdditionalPricingItem = (index, patch) => {
    const arr = (selectedSubject.additional_pricing || []).map((it, i) => (i === index ? { ...it, ...patch } : it));
    persistSubject({ additional_pricing: arr });
  };

  // When a variant is selected from the selector
  const handleSubjectSelect = (variant) => {
    const subj = variant?.subject || variant?.raw || null;
    if (!subj) return;
    setSelectedSubject(subj);
    setState((prev) => ({ ...prev, selectedSubjectId: variant.id }));
  };

  // If no subjects exist yet, show instructive message
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8">
        <div className="p-6 bg-muted rounded-lg text-center">
          <Banknote size={36} className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold">{t("noSubjectsInOnboarding", "No subjects found")}</h2>
          <p className="mt-2 text-muted-foreground">{t("addSubjectsFirst", "Please add subjects in the Subjects step first.")}</p>
        </div>
      </div>
    );
  }

  // If nothing selected yet, render selector + a hint
  if (!selectedSubject) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8">
        <div className="mb-6">
          <SubjectSelector subjects={subjects} selectedId={state?.selectedSubjectId} onSelect={handleSubjectSelect} />
        </div>

        <div className="p-6 bg-muted rounded-lg text-center">
          <h3 className="text-lg font-medium">{t("selectSubjectToEditPricing", "Select a subject to edit its pricing")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t("selectAboveOrAddSubject", "Choose a subject from the selector above or add a new subject in the Subjects step.")}</p>
        </div>
      </div>
    );
  }

  // safe accessors for pricing sections
  const group_pricing = selectedSubject.group_pricing || { price: "", price_period: PricePeriod[0], offer: {} };
  const private_pricing = selectedSubject.private_pricing || { price: "", price_period: PricePeriod[0], note: "", offer: {} };
  const additional_pricing = Array.isArray(selectedSubject.additional_pricing) ? selectedSubject.additional_pricing : [];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <SubjectSelector subjects={subjects} selectedId={state?.selectedSubjectId} onSelect={handleSubjectSelect} />

        <Card className="rounded-2xl bg-transparent border-none mt-6">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  {t("pricingFor", "Pricing for")}{" "}
                  <span className="text-primary">{selectedSubject.title || selectedSubject.name || t("thisSubject", "this subject")}</span>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                  {t(
                    "pricingOnboardDescription",
                    "Set clear, realistic prices so students know what to expect. You can set group and private rates, add extras (e.g. mock exams, materials), and add limited-time offers."
                  )}
                </p>
              </div>
            </div>

            {/* Group pricing card */}
            <section className="bg-muted/20 rounded-xl p-4 sm:p-5 border border-primary/30">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/5 p-2">
                  <Banknote size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{t("groupPricing", "Group Pricing")}</h3>
                      <p className="text-sm text-muted-foreground">{t("groupPricingDesc", "Set a per-student price for group lessons (recommended when teaching +2 students).")}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <Input
                      type="number"
                      value={group_pricing.price}
                      onChange={(e) => updateNested("group_pricing", { ...group_pricing, price: Number(e.target.value) || "" })}
                      placeholder={t("pricePerStudent", "Price per student")}
                      className="h-10 text-sm"
                    />

                    <Select
                      value={group_pricing.price_period}
                      onValueChange={(val) => updateNested("group_pricing", { ...group_pricing, price_period: val })}
                    >
                      <SelectTrigger className="w-full sm:max-w-[160px] h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PricePeriod.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
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
            </section>

            {/* Private pricing card */}
            <section className="bg-muted/20 rounded-xl p-4 sm:p-5 border border-primary/30">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/5 p-2">
                  <User size={20} />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{t("privateSessions", "Private Sessions")}</h3>
                      <p className="text-sm text-muted-foreground">{t("privatePricingDesc", "Set your one-to-one price and add an optional note that will appear to students.")}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <Input
                      type="number"
                      value={private_pricing.price}
                      onChange={(e) => updateNested("private_pricing", { ...private_pricing, price: Number(e.target.value) || "" })}
                      placeholder={t("price", "Price")}
                      className="h-10 text-sm"
                    />

                    <Select
                      value={private_pricing.price_period}
                      onValueChange={(val) => updateNested("private_pricing", { ...private_pricing, price_period: val })}
                    >
                      <SelectTrigger className="w-full sm:max-w-[160px] h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PricePeriod.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Textarea
                    value={private_pricing.note || ""}
                    onChange={(e) => updateNested("private_pricing", { ...private_pricing, note: e.target.value })}
                    placeholder={t("notePlaceholder", "Add a short note for students (e.g., materials provided, expected prep)")}
                    className="w-full min-h-[80px] text-sm mt-3"
                  />

                  <OfferForm
                    offer={private_pricing.offer}
                    onChange={(field, value) => updateNested("private_pricing", { ...private_pricing, offer: { ...(private_pricing.offer || {}), [field]: value } })}
                    t={t}
                  />
                </div>
              </div>
            </section>

            {/* Additional pricing */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Banknote size={18} />
                  </div>
                  <h3 className="text-lg font-bold">{t("additionalPricing", "Additional Pricing")}</h3>
                </div>

                <Button type="button" onClick={addAdditionalPricing} className="inline-flex items-center gap-2" variant={undefined}>
                  <Plus size={16} /> {t("addPricing", "Add Pricing")}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {additional_pricing.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative flex flex-col gap-3 bg-card rounded-xl border border-primary/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Input
                        value={item.name}
                        onChange={(e) => updateAdditionalPricingItem(index, { name: e.target.value })}
                        placeholder={t("pricingName", "Pricing Name (e.g. Mock Exam)")}
                        className="h-10 text-sm"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeAdditionalPricing(index)}>
                        <Trash size={14} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateAdditionalPricingItem(index, { price: Number(e.target.value) || "" })}
                        placeholder={t("price", "Price")}
                        className="h-10 text-sm"
                      />

                      <Select
                        value={item.period}
                        onValueChange={(val) => updateAdditionalPricingItem(index, { period: val })}
                      >
                        <SelectTrigger className="w-full sm:max-w-[120px] h-10 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PricePeriod.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="text-sm text-muted-foreground">{t("optional", "Optional")}</div>
                    </div>

                    <Textarea
                      value={item.description}
                      onChange={(e) => updateAdditionalPricingItem(index, { description: e.target.value })}
                      placeholder={t("description", "Short description (what this includes)")}
                      className="w-full min-h-[70px] text-sm"
                    />

                    <OfferForm
                      offer={item.offer}
                      onChange={(field, value) => updateAdditionalPricingItem(index, { offer: { ...(item.offer || {}), [field]: value } })}
                      t={t}
                    />
                  </motion.div>
                ))}

                {additional_pricing.length === 0 ? (
                  <div className="flex items-center justify-center p-6 border border-dashed rounded-xl text-sm text-muted-foreground">
                    {t(
                      "noAdditionalPricing",
                      "No extra packages yet — add materials, mock exams, or bundles that students can purchase on top of sessions."
                    )}
                  </div>
                ) : null}
              </div>
            </section>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default React.memo(SubjectPricingOnboard);
