
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Star, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uniqueSubjects, uniqueLocations } from '@/data/mockTutors';

// This component is no longer used in HomePage, but kept for potential future use or reference.
// In a real scenario, if confirmed unused, it could be deleted.
const FilterSidebar = ({ filters, handleFilterChange, handleRateChange, showFilters, setShowFilters }) => {
  return (
    <motion.aside
      key="filters-sidebar"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "w-full lg:w-1/4 xl:w-1/5 flex-shrink-0",
        showFilters ? 'block' : 'hidden lg:block' // This logic is now handled differently
      )}
    >
      <Card className="sticky top-20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Filters</span>
            {/* This button is likely redundant now */}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setShowFilters(false)}>
                <Filter size={18} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label htmlFor="subject-filter" className="text-sm font-medium">Subject</Label>
            <Select value={filters.subject} onValueChange={(value) => handleFilterChange('subject', value)}>
              <SelectTrigger id="subject-filter" className="h-9 mt-1">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {uniqueSubjects.map(subject => (
                  <SelectItem key={subject} value={subject.toLowerCase()} className="text-sm">{subject === 'all' ? 'All Subjects' : subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location-filter" className="text-sm font-medium">Location</Label>
            <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
              <SelectTrigger id="location-filter" className="h-9 mt-1">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {uniqueLocations.map(location => (
                  <SelectItem key={location} value={location.toLowerCase()} className="text-sm">{location === 'all' ? 'All Locations' : location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="rate-filter" className="text-sm font-medium">Hourly Rate (EGP {filters.rateRange[0]} - {filters.rateRange[1]})</Label>
            <Slider
              id="rate-filter"
              min={50}
              max={500}
              step={10}
              value={filters.rateRange}
              onValueChange={handleRateChange}
              className="mt-2"
            />
          </div>

            <div>
              <Label className="text-sm font-medium">Minimum Rating</Label>
              <div className="flex items-center space-x-1.5 mt-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Button
                    key={star}
                    variant={filters.minRating >= star ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('minRating', star)}
                    className="flex items-center gap-1 px-2 h-8 text-xs"
                  >
                    {star} <Star size={12} className={cn('transition-colors', filters.minRating >= star ? 'text-yellow-300 fill-yellow-400' : 'text-muted-foreground')}/>
                  </Button>
                ))}
                  <Button
                    key={0}
                    variant={filters.minRating === 0 ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => handleFilterChange('minRating', 0)}
                    className="h-8 text-xs text-muted-foreground"
                  >
                    Any
                  </Button>
              </div>
            </div>
        </CardContent>
      </Card>
    </motion.aside>
  );
};

export default FilterSidebar;
