import Banner from '@/src/components-next/Banner';
import About from '@/src/components-next/About';
import Services from '@/src/components-next/Services';
import Contact from '@/src/components-next/Contact';

export default function Home() {
  return (
    <div>
      <Banner next="about" />
      <About id="about" next="services" />
      <Services id="services" next="contact" />
      <Contact id="contact" />
    </div>
  );
}
