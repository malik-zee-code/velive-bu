
'use client';

export const ContactHero = () => {
  return (
    <section className="relative py-20 md:py-32 bg-card text-card-foreground" style={{
      backgroundImage: 'url(/assets/images/banners/contact_us.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="absolute inset-0 bg-black/70" />
      <div className="container relative mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-white mb-4">
            Contact <span className="text-primary">Us</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80">
            We'd love to hear from you. Get in touch with us for any inquiries or feedback.
          </p>
        </div>
      </div>
    </section>
  );
};
