
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';

const PrivacyPolicyPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-20">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold font-headline mb-8">Privacy Policy</h1>
          <div className="prose max-w-none">
            <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <h2 className="text-2xl font-bold mt-8">1. Introduction</h2>
            <p>
              Welcome to VE LIVE. We are committed to protecting your privacy. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you visit our website.
            </p>

            <h2 className="text-2xl font-bold mt-8">2. Information We Collect</h2>
            <p>
              We may collect personal information from you such as your name, email address, phone number, and any other information you voluntarily provide to us when you fill out a contact form or subscribe to our newsletter.
            </p>

            <h2 className="text-2xl font-bold mt-8">3. Use of Your Information</h2>
            <p>
              We may use the information we collect from you to:
              <ul>
                <li>- Provide, operate, and maintain our website</li>
                <li>- Improve, personalize, and expand our website</li>
                <li>- Understand and analyze how you use our website</li>
                <li>- Develop new products, services, features, and functionality</li>
                <li>- Communicate with you, either directly or through one of our partners</li>
                <li>- Send you emails</li>
                <li>- Find and prevent fraud</li>
              </ul>
            </p>

            <h2 className="text-2xl font-bold mt-8">4. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>

            <h2 className="text-2xl font-bold mt-8">5. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
              <br />
              Email: info@velive.co.uk
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
