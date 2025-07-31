
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { ContactHero } from '@/components/contact/hero';
import { ContactDetails } from '@/components/contact/contact-details';

const ContactPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main>
        <ContactHero />
        <ContactDetails />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
