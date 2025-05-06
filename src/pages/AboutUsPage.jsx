
    import React from 'react';
    import { motion } from 'framer-motion';
    import { useTranslation } from 'react-i18next';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Users, Target, Lightbulb, HeartHandshake as Handshake } from 'lucide-react';

    const AboutUsPage = () => {
      const { t } = useTranslation();

      const teamMembers = [
        { name: "Founder A", role: t('ceoFounder'), imgKey: "Founder working at desk" },
        { name: "Developer B", role: t('leadDeveloper'), imgKey: "Developer coding on laptop" },
        { name: "Designer C", role: t('uxDesigner'), imgKey: "Designer sketching interfaces" },
        { name: "Marketer D", role: t('marketingLead'), imgKey: "Marketer presenting ideas" },
      ];

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }} // Simplified transition
          className="space-y-12"
        >
          {/* Hero Section */}
          <section className="text-center py-12 bg-gradient-to-b from-primary/10 to-transparent rounded-lg">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold mb-4 text-primary"
            >
              {t('aboutUsTitle')}
            </motion.h1>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              {t('aboutUsSubtitle')}
            </motion.p>
          </section>

          {/* Our Mission & Vision */}
          <section className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Target className="w-10 h-10 text-secondary" />
                  <CardTitle className="text-2xl">{t('ourMission')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t('ourMissionText')}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Lightbulb className="w-10 h-10 text-secondary" />
                  <CardTitle className="text-2xl">{t('ourVision')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t('ourVisionText')}</p>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Our Values */}
           <section className="text-center">
             <h2 className="text-3xl font-bold mb-8">{t('ourValues')}</h2>
             <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { icon: Users, title: t('valueStudentFocus'), text: t('valueStudentFocusDesc') },
                 { icon: Target, title: t('valueQuality'), text: t('valueQualityDesc') },
                 { icon: Lightbulb, title: t('valueInnovation'), text: t('valueInnovationDesc') },
                 { icon: Handshake, title: t('valueIntegrity'), text: t('valueIntegrityDesc') },
               ].map((value, index) => (
                 <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex flex-col items-center p-4"
                 >
                   <div className="bg-primary/10 text-primary rounded-full p-4 mb-3">
                      <value.icon size={32} />
                   </div>
                   <h3 className="text-lg font-semibold mb-1">{value.title}</h3>
                   <p className="text-sm text-muted-foreground">{value.text}</p>
                 </motion.div>
               ))}
             </div>
           </section>

          {/* Meet the Team */}
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-8">{t('meetTheTeam')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-3 border-2 border-secondary shadow-sm bg-muted">
                     <img 
                        class="w-full h-full object-cover"
                        alt={member.name}
                      src="https://images.unsplash.com/photo-1675023112817-52b789fd2ef0" />
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-secondary">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </section>

        </motion.div>
      );
    };

    export default AboutUsPage;
  