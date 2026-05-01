import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { WhatWeAre } from "@/components/landing/WhatWeAre";
import { Team } from "@/components/landing/Team";
import { Projects } from "@/components/landing/Projects";
import { Quote } from "@/components/landing/Quote";
import { Footer } from "@/components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <main>
        <Hero />
        <WhatWeAre />
        <Team />
        <Projects />
        <Quote />
      </main>
      <Footer />
    </div>
  );
}