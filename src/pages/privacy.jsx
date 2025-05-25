import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const PrivacyPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto max-w-2xl py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-2">{t("Privacy Policy")}</CardTitle>
          <p className="text-muted-foreground">{t("Last updated")}: May 2025</p>
        </CardHeader>
        <CardContent className="space-y-6 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Introduction")}</h2>
            <p>
              {t("This Privacy Policy explains how Modaresy collects, uses, and protects your personal information when you use our platform. By using Modaresy, you consent to the practices described in this policy.")}
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Information We Collect")}</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("Account information such as your name, email address, and password.")}</li>
              <li>{t("Profile details including your role, grade, sector, and other educational information.")}</li>
              <li>{t("Content you submit, such as messages, reviews, and uploaded files.")}</li>
              <li>{t("Usage data, such as pages visited and actions taken on the platform.")}</li>
              <li>{t("Technical data, such as IP address, browser type, and device information.")}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("How We Use Your Information")}</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("To provide and improve our services.")}</li>
              <li>{t("To personalize your experience and show relevant content.")}</li>
              <li>{t("To communicate with you about your account or our services.")}</li>
              <li>{t("To ensure platform security and prevent misuse.")}</li>
              <li>{t("To comply with legal obligations.")}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("How We Share Your Information")}</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("With tutors, students, or other users as needed to provide our services.")}</li>
              <li>{t("With service providers who help us operate the platform (e.g., hosting, analytics).")}</li>
              <li>{t("If required by law, regulation, or legal process.")}</li>
              <li>{t("In connection with a merger, acquisition, or sale of assets (you will be notified if this happens).")}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Your Choices and Rights")}</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("You can update or delete your account information at any time from your profile settings.")}</li>
              <li>{t("You may opt out of marketing emails by following the unsubscribe instructions in those emails.")}</li>
              <li>{t("You can request access to or deletion of your personal data by contacting us.")}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Data Security")}</h2>
            <p>
              {t("We use reasonable measures to protect your information, but no system is completely secure. Please keep your password safe and notify us of any unauthorized use of your account.")}
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Changes to This Policy")}</h2>
            <p>
              {t("We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page.")}
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Contact Us")}</h2>
            <p>
              {t("If you have any questions about this Privacy Policy, please")}{" "}
              <Link to="/contact" className="underline text-primary">{t("contact us")}</Link>.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPage;