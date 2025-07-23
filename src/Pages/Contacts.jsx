import { useState } from 'react';
import HomeFooter from "../Global/Footer";
import Header from "../Global/Header";

const Contacts = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to a server
    setModalContent('Thank you for contacting ERAM Workforce! Our HR team will respond to your inquiry within 24-48 hours.');
    setIsModalOpen(true);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Header />
      
      {/* Hero Section with Background */}
      <section className="contact-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Contact ERAM Workforce</h1>
          <p>Connecting talent with opportunity across the globe</p>
        </div>
      </section>

      {/* Get in Touch Section */}
      <section className="contact-section">
        <div className="container">
          <div className="section-header">
            <h2>Human Resource Inquiry</h2>
            <p>Whether you're looking for career opportunities or need HR support, our team is here to help.</p>
          </div>
          
          <div className="contact-grid">
            <div className="contact-info">
              <div className="info-card">
                <h3>HR Department Hours</h3>
                <p>Sunday - Thursday: 8:00 AM to 5:00 PM (AST)</p>
                <p>Friday - Saturday: Closed</p>
              </div>
              
              <div className="info-card">
                <h3>Career Opportunities</h3>
                <p>For job applications, please visit our careers portal or email your CV to careers@eramworkforce.com</p>
              </div>
              
              <div className="info-card emergency-contact">
                <h3>Emergency Contact</h3>
                <p>For urgent HR matters outside business hours:</p>
                <p><strong>+966-13-8493 888</strong></p>
              </div>
            </div>
            
            <div className="contact-form">
              <form onSubmit={handleSubmit}>
                <div className="form-group name-group">
                  <div className="input-field">
                    <label htmlFor="firstName">First Name</label>
                    <input 
                      type="text" 
                      id="firstName"
                      name="firstName" 
                      placeholder="Enter your first name" 
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-field">
                    <label htmlFor="lastName">Last Name</label>
                    <input 
                      type="text" 
                      id="lastName"
                      name="lastName" 
                      placeholder="Enter your last name" 
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <div className="input-field">
                    <label htmlFor="email">Email Address</label>
                    <input 
                      type="email" 
                      id="email"
                      name="email" 
                      placeholder="Enter your email address" 
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <div className="input-field">
                    <label htmlFor="phone">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone"
                      name="phone" 
                      placeholder="Enter your phone number" 
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <div className="input-field">
                    <label htmlFor="subject">Subject</label>
                    <select 
                      id="subject"
                      name="subject" 
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select inquiry type</option>
                      <option value="career">Career Opportunities</option>
                      <option value="employee">Employee Support</option>
                      <option value="client">Client Services</option>
                      <option value="general">General Inquiry</option>
                      <option value="feedback">Feedback/Suggestions</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <div className="input-field">
                    <label htmlFor="message">Your Message</label>
                    <textarea 
                      id="message"
                      name="message" 
                      placeholder="Please describe your inquiry in detail" 
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                </div>
                
                <div className="form-group consent-group">
                  <input 
                    type="checkbox" 
                    id="consent"
                    name="consent" 
                    required
                  />
                  <label htmlFor="consent">I agree to ERAM Workforce's Privacy Policy and consent to my data being processed.</label>
                </div>
                
                <button type="submit" className="submit-btn">
                  SEND MESSAGE
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Global Presence Section */}
      <section className="global-presence">
        <div className="container">
          <div className="section-header">
            <h2>Our Global Workforce Network</h2>
            <p>With offices and recruitment centers across 3 continents, we connect talent with opportunities worldwide.</p>
          </div>
          
          <div className="regions-container">
            <div className="region-card">
              <h3>Middle East</h3>
              <ul>
                <li>Saudi Arabia (Headquarters)</li>
                <li>United Arab Emirates</li>
                <li>Qatar</li>
                <li>Oman</li>
                <li>Kuwait</li>
                <li>Bahrain</li>
              </ul>
            </div>
            
            <div className="region-card">
              <h3>Asia</h3>
              <ul>
                <li>India</li>
                <li>Pakistan</li>
                <li>Philippines</li>
                <li>Bangladesh</li>
                <li>Nepal</li>
                <li>Sri Lanka</li>
              </ul>
            </div>
            
            <div className="region-card">
              <h3>Africa</h3>
              <ul>
                <li>Egypt</li>
                <li>Sudan</li>
                <li>Ethiopia</li>
                <li>Kenya</li>
                <li>Tanzania</li>
                <li>Mozambique</li>
              </ul>
            </div>
            
            <div className="region-card">
              <h3>International</h3>
              <ul>
                <li>United Kingdom</li>
                <li>United States</li>
                <li>Canada</li>
                <li>Australia</li>
              </ul>
            </div>
          </div>
          
          <div className="main-office">
            <h3>Global Headquarters</h3>
            <p>Al Khobar Business Gate Tower "A", 5th Floor King Faisal Bin Abdulaziz Road, PB No 76629 Al-Khobar 31952, Kingdom of Saudi Arabia</p>
          </div>
        </div>
      </section>

      {/* Contact Cards Section */}
      <section className="contact-cards">
        <div className="container">
          <div className="cards-grid">
            <div className="contact-card">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <h3>Visit Us</h3>
              <p>Al Khobar Business Gate Tower "A", 5th Floor, Al-Khobar 31952, Saudi Arabia</p>
              <p><strong>Reception Hours:</strong> 8:00 AM - 5:00 PM (AST)</p>
            </div>
            
            <div className="contact-card">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>
              </div>
              <h3>Call Us</h3>
              <p><strong>HR Main Line:</strong> +966-13-8493 777</p>
              <p><strong>Recruitment:</strong> +966-13-8493 778</p>
              <p><strong>Fax:</strong> +966-13-8496 010</p>
            </div>
            
            <div className="contact-card">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <h3>Email Us</h3>
              <p><strong>General Inquiries:</strong> info@eramworkforce.com</p>
              <p><strong>HR Support:</strong> hr@eramworkforce.com</p>
              <p><strong>Recruitment:</strong> careers@eramworkforce.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section - Full Width */}
      <section className="map-section">
        <div className="map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3570.052261724148!2d50.20031531502997!3d26.28446998344295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49e6d8f5f7c3b1%3A0x3e9a1c7b1b1b1b1b!2sAl%20Khobar%20Business%20Gate%20Tower%20A!5e0!3m2!1sen!2ssa!4v1620000000000!5m2!1sen!2ssa" 
            width="100%" 
            height="100%" 
            style={{border:0}} 
            allowFullScreen="" 
            loading="lazy"
            title="ERAM Workforce Headquarters Location"
          ></iframe>
        </div>
      </section>

      {/* HR Team Section */}
      <section className="hr-team">
        <div className="container">
          <div className="section-header">
            <h2>Our HR Leadership Team</h2>
            <p>Meet the professionals dedicated to supporting our workforce community</p>
          </div>
          
          <div className="team-grid">
            <div className="team-member">
              <div className="member-photo"></div>
              <h3>Ahmed Al-Mansour</h3>
              <p>Chief Human Resources Officer</p>
              <p>ahmed.mansour@eramworkforce.com</p>
            </div>
            
            <div className="team-member">
              <div className="member-photo"></div>
              <h3>Sarah Johnson</h3>
              <p>Director of Global Recruitment</p>
              <p>sarah.johnson@eramworkforce.com</p>
            </div>
            
            <div className="team-member">
              <div className="member-photo"></div>
              <h3>Raj Patel</h3>
              <p>Employee Relations Manager</p>
              <p>raj.patel@eramworkforce.com</p>
            </div>
            
            <div className="team-member">
              <div className="member-photo"></div>
              <h3>Fatima Al-Hashimi</h3>
              <p>Talent Development Specialist</p>
              <p>fatima.hashimi@eramworkforce.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              &times;
            </button>
            <div className="modal-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3>Message Received!</h3>
            <p>{modalContent}</p>
            <button className="modal-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}

      <HomeFooter />
    </>
  );
}

export default Contacts;