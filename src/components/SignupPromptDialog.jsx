import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { grades, sectors } from '@/data/formData';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/components/ui/use-toast'; // Import useToast

const SignupPromptDialog = ({ open, onOpenChange, onPreferenceSet }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast(); // Initialize toast
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    // Validation: Ensure both grade and sector are selected
    if (!selectedGrade || !selectedSector) {
      setError(t('gradeSectorRequiredError')); // Add this translation key
      toast({
          title: t('error'),
          description: t('gradeSectorRequiredError'),
          variant: 'destructive',
      });
      return;
    }
    setError(''); // Clear error if validation passes

    // Store preferences
    localStorage.setItem('userGradePreference', selectedGrade);
    localStorage.setItem('userSectorPreference', selectedSector);

    // Call the handler to set the flag indicating preference is set
    onPreferenceSet();

    // Optionally, apply filters immediately or just close
    // applyFilters(selectedGrade, selectedSector); // Example function
    onOpenChange(false); // Close the dialog
      toast({
          title: t('preferencesSavedTitle'), // Add this key
          description: t('preferencesSavedDesc'), // Add this key
      });
  };

    const handleGoToSignup = () => {
      onOpenChange(false);
      navigate('/signup');
    };

  // Determine overlay and content classes based on theme
  const overlayClass = theme === 'light' ? 'signup-prompt-overlay' : 'bg-black/80';
  const contentClass = theme === 'light' ? 'signup-prompt-content' : 'bg-background/90 border-border/50 shadow-xl';

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setSelectedGrade('');
      setSelectedSector('');
      setError('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
          <DialogOverlay className={overlayClass} />
        <DialogContent className={cn("sm:max-w-[450px]", contentClass)}>
          <DialogHeader>
            <DialogTitle className="text-xl">{t('welcomePromptTitle')}</DialogTitle>
            <DialogDescription>
              {t('welcomePromptDescMandatory')} {/* Changed description key */}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
              {/* Grade Select */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prompt-grade" className="text-right rtl:text-left col-span-1">
                  {t('grade')} <span className="text-destructive">*</span>
                </Label>
                <Select value={selectedGrade} onValueChange={(value) => { setSelectedGrade(value); setError(''); }}>
                  <SelectTrigger id="prompt-grade" className={cn("col-span-3 h-10", error && !selectedGrade && "border-destructive")}>
                      <SelectValue placeholder={t('selectGrade')} /> {/* Changed placeholder */}
                  </SelectTrigger>
                  <SelectContent>
                      {grades.map(grade => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {t(grade.labelKey)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sector Select */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prompt-sector" className="text-right rtl:text-left col-span-1">
                  {t('sector')} <span className="text-destructive">*</span>
                </Label>
                <Select value={selectedSector} onValueChange={(value) => { setSelectedSector(value); setError(''); }}>
                    <SelectTrigger id="prompt-sector" className={cn("col-span-3 h-10", error && !selectedSector && "border-destructive")}>
                      <SelectValue placeholder={t('selectSector')} /> {/* Changed placeholder */}
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map(sector => (
                        <SelectItem key={sector.value} value={sector.value}>
                          {t(sector.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-destructive text-center col-span-4">{error}</p>}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              {/* Removed Skip Button */}
              <Button type="button" variant="outline" onClick={handleGoToSignup}>{t('goToSignup')}</Button>
              <Button type="button" onClick={handleContinue}>{t('continueWithSelection')}</Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default SignupPromptDialog;
