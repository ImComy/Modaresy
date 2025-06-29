import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MailIcon,
  StickyNote,
  CheckCircle,
  Send,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className=" flex items-center justify-center bg-[hsl(var(--background))] p-6"
    >
      <Card className="w-full max-w-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-md rounded-2xl">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4 }}
            >
              <CardHeader className="px-6 pt-6 pb-4 text-center">
                <CardTitle className="text-2xl font-bold text-[hsl(var(--primary))]">
                  {t('forgotTitle')}
                </CardTitle>
                <CardDescription className="text-[hsl(var(--muted-foreground))] mt-2">
                  {t('forgotDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm flex items-center gap-1 text-[hsl(var(--foreground))]">
                      <MailIcon className="w-4 h-4 text-[hsl(var(--primary))]" />
                      {t('email')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('emailPlaceholder')}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note" className="text-sm flex items-center gap-1 text-[hsl(var(--foreground))]">
                      <StickyNote className="w-4 h-4 text-[hsl(var(--primary))]" />
                      {t('additionalNote')}
                    </Label>
                    <Textarea
                      id="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t('additionalNotePlaceholder')}
                      className="rounded-xl"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-xl text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {t('resetBtn')}
                  </Button>
                </form>
              </CardContent>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <CardHeader className="text-center px-6 pt-10 pb-8">
                <CheckCircle className="w-10 h-10 text-[hsl(var(--accent))] mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">
                  {t('resetSubmittedTitle')}
                </CardTitle>
                <CardDescription className="text-[hsl(var(--muted-foreground))] mt-2 leading-relaxed">
                  {t('resetSubmittedDesc')}
                </CardDescription>
              </CardHeader>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default ForgotPasswordPage;
