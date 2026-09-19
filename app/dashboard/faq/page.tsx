import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const FAQS = [
  {
    q: "What is P?",
    a: "P is PingVirtual's wallet currency. 1P = ₦500. All prices on the app are shown in P so they stay simple and consistent no matter what's happening behind the scenes.",
  },
  {
    q: "Why didn't I receive my code?",
    a: "The most common reason is that the number was already used to register that service before you rented it - this happens sometimes with shared number pools. If no code arrives, your number is automatically cancelled and refunded, no action needed.",
  },
  {
    q: "I'm using a VPN - will that cause problems?",
    a: "Yes, potentially. Many apps check the location your request is coming from. If your VPN location doesn't match the number's country, verification can fail or the code may never arrive. Set your VPN to the same country as the number you rented before requesting the code.",
  },
  {
    q: "Can I cancel a number I bought?",
    a: "Yes, as long as it hasn't received a code yet. Some numbers have a short mandatory wait (up to 2 minutes) before cancellation is allowed - the app shows a countdown when this applies. Others can be cancelled immediately.",
  },
  {
    q: "What happens if my number expires without a code?",
    a: "It's refunded automatically to your wallet - you don't need to do anything or contact support.",
  },
  {
    q: "Is my payment information safe?",
    a: "Payments are processed entirely by Paystack - PingVirtual never sees or stores your card details.",
  },
  {
    q: "Can I use the same number twice?",
    a: "No - once an activation is finished or expires, that specific rented number is released and may be reused by someone else. Each purchase gives you a fresh rental.",
  },
  {
    q: "Which countries and services are supported?",
    a: "Hundreds of services across dozens of countries, browsable from the Services tab by category or by search. Availability and pricing update live, so what's in stock can change from moment to moment.",
  },
  {
    q: "How long does it take to receive a number?",
    a: "Numbers are issued instantly after purchase. How quickly the SMS code itself arrives depends on the destination service, usually within seconds to a couple of minutes.",
  },
  {
    q: "Why does the price differ for the same service in different countries?",
    a: "Pricing reflects real-time cost and availability, which varies by country and fluctuates with demand - the same way phone and data plans differ by region.",
  },
  {
    q: "Do I need the PingVirtual app, or does the website work fine?",
    a: "The website works fully on mobile - no app download needed. For quicker access, you can add PingVirtual to your home screen from your browser's menu.",
  },
  {
    q: "How do I contact support?",
    a: "Use the chat bubble in the bottom corner of the app, or email support@xchord.space.",
  },
];

export default function FaqPage() {
  return (
    <div>
      <Link
        href="/dashboard/wallet"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <h1 className="mb-4 text-xl font-bold text-slate-900">
        Frequently Asked Questions
      </h1>

      <div className="space-y-3">
        {FAQS.map((item) => (
          <details
            key={item.q}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <summary className="cursor-pointer list-none px-4 py-3.5 text-[15px] font-semibold text-slate-900 marker:content-none">
              {item.q}
            </summary>
            <p className="border-t border-slate-100 px-4 py-3.5 text-sm font-medium leading-relaxed text-slate-800">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
