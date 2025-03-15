"use client";

import { ChevronRight, ShoppingBag, HeadphonesIcon, UsersRound, Share2, Megaphone, BarChart3, Zap } from "lucide-react";
import Link from "next/link";
import Header from "@/components/header_main_site";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-yapa-light text-yapa-dark dark:bg-yapa-dark dark:text-white transition-colors duration-300">
      <Header />
      <main id="main-content">
        {/* Hero Section */}
        <header className="container mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Transform African Business with AI-Powered Customer Experience
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
              Yapa Hub delivers intelligent, culturally-aware solutions tailored for African markets, enabling businesses to provide exceptional customer experiences across commerce, support, and engagement channels.
            </p>
            <div className="flex justify-center">
              <Link
                href="/contact"
                className="group px-8 py-4 bg-[#FF4500] text-white rounded-lg font-semibold hover:bg-[#E63F00] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:ring-offset-2 focus:ring-offset-[#020220]"
                aria-label="Join our waitlist"
              >
                Join Waitlist 
                <ChevronRight className="inline-block ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </header>

        {/* Solutions Grid */}
        <section className="container mx-auto px-4 sm:px-6 py-16" aria-labelledby="solutions-heading">
          <h2 id="solutions-heading" className="sr-only">Our Solutions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShoppingBag className="h-8 w-8 text-[#FF4500]" />}
              title="Commerce Platform"
              description="AI-powered commerce solution optimized for African markets. Supports local payment methods, mobile money, and seamless integration with popular marketplaces."
              benefits={[
                "Mobile-first checkout experience",
                "Integration with M-Pesa, MTN Mobile Money",
                "Multi-currency support for African markets",
                "Offline-capable point of sale"
              ]}
            />
            <FeatureCard
              icon={<HeadphonesIcon className="h-8 w-8 text-[#FF4500]" />}
              title="Intelligent Contact Centre"
              description="Multilingual customer support solution designed for African businesses. AI-powered routing and automation in local languages."
              benefits={[
                "Support in Swahili, Amharic, Yoruba & more",
                "Smart routing based on language & expertise",
                "40% reduction in response time",
                "Voice & text support optimized for low bandwidth"
              ]}
            />
            <FeatureCard
              icon={<UsersRound className="h-8 w-8 text-[#FF4500]" />}
              title="Smart Contact Management"
              description="Comprehensive customer data platform that helps understand and serve African consumers better through AI-driven insights."
              benefits={[
                "Regional customer behavior analytics",
                "Demographic & cultural insights",
                "Purchase pattern analysis",
                "Personalized engagement recommendations"
              ]}
            />
            <FeatureCard
              icon={<Share2 className="h-8 w-8 text-[#FF4500]" />}
              title="Social Media Integration"
              description="Unified social media management tailored for platforms popular in Africa. Seamless integration with WhatsApp Business & more."
              benefits={[
                "WhatsApp Business API integration",
                "Facebook & Instagram Shops",
                "TikTok Shop integration",
                "Unified social inbox"
              ]}
            />
            <FeatureCard
              icon={<Megaphone className="h-8 w-8 text-[#FF4500]" />}
              title="Marketing Automation"
              description="AI-powered marketing tools designed for African audiences. Create culturally relevant campaigns that drive engagement."
              benefits={[
                "Local language content optimization",
                "Cultural event targeting",
                "Regional market segmentation",
                "Mobile-first campaign tools"
              ]}
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-[#FF4500]" />}
              title="Business Impact"
              description="Proven results for African businesses across multiple sectors, delivering measurable improvements in customer engagement."
              benefits={[
                "45% increase in customer retention",
                "60% faster customer response times",
                "3x increase in social media engagement",
                "50% reduction in operational costs"
              ]}
            />
          </div>
        </section>

        {/* Success Stories */}
        <section className="bg-[#020220]/50 py-16" aria-labelledby="success-heading">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 id="success-heading" className="text-3xl font-bold mb-4">Trusted Across Africa</h2>
              <p className="text-gray-300">Empowering businesses from Cairo to Cape Town</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 py-24" aria-labelledby="cta-heading">
          <div className="bg-[#FF4500] rounded-2xl p-8 sm:p-12 text-center">
            <h2 id="cta-heading" className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your African Business?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Join leading African companies already using Yapa Hub to deliver exceptional customer experiences. Be among the first to experience the future of customer engagement.
            </p>
            <Link
              href="/contact"
              className="group inline-flex items-center px-8 py-4 bg-white text-[#FF4500] rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#FF4500]"
              aria-label="Join our waitlist"
            >
              Join Waitlist <Zap className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10" role="contentinfo">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Yapa Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, benefits }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-xl border border-white/10 hover:border-[#FF4500]/50 transition-colors duration-200 bg-white/5 backdrop-blur-sm focus-within:ring-2 focus-within:ring-[#FF4500]/50">
      <div className="mb-4" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-300 mb-4">{description}</p>
      <ul className="space-y-2" role="list">
        {benefits.map((benefit, index) => (
          <li key={index} className="text-gray-400 text-sm flex items-center">
            <ChevronRight className="h-4 w-4 text-[#FF4500] mr-2 flex-shrink-0" aria-hidden="true" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}