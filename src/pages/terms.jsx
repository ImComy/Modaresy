import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const TermsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto max-w-3xl py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-2">
            {t("Modaresy Terms of Service & Platform Rules")}
          </CardTitle>
          <p className="text-muted-foreground">
            {t("Last Updated")}: May 2025
          </p>
        </CardHeader>
        <CardContent className="space-y-6 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="font-semibold text-lg mb-1">
              {t("Acceptance of Terms")}
            </h2>
            <p>
              {t(
                "By accessing or using Modaresy, you agree to abide by these Terms of Service and our Privacy Policy. If you do not accept these terms, please do not use the platform."
              )}
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">
              {t("Description of Service")}
            </h2>
            <p>
              {t(
                "Modaresy is an online platform connecting students with private tutors. We offer tools for browsing, filtering, and contacting tutors. However, we do not employ tutors directly, nor guarantee the outcome of any tutoring sessions."
              )}
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">
              {t("User Accounts")}
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t("Be at least 13 years old to create an account.")}</li>
              <li>{t("Use accurate, real information.")}</li>
              <li>
                {t("Maintain confidentiality of their login credentials.")}
              </li>
              <li>
                {t("Understand that false information may lead to account suspension.")}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">
              {t("Tutor Rules & Responsibilities")}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{t("Profile & Course Requirements")}</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>{t("Upload a clear profile photo.")}</li>
                  <li>{t("Use your real name or known teaching name.")}</li>
                  <li>{t("Provide a clear description of your course:")}</li>
                  <ul className="list-disc pl-8">
                    <li>{t("Number of sessions.")}</li>
                    <li>{t("Price per session or monthly subscription.")}</li>
                    <li>{t("Whether sessions are online or in-person.")}</li>
                  </ul>
                </ul>
              </div>

              <div>
                <h3 className="font-medium">{t("Commitment to Schedule")}</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>{t("Teachers are responsible for their listed times.")}</li>
                  <li>{t("In case of cancellation, students must be informed well in advance.")}</li>
                  <li>{t("Repeated absences or lateness may lead to suspension.")}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium">{t("Quality & Student Feedback")}</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>{t("Students can leave reviews after each session or month.")}</li>
                  <li>{t("Reviews affect your ranking on the platform.")}</li>
                  <li>{t("Repeated poor ratings will result in investigation or removal.")}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium">{t("Payments & Subscription")}</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>{t("Teachers receive payments per session or monthly based on agreement.")}</li>
                  <li>{t("A 50 EGP monthly subscription to Modaresy is required (first month is free).")}</li>
                  <li>{t("Modaresy does not interfere with or hold teacher-student payments.")}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium">{t("Content Responsibility")}</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>{t("Teachers are fully responsible for any educational materials shared.")}</li>
                  <li>{t("Plagiarism, copyright violations, abusive content, or anything illegal is strictly forbidden.")}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium">{t("Withdrawal Policy")}</h3>
                <p>{t("You may pause or close your account at any time by notifying us at least one week in advance.")}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">
              {t("Student Rules & Responsibilities")}
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t("Must provide accurate info when requesting lessons.")}</li>
              <li>{t("Must communicate respectfully with teachers.")}</li>
              <li>{t("Payments between student and teacher are handled independently unless otherwise specified.")}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Prohibited Conduct")}</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t("Harassment, abuse, or discrimination.")}</li>
              <li>{t("Posting false, offensive, or misleading content.")}</li>
              <li>{t("Unauthorized commercial use or spam.")}</li>
              <li>{t("Hacking, exploiting, or misusing the platform.")}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Content Ownership")}</h2>
            <p>
              {t(
                "You retain ownership of any content you upload, but grant Modaresy a non-exclusive, royalty-free license to use and distribute it as part of the service."
              )}
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">
              {t("Disclaimers & Limitation of Liability")}
            </h2>
            <p>
              {t(
                'Modaresy is provided "as is." We do not guarantee lesson quality or outcomes. Modaresy is not liable for disputes, lost payments, or academic performance.'
              )}
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Termination")}</h2>
            <p>
              {t(
                "We reserve the right to suspend or terminate any account that violates our terms or harms the platform's integrity."
              )}
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Changes to Terms")}</h2>
            <p>
              {t(
                "These terms may be updated. Continued use after updates means you accept the changes."
              )}
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">{t("Contact Us")}</h2>
            <p>support@modaresy.com</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsPage;
