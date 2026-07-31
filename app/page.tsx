import SmoothScroll from "@/components/ui/SmoothScroll";
import Intro from "@/components/ui/Intro";
import GlobalCanvas from "@/components/three/GlobalCanvas";
import SceneBackground from "@/components/three/SceneBackground";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Cursor from "@/components/ui/Cursor";
import Nav from "@/components/ui/Nav";
import Hero from "@/components/ui/Hero";
import Projects from "@/components/ui/Projects";
import Experience from "@/components/ui/Experience";
import Upcoming from "@/components/ui/Upcoming";
import About from "@/components/ui/About";
import Gallery from "@/components/ui/Gallery";
import Skills from "@/components/ui/Skills";
import Contact from "@/components/ui/Contact";
import Footer from "@/components/ui/Footer";

export default function Home() {
  return (
    <>
      <Intro />
      <SmoothScroll />
      <GlobalCanvas />
      <SceneBackground />
      <ScrollProgress />
      <Cursor />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <Projects />
        <Experience />
        <Upcoming />
        <About />
        <Gallery />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
