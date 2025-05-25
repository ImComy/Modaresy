import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const TermsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto max-w-2xl py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-2">{t("Terms of Service")}</CardTitle>
          <p className="text-muted-foreground">{t("Last updated")}: May 2025</p>
        </CardHeader>
        <CardContent className="space-y-6 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Acceptance of Terms")}</h2>
            <p>
              {t("By accessing or using Modaresy, you agree to be bound by these Terms of Service and our")}{" "}
              <Link to="/privacy" className="underline text-primary">{t("Privacy Policy")}</Link>.
              {t("If you do not agree, please do not use our platform.")}
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Description of Service")}</h2>
            <p>
              {t("Modaresy is an online platform that connects students with qualified tutors. We provide tools for searching, filtering, and communicating with tutors, but we do not directly employ tutors or guarantee the outcome of any tutoring session.")}
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("User Accounts")}</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("You must be at least 16 years old to create an account.")}</li>
              <li>{t("You are responsible for maintaining the confidentiality of your account credentials.")}</li>
              <li>{t("All information you provide must be accurate and up to date.")}</li>
              <li>{t("Accounts found to be using false information may be suspended or removed.")}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Tutor Responsibilities")}</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("Tutors must provide accurate qualifications and experience.")}</li>
              <li>{t("Tutors are responsible for the content and quality of their lessons.")}</li>
              <li>{t("Tutors must comply with all applicable laws and regulations.")}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Student Responsibilities")}</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("Students must provide accurate information when booking lessons.")}</li>
              <li>{t("Students are responsible for communicating respectfully with tutors.")}</li>
              <li>{t("Any payment arrangements are solely between the student and tutor unless otherwise specified.")}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Prohibited Conduct")}</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("No harassment, abuse, or discrimination of any kind.")}</li>
              <li>{t("No posting of false, misleading, or inappropriate content.")}</li>
              <li>{t("No unauthorized commercial solicitation or spam.")}</li>
              <li>{t("No attempts to circumvent platform security or misuse the service.")}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Content Ownership")}</h2>
            <p>
              {t("You retain ownership of any content you submit, but grant Modaresy a non-exclusive, royalty-free license to use, display, and distribute such content as part of the service.")}
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Disclaimers & Limitation of Liability")}</h2>
            <p>
              {t('Modaresy is provided "as is" without warranties of any kind. We do not guarantee the accuracy of tutor profiles or the outcome of lessons. Modaresy is not liable for any damages arising from use of the platform.')}
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Termination")}</h2>
            <p>
              {t("We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason.")}
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Changes to Terms")}</h2>
            <p>
              {t("We may update these Terms of Service from time to time. Continued use of Modaresy after changes constitutes acceptance of the new terms.")}
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Contact Us")}</h2>
            <p>
              {t("If you have any questions about these Terms, please")}{" "}
              <Link to="/contact" className="underline text-primary">{t("contact us")}</Link>.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsPage;