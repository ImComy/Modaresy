import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ContactUsPage = () => {
  const { t } = useTranslation(); // ⬅️ no namespace
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: t('messageSentTitle'),
      description: t('messageSentDesc'),
    });
    e.target.reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-12"
    >
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          {t('title')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">{t('subtitle')}</p>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <Card className="shadow-lg glass-effect">
          <CardHeader>
            <CardTitle>{t('formTitle')}</CardTitle>
            <CardDescription>{t('formDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('nameLabel')}</Label>
                  <Input id="name" type="text" placeholder={t('namePlaceholder')} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('emailLabel')}</Label>
                  <Input id="email" type="email" placeholder={t('emailPlaceholder')} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">{t('subjectLabel')}</Label>
                <Input id="subject" type="text" placeholder={t('subjectPlaceholder')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t('messageLabel')}</Label>
                <Textarea id="message" placeholder={t('messagePlaceholder')} rows={5} required />
              </div>
              <Button type="submit" className="w-full">{t('sendButton')}</Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="space-y-6">
          <Card className="shadow-lg glass-effect">
            <CardHeader>
              <CardTitle>{t('infoTitle')}</CardTitle>
              <CardDescription>{t('infoDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">{t('emailInfo')}</h4>
                  <a href="mailto:info@tutorconnect.eg" className="text-muted-foreground hover:text-primary transition-colors">support@modaresy.me</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">{t('phoneInfo')}</h4>
                  <span className="text-muted-foreground">01289099780</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactUsPage;
