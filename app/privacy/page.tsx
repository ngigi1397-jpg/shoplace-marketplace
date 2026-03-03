"use client";

export default function PrivacyPolicyPage() {
  return (
    <>
      <style>{css}</style>
      <div className="page">
        <nav className="sp-nav">
          <a href="/" className="sp-logo">Sho<span>place</span></a>
          <a href="/" className="btn-ghost">← Back to Home</a>
        </nav>

        <div className="doc-wrap">
          <div className="doc-header">
            <div className="doc-badge">Legal</div>
            <h1>Privacy Policy</h1>
            <p>Last updated: March 2026</p>
          </div>

          <div className="doc-body">

            <p className="intro">
              Shoplace is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and protect your personal
              information when you use our website at shoplace.co.ke and related services.
            </p>

            <h2>1. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <h3>Information you provide to us:</h3>
            <ul>
              <li>Full name, email address, and phone number when you create an account</li>
              <li>County and constituency for location-based services</li>
              <li>Shop details including shop name, description, category, and address</li>
              <li>Product and service listings you create</li>
              <li>Profile photos and product images you upload</li>
            </ul>
            <h3>Information collected automatically:</h3>
            <ul>
              <li>Device type and browser information</li>
              <li>Pages you visit and features you use on Shoplace</li>
              <li>IP address and general location data</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Create and manage your Shoplace account</li>
              <li>Display your shop, products, and services to buyers</li>
              <li>Connect buyers and sellers across Kenya</li>
              <li>Send important account notifications and updates</li>
              <li>Improve our platform and user experience</li>
              <li>Prevent fraud and ensure platform safety</li>
              <li>Comply with legal obligations</li>
              <li>Display relevant advertisements through Google AdSense</li>
            </ul>

            <h2>3. Information We Share</h2>
            <p>
              We do not sell your personal information to third parties. We may share
              your information in the following limited circumstances:
            </p>
            <ul>
              <li><strong>Publicly visible information:</strong> Your shop name, products, services, county, and contact details you provide are visible to other Shoplace users</li>
              <li><strong>Service providers:</strong> We use Supabase for data storage and Google services for authentication and advertising</li>
              <li><strong>Legal requirements:</strong> We may disclose information if required by law or to protect the rights and safety of our users</li>
              <li><strong>Business transfer:</strong> In the event of a merger or acquisition, your information may be transferred</li>
            </ul>

            <h2>4. Google AdSense and Advertising</h2>
            <p>
              Shoplace uses Google AdSense to display advertisements. Google may use
              cookies and similar technologies to show you relevant ads based on your
              browsing history and interests. You can opt out of personalized advertising
              by visiting <a href="https://adssettings.google.com" target="_blank">adssettings.google.com</a>.
            </p>
            <p>
              Google's use of advertising cookies enables it and its partners to serve
              ads based on your visits to Shoplace and other websites on the internet.
            </p>

            <h2>5. Cookies</h2>
            <p>
              We use cookies to keep you logged in, remember your preferences, and
              improve your experience. We also use Google Analytics cookies to understand
              how visitors use our site. You can control cookies through your browser settings,
              but disabling cookies may affect some features of Shoplace.
            </p>

            <h2>6. Data Security</h2>
            <p>
              We take reasonable steps to protect your personal information from
              unauthorized access, loss, or misuse. Your account is protected by a
              password, and we use industry-standard encryption for data transmission.
              However, no internet transmission is 100% secure, and we cannot guarantee
              absolute security.
            </p>

            <h2>7. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active
              or as needed to provide our services. If you delete your account, we will
              delete your personal information within 30 days, except where we are
              required to retain it for legal purposes.
            </p>

            <h2>8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your account and personal data</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data in a portable format</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacyshoplace@gmail.com">privacy@shoplace.co.ke</a>.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Shoplace is not intended for children under the age of 18. We do not
              knowingly collect personal information from minors. If you believe a
              child has provided us with personal information, please contact us
              and we will delete it promptly.
            </p>

            <h2>10. Third-Party Links</h2>
            <p>
              Shoplace may contain links to external websites including seller social
              media pages and WhatsApp. We are not responsible for the privacy practices
              of these third-party sites and encourage you to review their privacy policies.
            </p>

            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you
              of significant changes by posting a notice on our website or sending an
              email to your registered address. Your continued use of Shoplace after
              changes constitutes acceptance of the updated policy.
            </p>

            <h2>12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or how we handle
              your data, please contact us:
            </p>
            <div className="contact-box">
              <div>📧 <a href="mailto:privacyshoplace@gmail.com">privacy@shoplace.co.ke</a></div>
              <div>🌐 shoplace.co.ke</div>
              <div>📍 Kenya</div>
            </div>

          </div>

          <div className="doc-footer">
            <a href="/terms" className="doc-link">Terms of Service →</a>
            <a href="/" className="doc-link">Back to Shoplace →</a>
          </div>
        </div>
      </div>
    </>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
:root{--ink:#0d0d0d;--cream:#f5f0e8;--rust:#c84b31;--sage:#3d6b4f;--border:rgba(13,13,13,0.1);}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink);}
a{text-decoration:none;color:var(--rust);}
a:hover{text-decoration:underline;}
.sp-nav{position:fixed;top:0;width:100%;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1rem 4rem;background:rgba(245,240,232,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);}
.sp-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1.5rem;letter-spacing:-0.04em;color:var(--ink);text-decoration:none;}
.sp-logo span{color:var(--rust);}
.btn-ghost{padding:0.45rem 1rem;border:1.5px solid rgba(13,13,13,0.25);border-radius:100px;font-size:0.82rem;font-weight:500;color:var(--ink);background:transparent;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;text-decoration:none;}
.btn-ghost:hover{background:var(--ink);color:var(--cream);text-decoration:none;}
.page{min-height:100vh;background:var(--cream);}
.doc-wrap{max-width:760px;margin:0 auto;padding:6rem 2rem 4rem;}
.doc-header{margin-bottom:3rem;padding-bottom:2rem;border-bottom:1px solid var(--border);}
.doc-badge{display:inline-flex;padding:0.25rem 0.8rem;background:rgba(200,75,49,0.08);border:1px solid rgba(200,75,49,0.15);border-radius:100px;font-size:0.72rem;font-weight:700;color:var(--rust);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1rem;}
.doc-header h1{font-family:'Syne',sans-serif;font-size:2.2rem;font-weight:800;letter-spacing:-0.03em;margin-bottom:0.5rem;}
.doc-header p{font-size:0.83rem;color:rgba(13,13,13,0.38);}
.doc-body{line-height:1.8;}
.intro{font-size:0.95rem;color:rgba(13,13,13,0.65);line-height:1.8;margin-bottom:2rem;padding:1.2rem 1.5rem;background:white;border-radius:12px;border-left:3px solid var(--rust);}
.doc-body h2{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:800;margin-top:2.2rem;margin-bottom:0.8rem;color:var(--ink);}
.doc-body h3{font-size:0.88rem;font-weight:600;margin-top:1rem;margin-bottom:0.5rem;color:rgba(13,13,13,0.7);}
.doc-body p{font-size:0.88rem;color:rgba(13,13,13,0.62);line-height:1.8;margin-bottom:0.8rem;}
.doc-body ul{margin:0.5rem 0 1rem 1.5rem;display:flex;flex-direction:column;gap:0.4rem;}
.doc-body ul li{font-size:0.87rem;color:rgba(13,13,13,0.58);line-height:1.7;}
.doc-body strong{color:var(--ink);font-weight:600;}
.contact-box{background:white;border-radius:12px;padding:1.2rem 1.5rem;border:1px solid var(--border);display:flex;flex-direction:column;gap:0.5rem;margin-top:0.8rem;}
.contact-box div{font-size:0.87rem;color:rgba(13,13,13,0.6);}
.doc-footer{margin-top:3rem;padding-top:2rem;border-top:1px solid var(--border);display:flex;gap:1.5rem;}
.doc-link{font-size:0.85rem;font-weight:600;color:var(--rust);}
@media(max-width:768px){.sp-nav{padding:1rem 1.5rem;}.doc-wrap{padding:5rem 1.5rem 3rem;}}
`;
