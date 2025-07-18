import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Linkedin,
  Github,
  Twitter,
  Dribbble,
  Quote,
  Instagram,
  Globe,
  Youtube,
  Facebook,
} from "lucide-react";

const developers = [
  {
    name: "Abu El-Magd",
    role: "business man",
    bio: "i love him",
    image: "https://images.unsplash.com/photo-1675023112817-52b789fd2ef0",
    socials: {
    },
  },
  {
    name: "mohamed",
    role: "Backend Engineer",
    bio: "Amogus.",
    image: "https://images.unsplash.com/photo-1675023112817-52b789fd2ef0",
    socials: {
    },
  },
  {
    name: "me",
    role: "Frontend Developer",
    bio: "idk",
    image: "https://images.unsplash.com/photo-1675023112817-52b789fd2ef0",
    socials: {
    },
  },
  {
    name: "Moaz Ashour",
    role: "connections manager",
    bio: "i melt inside him",
    image: "https://images.unsplash.com/photo-1675023112817-52b789fd2ef0",
    socials: {
    },
  },
  {
    name: "Mohmed Essam",
    role: "idk but i love him too",
    bio: "zingy",
    image: "https://images.unsplash.com/photo-1675023112817-52b789fd2ef0",
    socials: {
    },
  },
  {
    name: "Full Card Name",
    role: "Full Stack Developer",
    bio: "مهووس بكل حاجة ليها علاقة بالبرمجة، من أول البنية التحتية لحد الواجهات التفاعلية. دايمًا بيدور على الجديد وعاوز يغيّر العالم.",
    image: "https://images.unsplash.com/photo-1675023112817-52b789fd2ef0",
    socials: {
      linkedin: "https://linkedin.com/in/fullcard",
      github: "https://github.com/fullcard",
      twitter: "https://twitter.com/fullcard",
      dribbble: "https://dribbble.com/fullcard",
      instagram: "https://instagram.com/fullcard",
      website: "https://fullcard.dev",
      youtube: "https://youtube.com/@fullcard",
      facebook: "https://facebook.com/fullcard"
    }
  }
];

// Map platform names to Lucide icons
const socialIcons = {
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
  dribbble: Dribbble,
  instagram: Instagram,
  website: Globe,
  youtube: Youtube,
  facebook: Facebook,
};

const MeetTheTeam = () => {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="relative min-h-screen px-6 py-24 rounded-3xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[hsl(var(--primary)/0.06)] to-[hsl(var(--accent)/0.06)]" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-transparent to-[hsl(var(--background))]" />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="pb-3 text-4xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
            {t("team.title", "Meet the Team")}
          </h2>
          <p className="mt-5 text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            {t(
              "team.description",
              "A collective of creators, innovators, and problem-solvers building extraordinary digital experiences."
            )}
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {developers.map((dev, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] max-w-sm flex flex-col rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-lg overflow-hidden transition-all duration-300 hover:shadow-[0_8px_40px_-8px_hsl(var(--primary)/0.3))] group"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={dev.image}
                  alt={dev.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/0.7)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between relative">
                <Quote className="absolute -top-5 -left-5 w-32 h-32 text-[hsl(var(--primary)/0.08)] rotate-[-15deg]" />

                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                    {t(`team.names.${dev.name}`, dev.name)}
                  </h3>
                  <p className="text-[hsl(var(--secondary))] font-medium">
                    {t(`team.roles.${dev.role}`, dev.role)}
                  </p>
                  <p className="mt-3 text-[hsl(var(--muted-foreground))] text-sm leading-relaxed italic">
                    {t(`team.bios.${dev.name}`, dev.bio)}
                  </p>

                  <div className="mt-4 flex gap-4 flex-wrap">
                    {Object.entries(dev.socials).map(([platform, url]) => {
                      const Icon = socialIcons[platform] || Globe;
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[hsl(var(--primary))] hover:text-[hsl(var(--accent))] transition-transform hover:scale-110"
                        >
                          <Icon className="w-6 h-6" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MeetTheTeam;
