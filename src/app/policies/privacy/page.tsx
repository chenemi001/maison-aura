import type { Metadata } from "next";
import { PolicyPage } from "@/app/components/layout/PolicyPage";
import { buildMetadata } from "@/app/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy policy",
  description: "How Maison Aura collects, uses and protects your personal data.",
  path: "/policies/privacy",
});

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy policy" path="/policies/privacy" updated="15 October 2026">
      <p>
        Maison Aura respects your privacy. This policy explains what personal data we collect when you use
        this website, why we collect it, and the choices you have. This store is a portfolio demonstration;
        the practices below describe how the application is built to handle data.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong> — your name, email address and a securely hashed password, managed by
          our authentication provider, Supabase.
        </li>
        <li>
          <strong>Order data</strong> — items purchased, delivery address and contact details needed to
          fulfil your order.
        </li>
        <li>
          <strong>Payment data</strong> — processed entirely by our PCI-DSS Level 1 certified payment
          provider on its hosted payment page. We never see or store your full card number.
        </li>
        <li>
          <strong>Bag contents</strong> — stored only in your own browser&apos;s local storage until checkout.
        </li>
      </ul>
      <h2>How we use it</h2>
      <p>
        We use your data solely to provide your account, process and deliver orders, and — only if you opt
        in — send our newsletter. We do not sell personal data.
      </p>
      <h2>Your rights</h2>
      <p>
        Under the Nigeria Data Protection Act 2023 you may request access to, correction of, or deletion of
        your personal data at any time, and you may unsubscribe from marketing emails using the link in every
        message.
      </p>
      <h2>Cookies</h2>
      <p>
        We use only strictly necessary cookies to keep you signed in securely. We do not use advertising or
        cross-site tracking cookies.
      </p>
    </PolicyPage>
  );
}
