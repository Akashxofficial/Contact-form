import ContactForm from "./components/ContactForm.jsx";

export default function App() {
  return (
    <>
      <header className="top-navbar">
        <div className="navbar-inner">
          <div className="navbar-brand-group">
            <img
              src="/images/urbangaon-logo.jpg"
              alt="UrbanGaon — a perfect balance"
              className="navbar-logo-urbangaon"
            />
            <span className="navbar-divider" aria-hidden="true" />
            <div className="navbar-subtitle">
              <span className="navbar-title-text">
                Customer Enquiry &amp; Advisory Form
              </span>
              <span className="navbar-caption-text">
                Official real estate enquiry &amp; lead qualification portal
              </span>
            </div>
          </div>

          <div className="navbar-right">
            <div className="navbar-axio-card">
              <img
                src="/images/axio-logo.jpg"
                alt="AXIO — An asset with the Class."
                className="navbar-logo-axio"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="page-shell">
        <section className="contact-grid" aria-label="Contact Us">
          <div className="contact-info">
            <h1 className="contact-heading">CONTACT US</h1>

            <div className="info-block">
              <span className="info-label">EMAIL</span>
              <a
                className="info-value"
                href="mailto:yudhister.tiwari@urbangaon.com"
              >
                yudhister.tiwari@urbangaon.com
              </a>
            </div>

            <div className="info-block">
              <span className="info-label">CONTACT</span>
              <p className="info-value">+91-9251836284 | 0141-6763064</p>
            </div>

            <div className="info-block">
              <span className="info-label">ADDRESS</span>
              <p className="info-value">
                UrbanGaon, 2nd Floor, 74A, Sawai Pratap Singh Road, Near CM
                House, Opp. Loharu House, Gaurav Nagar, Civil Lines, Jaipur,
                PIN: 302006, Rajasthan, India
              </p>
            </div>

            <div className="info-block">
              <span className="info-label">ADVISORY HOURS</span>
              <p className="info-value">Mon – Sat · 9:00 AM – 6:30 PM</p>
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </section>
      </main>
    </>
  );
}
