import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
import { Trash2, Plus, DollarSign } from 'lucide-react';
import { SearchableSelectContent } from '@/components/ui/searchSelect';

const SUBJECTS = ['Math', 'Science', 'English'];

const PricesAndOffersSection = () => {
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);

  const [pricingData, setPricingData] = useState(
    SUBJECTS.reduce((acc, subject) => {
      acc[subject] = {
        groupPrice: '',
        privatePrice: '',
        privateNote: '',
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
        offer: { title: '', description: '', from: '', to: '' },
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
          <DollarSign className="w-10 h-10" /> Prices and Offers
        </CardTitle>
      </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div>
            <Label className="text-sm">Select Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="mt-1 bg-background border-muted">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SearchableSelectContent
                searchPlaceholder="Search subject..."
                items={SUBJECTS.map((subject) => ({
                  value: subject,
                  label: subject,
                }))}
              />
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Group Lesson Price</Label>
              <Input
                type="number"
                placeholder="e.g. 200"
                value={data.groupPrice}
                onChange={(e) => handleUpdate('groupPrice', e.target.value)}
              />
            </div>
            <div>
              <Label>Private Lesson Price (optional)</Label>
              <Input
                type="number"
                placeholder="e.g. 300"
                value={data.privatePrice}
                onChange={(e) => handleUpdate('privatePrice', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Private Lesson Note (optional)</Label>
            <Input
              placeholder="e.g. Only available on weekends"
              value={data.privateNote}
              onChange={(e) => handleUpdate('privateNote', e.target.value)}
            />
          </div>

          {/* Offer Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">
                Offer
              </h4>
              {!data.offer && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={addOffer}
                  className="gap-1 border border-border"
                >
                  <Plus className="w-4 h-4" /> Add Offer
                </Button>
              )}
            </div>

            {data.offer && (
              <div className="border border-border p-4 rounded-xl bg-muted/10 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Offer Title</Label>
                    <Input
                      value={data.offer.title}
                      onChange={(e) =>
                        updateOfferField('title', e.target.value)
                      }
                      placeholder="e.g. 20% Off"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>From</Label>
                      <Input
                        type="date"
                        value={data.offer.from}
                        onChange={(e) =>
                          updateOfferField('from', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>To</Label>
                      <Input
                        type="date"
                        value={data.offer.to}
                        onChange={(e) =>
                          updateOfferField('to', e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className='flex gap-4 flex-col md:flex-row'>
                  <Label>Description</Label>
                  <Input
                    value={data.offer.description}
                    onChange={(e) =>
                      updateOfferField('description', e.target.value)
                    }
                    placeholder="e.g. 20% off for new students until June 30"
                  />
                  <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removeOffer}
                    className="hover:bg-destructive/10"
                  >
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </Button>
                </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PricesAndOffersSection;
