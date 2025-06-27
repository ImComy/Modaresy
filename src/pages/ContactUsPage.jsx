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
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: t('contact.messageSentTitle'),
      description: t('contact.messageSentDesc'),
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
          {t('contact.title')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          {t('contact.subtitle')}
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg glass-effect">
          <CardHeader>
            <CardTitle>{t('contact.formTitle')}</CardTitle>
            <CardDescription>{t('contact.formDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('contact.nameLabel')}</Label>
                  <Input id="name" type="text" placeholder={t('contact.namePlaceholder')} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('contact.emailLabel')}</Label>
                  <Input id="email" type="email" placeholder={t('contact.emailPlaceholder')} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">{t('contact.subjectLabel')}</Label>
                <Input id="subject" type="text" placeholder={t('contact.subjectPlaceholder')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t('contact.messageLabel')}</Label>
                <Textarea id="message" placeholder={t('contact.messagePlaceholder')} rows={5} required />
              </div>
              <Button type="submit" className="w-full">{t('contact.sendButton')}</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg glass-effect">
            <CardHeader>
              <CardTitle>{t('contact.infoTitle')}</CardTitle>
              <CardDescription>{t('contact.infoDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">{t('contact.emailInfo')}</h4>
                  <a href="mailto:info@tutorconnect.eg" className="text-muted-foreground hover:text-primary transition-colors">info@tutorconnect.eg</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">{t('contact.phoneInfo')}</h4>
                  <span className="text-muted-foreground">(+20) 123-456-7890</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">{t('contact.addressInfo')}</h4>
                  <span className="text-muted-foreground">123 Learning St, Cairo, Egypt</span>
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
