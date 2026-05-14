import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Play, Rocket, Users, Trophy, Globe2, GraduationCap } from "lucide-react";
import { Starfield } from "./Starfield";
import { NebulaLayer } from "./NebulaLayer";
import { MouseSpotlight } from "./MouseSpotlight";

import { FloatingStat } from "./FloatingStat";
import { OrbitSystem } from "./OrbitSystem";

export function SpaceHero() {
  return (
    <section className="relative min-h-[100vh] w-full overflow-hidden bg-gradient-space">
      {/* layered background */}
      <NebulaLayer />
      <Starfield />
      <MouseSpotlight />
      <div aria-hidden className="pointer-events-none absolute inset-0 noise-overlay" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-background"
      />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-12 px-4 pt-28 pb-24 text-center sm:px-6 lg:pt-32">
        {/* TOP — orbit system */}
        <motion.div
          className="relative flex w-full items-center justify-center"
        >
          <div className="w-full max-w-[600px]">
            <OrbitSystem />
          </div>

          {/* floating glass code chips */}
          <div className="glass-strong neon-border absolute bottom-4 left-2 hidden rounded-xl px-3 py-2 text-[11px] font-mono text-primary-glow shadow-neon-purple md:block">
            <span className="text-muted-foreground">$</span> ai.create(<span className="text-gradient">"future"</span>)
          </div>
          <div className="glass-strong absolute right-2 top-4 hidden rounded-xl px-3 py-2 text-[11px] font-mono text-[oklch(0.85_0.16_230)] shadow-neon-blue md:block">
            <span className="text-muted-foreground">{"// "}</span>vibe coding
          </div>
        </motion.div>

        {/* BELOW — text content */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.span
            className="glass-strong inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-primary-glow"
          >
            <Rocket className="h-3.5 w-3.5" /> Future of AI Learning
          </motion.span>

          <motion.h1
            className="mt-5 font-display text-3xl font-bold leading-[1.15] sm:text-5xl xl:text-6xl"
          >
            <span className="block">
              Learn <span className="text-gradient glow-text">AI</span> & Build{" "}
              <span className="text-gradient glow-text">Digital Products</span>
            </span>
            <span className="block">
              For The <span className="text-gradient glow-text">Future</span>
            </span>
          </motion.h1>

          <motion.div
            className="mt-5 inline-flex items-center gap-2 rounded-full glass-strong px-4 py-2 shadow-neon-purple"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-primary-glow">
              Mission
            </span>
            <span className="h-3 w-px bg-white/20" />
            <span className="font-display text-sm font-semibold sm:text-base">
              Teach AI to <span className="text-gradient glow-text">1M</span> People
            </span>
          </motion.div>

          <motion.p
            className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg"
          >
            Helping creators, freelancers, and students master AI, websites, and digital business
            through futuristic learning experiences. শুরু করুন আজই —{" "}
            <b className="text-foreground">CoachRony</b>-এর সাথে।
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <Link
              to="/free-class"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-background shadow-neon-purple transition hover:-translate-y-0.5"
            >
              Start Learning
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/portfolio"
              className="glass-strong neon-border inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5"
            >
              <Play className="h-4 w-4" /> Watch Demo
            </Link>
          </motion.div>

          {/* floating stats */}
          <div className="mt-12 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            <FloatingStat
              value="10K+"
              label="Students"
              icon={<Users className="h-4 w-4" />}
              delay={0.1}
            />
            <FloatingStat
              value="5K+"
              label="Projects"
              icon={<GraduationCap className="h-4 w-4" />}
              delay={0.25}
            />
            <FloatingStat
              value="98%"
              label="Success Rate"
              icon={<Trophy className="h-4 w-4" />}
              delay={0.4}
            />
            <FloatingStat
              value="50+"
              label="Countries"
              icon={<Globe2 className="h-4 w-4" />}
              delay={0.55}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
