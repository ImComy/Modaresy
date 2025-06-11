import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Banknote, User } from "lucide-react";

const SubjectPricingInfo = ({ price, privatePricing }) => {
  return (
    <Card className="w-full shadow-md border-muted">
      <CardContent className="space-y-6 pt-6">
        {/* Group Pricing */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Banknote size={18} />
            <h3 className="text-base font-semibold">Group Pricing</h3>
          </div>
          <p className="text-muted-foreground ml-6">EGP {price} / month</p>
        </div>

        <Separator />

        {/* Private Pricing */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <User size={18} />
            <h3 className="text-base font-semibold">Private Sessions</h3>
          </div>

          {privatePricing ? (
            <div className="ml-6 space-y-1">
              <p className="text-muted-foreground">EGP {privatePricing.price} / month</p>
              {privatePricing.note && (
                <Badge variant="outline" className="text-sm">{privatePricing.note}</Badge>
              )}
            </div>
          ) : (
            <p className="ml-6 italic text-muted-foreground">
              Only available in groups – no private sessions offered.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectPricingInfo;
