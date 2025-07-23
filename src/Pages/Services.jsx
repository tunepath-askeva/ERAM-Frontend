import HomeFooter from "../Global/Footer";
import Header from "../Global/Header";
import { useState } from 'react';

const Services = () => {
  const [expandedService, setExpandedService] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const toggleService = (index) => {
    setExpandedService(expandedService === index ? null : index);
  };

  const services = [
    {
      title: "Bulk Recruitment Solutions",
      icon: "👥",
      description: "Our bulk hiring services provide end-to-end recruitment solutions for large-scale staffing needs across industries.",
      details: [
        "High-volume candidate sourcing from our global talent pool",
        "Customized screening and selection processes",
        "Streamlined onboarding and mobilization",
        "Compliance with local and international labor laws",
        "Dedicated account management for each client"
      ],
      industries: ["Oil & Gas", "Construction", "Healthcare", "Hospitality", "Manufacturing"]
    },
    {
      title: "Executive Search",
      icon: "👔",
      description: "Specialized recruitment for leadership and specialized positions requiring niche expertise.",
      details: [
        "Targeted search for C-level and senior management roles",
        "Discreet and confidential hiring process",
        "Competency-based assessment framework",
        "Global talent mapping for specialized roles",
        "Succession planning solutions"
      ]
    },
    {
      title: "Managed Workforce Services",
      icon: "🔄",
      description: "Comprehensive workforce management including payroll, benefits administration, and performance management.",
      details: [
        "End-to-end employment lifecycle management",
        "Payroll processing and administration",
        "Benefits and compensation management",
        "Performance monitoring and reporting",
        "Employee engagement programs"
      ]
    },
    {
      title: "Temporary Staffing",
      icon: "⏱️",
      description: "Flexible staffing solutions for project-based work, seasonal demands, and short-term assignments.",
      details: [
        "Rapid deployment of qualified personnel",
        "Short-term and contract staffing",
        "Specialized project teams",
        "Seasonal workforce solutions",
        "Temporary-to-permanent options"
      ]
    },
    {
      title: "Outsourcing Solutions",
      icon: "🌐",
      description: "Complete business process outsourcing for non-core functions to improve efficiency and reduce costs.",
      details: [
        "Department-level outsourcing (HR, IT, Admin)",
        "Process-specific outsourcing",
        "Offshore and nearshore solutions",
        "Transition and knowledge transfer support",
        "Continuous process improvement"
      ]
    },
    {
      title: "Workforce Consulting",
      icon: "📊",
      description: "Strategic advisory services to optimize your workforce planning and talent management strategies.",
      details: [
        "Workforce planning and analytics",
        "Organizational design consulting",
        "Talent acquisition strategy",
        "Employer branding solutions",
        "HR technology advisory"
      ]
    }
  ];

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="services-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Global Workforce Solutions</h1>
          <p>Comprehensive talent acquisition and management services across industries and borders</p>
        </div>
      </section>

      {/* Services Introduction */}
      <section className="services-intro">
        <div className="container">
          <div className="section-header">
            <h2>Our Comprehensive Services</h2>
            <p>ERAM Workforce specializes in bulk hiring and workforce management solutions tailored to your organizational needs. With our global network and local expertise, we connect you with the right talent anywhere in the world.</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card"
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}>
              <div className={`stat-icon ${hoveredCard === 1 ? 'animated' : ''}`}>📊</div>
              <h3>50,000+</h3>
              <p>Candidates placed annually</p>
              <div className="stat-underline"></div>
            </div>

            <div className="stat-card"
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}>
              <div className={`stat-icon ${hoveredCard === 2 ? 'animated' : ''}`}>🌎</div>
              <h3>35+</h3>
              <p>Countries we recruit from</p>
              <div className="stat-underline"></div>
            </div>

            <div className="stat-card"
              onMouseEnter={() => setHoveredCard(3)}
              onMouseLeave={() => setHoveredCard(null)}>
              <div className={`stat-icon ${hoveredCard === 3 ? 'animated' : ''}`}>🤝</div>
              <h3>200+</h3>
              <p>Global clients served</p>
              <div className="stat-underline"></div>
            </div>

            <div className="stat-card"
              onMouseEnter={() => setHoveredCard(4)}
              onMouseLeave={() => setHoveredCard(null)}>
              <div className={`stat-icon ${hoveredCard === 4 ? 'animated' : ''}`}>💯</div>
              <h3>95%</h3>
              <p>Client retention rate</p>
              <div className="stat-underline"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services Section */}
      <section className="main-services">
        <div className="container">
          <div className="services-grid">
            {services.map((service, index) => (
              <div
                className={`service-card ${expandedService === index ? 'expanded' : ''}`}
                key={index}
                onClick={() => toggleService(index)}
                onMouseEnter={() => setHoveredCard(index + 10)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`service-icon ${hoveredCard === index + 10 ? 'pulse' : ''}`}>
                  {service.icon}
                </div>
                <h3>{service.title}</h3>
                <p className="service-description">{service.description}</p>

                {expandedService === index && (
                  <div className="service-details">
                    <ul>
                      {service.details.map((detail, i) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                    {service.industries && (
                      <div className="industries">
                        <h4>Key Industries:</h4>
                        <div className="industry-tags">
                          {service.industries.map((industry, i) => (
                            <span key={i} className="industry-tag">{industry}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button className="toggle-btn">
                  {expandedService === index ? 'Show Less' : 'Learn More'}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d={expandedService === index ? "M19 13H5v-2h14v2z" : "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"} />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bulk Hiring Process */}
      <section className="process-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Bulk Hiring Process</h2>
            <p>Streamlined recruitment methodology designed for high-volume hiring needs</p>
          </div>

          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-icon">🔍</div>
              <h3>Requirement Analysis</h3>
              <p>Detailed understanding of your workforce needs, timelines, and specifications</p>
            </div>

            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-icon">👥</div>
              <h3>Talent Sourcing</h3>
              <p>Leveraging our global network and database to identify qualified candidates</p>
            </div>

            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-icon">📝</div>
              <h3>Screening & Assessment</h3>
              <p>Multi-stage evaluation including technical tests, interviews, and background checks</p>
            </div>

            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-icon">✅</div>
              <h3>Shortlisting</h3>
              <p>Presenting pre-qualified candidates matching your requirements</p>
            </div>

            <div className="process-step">
              <div className="step-number">5</div>
              <div className="step-icon">💼</div>
              <h3>Client Interviews</h3>
              <p>Coordinating final selection process as per your preferred methodology</p>
            </div>

            <div className="process-step">
              <div className="step-number">6</div>
              <div className="step-icon">🚀</div>
              <h3>Onboarding & Deployment</h3>
              <p>Comprehensive mobilization including documentation, training, and logistics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Specialization */}
      <section className="industries-section">
        <div className="container">
          <div className="section-header">
            <h2>Industry Specialization</h2>
            <p>We provide tailored workforce solutions for these key sectors</p>
          </div>

          <div className="industries-grid">
            <div className="industry-card">
              <div className="industry-icon">🛢️</div>
              <h3>Oil & Gas</h3>
              <p>From upstream to downstream operations, we provide skilled professionals for all segments</p>
              <div className="industry-overlay"></div>
            </div>

            <div className="industry-card">
              <div className="industry-icon">🏗️</div>
              <h3>Construction</h3>
              <p>Workforce solutions for mega projects and infrastructure development</p>
              <div className="industry-overlay"></div>
            </div>

            <div className="industry-card">
              <div className="industry-icon">🏥</div>
              <h3>Healthcare</h3>
              <p>Qualified medical professionals and support staff for healthcare facilities</p>
              <div className="industry-overlay"></div>
            </div>

            <div className="industry-card">
              <div className="industry-icon">🏨</div>
              <h3>Hospitality</h3>
              <p>Staffing solutions for hotels, resorts, and catering services</p>
              <div className="industry-overlay"></div>
            </div>

            <div className="industry-card">
              <div className="industry-icon">🏭</div>
              <h3>Manufacturing</h3>
              <p>Skilled technicians and operators for industrial production</p>
              <div className="industry-overlay"></div>
            </div>

            <div className="industry-card">
              <div className="industry-icon">🛒</div>
              <h3>Retail</h3>
              <p>Staffing solutions for retail chains and shopping complexes</p>
              <div className="industry-overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Reach */}
      <section className="global-reach">
        <div className="container">
          <div className="section-header">
            <h2>Our Global Recruitment Network</h2>
            <p>With recruitment centers across 3 continents, we source talent from the most qualified markets</p>
          </div>

          <div className="regions-container">
            <div className="region-card">
              <div className="region-icon">🌍</div>
              <h3>Middle East</h3>
              <p>Primary recruitment hub with direct access to GCC and Levant talent pools</p>
              <div className="region-dots">
                <span></span><span></span><span></span>
              </div>
            </div>

            <div className="region-card">
              <div className="region-icon">🌏</div>
              <h3>South Asia</h3>
              <p>Extensive network across India, Pakistan, Bangladesh, Nepal and Sri Lanka</p>
              <div className="region-dots">
                <span></span><span></span><span></span>
              </div>
            </div>

            <div className="region-card">
              <div className="region-icon">🌏</div>
              <h3>Southeast Asia</h3>
              <p>Strong presence in Philippines, Indonesia, Malaysia and Vietnam</p>
              <div className="region-dots">
                <span></span><span></span><span></span>
              </div>
            </div>

            <div className="region-card">
              <div className="region-icon">🌍</div>
              <h3>Africa</h3>
              <p>Strategic partnerships across North and East African countries</p>
              <div className="region-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="services-cta">
        <div className="container">
          <h2>Ready to Streamline Your Bulk Hiring?</h2>
          <p>Our HR specialists are ready to discuss your workforce requirements and develop a customized recruitment plan</p>
          <div className="cta-buttons">
            <a href="/contacts" className="cta-btn primary">
              Request a Consultation
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </a>
            <a href="tel:+966138493777" className="cta-btn secondary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
              </svg>
              Call Our HR Team
            </a>
          </div>
        </div>
      </section>

      <HomeFooter />

      {/* CSS Styles */}
      <style jsx>{`
        :root {
          --primary-color: #da2c46;
          --primary-dark: #b8233a;
          --primary-light: #ff4d6d;
          --text-dark: #333;
          --text-light: #666;
          --bg-light: #f8f9fa;
          --white: #fff;
          --black: #000;
          --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
          --shadow-md: 0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08);
          --shadow-lg: 0 10px 20px rgba(0,0,0,0.1), 0 6px 6px rgba(0,0,0,0.1);
          --shadow-hover: 0 14px 28px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.12);
        }

        /* Hero Section */
        .services-hero {
          position: relative;
          height: 80vh;
          min-height: 500px;
          background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
                      url('https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--white);
          padding: 0 20px;
          overflow: hidden;
        }
        
        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(218, 44, 70, 0.3) 0%, rgba(0, 0, 0, 0.8) 100%);
        }
        
        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          animation: fadeInUp 1s ease;
        }
        
        .hero-content h1 {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          line-height: 1.2;
        }
        
        .hero-content p {
          font-size: 1.5rem;
          max-width: 800px;
          margin: 0 auto 2rem;
          opacity: 0.9;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        /* Container */
        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        /* Section Header */
        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }
        
        .section-header h2 {
          font-size: 2.8rem;
          color: var(--text-dark);
          margin-bottom: 1.5rem;
          position: relative;
          display: inline-block;
        }
        
        .section-header h2:after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 4px;
          background: var(--primary-color);
          border-radius: 2px;
        }
        
        .section-header p {
          font-size: 1.2rem;
          color: var(--text-light);
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.6;
        }
        
        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2.5rem;
          margin: 4rem 0;
        }
        
        .stat-card {
          background: var(--white);
          padding: 2.5rem 2rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: var(--shadow-md);
          transition: var(--transition);
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        
        .stat-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-hover);
        }
        
        .stat-card:hover .stat-underline {
          width: 100%;
        }
        
        .stat-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          transition: var(--transition);
        }
        
        .stat-icon.animated {
          animation: pulse 1s infinite alternate;
        }
        
        .stat-card h3 {
          font-size: 2.8rem;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
          font-weight: 700;
        }
        
        .stat-card p {
          color: var(--text-light);
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }
        
        .stat-underline {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 4px;
          background: var(--primary-color);
          transition: var(--transition);
        }
        
        /* Services Grid */
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2.5rem;
        }
        
        .service-card {
          background: var(--white);
          border-radius: 12px;
          padding: 2.5rem;
          box-shadow: var(--shadow-md);
          cursor: pointer;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
          border: none;
        }
        
        .service-card:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 5px;
          background: var(--primary-color);
          transform: scaleX(0);
          transform-origin: left;
          transition: var(--transition);
        }
        
        .service-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-hover);
        }
        
        .service-card:hover:before {
          transform: scaleX(1);
        }
        
        .service-card.expanded {
          background: var(--bg-light);
          box-shadow: var(--shadow-lg);
        }
        
        .service-icon {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          transition: var(--transition);
          display: inline-block;
        }
        
        .service-icon.pulse {
          animation: pulse 1s infinite alternate;
        }
        
        .service-card h3 {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          color: var(--text-dark);
          position: relative;
          padding-bottom: 10px;
        }
        
        .service-card h3:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background: var(--primary-color);
          transition: var(--transition);
        }
        
        .service-card:hover h3:after {
          width: 80px;
        }
        
        .service-description {
          color: var(--text-light);
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        .service-details {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .service-details ul {
          list-style-type: none;
          padding-left: 0;
          margin-bottom: 2rem;
        }
        
        .service-details li {
          margin-bottom: 1rem;
          position: relative;
          padding-left: 2rem;
          line-height: 1.6;
        }
        
        .service-details li:before {
          content: '✓';
          color: var(--primary-color);
          position: absolute;
          left: 0;
          font-weight: bold;
        }
        
        .industries {
          margin-top: 2rem;
        }
        
        .industries h4 {
          margin-bottom: 1rem;
          font-size: 1.2rem;
          color: var(--text-dark);
        }
        
        .industry-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
        }
        
        .industry-tag {
          background: rgba(218, 44, 70, 0.1);
          color: var(--primary-dark);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          transition: var(--transition);
        }
        
        .industry-tag:hover {
          background: var(--primary-color);
          color: var(--white);
        }
        
        .toggle-btn {
          background: none;
          border: none;
          color: var(--primary-color);
          font-weight: 600;
          cursor: pointer;
          padding: 0.8rem 1.5rem;
          border-radius: 6px;
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .toggle-btn:hover {
          background: rgba(218, 44, 70, 0.1);
        }
        
        .toggle-btn svg {
          width: 18px;
          height: 18px;
          transition: var(--transition);
        }
        
        /* Process Steps */
        .process-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2.5rem;
          margin-top: 3rem;
        }
        
        .process-step {
          background: var(--white);
          padding: 2.5rem 2rem;
          border-radius: 12px;
          box-shadow: var(--shadow-md);
          position: relative;
          text-align: center;
          transition: var(--transition);
          z-index: 1;
          overflow: hidden;
        }
        
        .process-step:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-hover);
        }
        
        .process-step:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(218, 44, 70, 0.05) 0%, rgba(218, 44, 70, 0.01) 100%);
          z-index: -1;
        }
        
        .step-number {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 50px;
          background: var(--primary-color);
          color: var(--white);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.3rem;
          box-shadow: 0 4px 10px rgba(218, 44, 70, 0.3);
        }
        
        .step-icon {
          font-size: 3rem;
          margin: 1.5rem 0;
          color: var(--primary-color);
          display: inline-block;
          transition: var(--transition);
        }
        
        .process-step:hover .step-icon {
          transform: scale(1.1);
        }
        
        .process-step h3 {
          margin-top: 1rem;
          color: var(--text-dark);
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .process-step p {
          color: var(--text-light);
          margin-top: 0.8rem;
          line-height: 1.6;
        }
        
        /* Industries Grid */
        .industries-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2.5rem;
          margin-top: 3rem;
        }
        
        .industry-card {
          background: var(--white);
          padding: 2.5rem 2rem;
          border-radius: 12px;
          box-shadow: var(--shadow-md);
          text-align: center;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        
        .industry-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-hover);
        }
        
        .industry-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(218, 44, 70, 0.8) 0%, rgba(218, 44, 70, 0.4) 100%);
          opacity: 0;
          transition: var(--transition);
          z-index: -1;
        }
        
        .industry-card:hover .industry-overlay {
          opacity: 1;
        }
        
        .industry-card:hover h3,
        .industry-card:hover p {
          color: var(--white);
        }
        
        .industry-icon {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          transition: var(--transition);
        }
        
        .industry-card:hover .industry-icon {
          transform: scale(1.2);
        }
        
        .industry-card h3 {
          color: var(--text-dark);
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          transition: var(--transition);
        }
        
        .industry-card p {
          color: var(--text-light);
          line-height: 1.6;
          transition: var(--transition);
        }
        
        /* Global Reach */
        .regions-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2.5rem;
          margin-top: 3rem;
        }
        
        .region-card {
          background: var(--white);
          padding: 2.5rem 2rem;
          border-radius: 12px;
          box-shadow: var(--shadow-md);
          text-align: center;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        
        .region-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-hover);
        }
        
        .region-card:before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 5px;
          background: var(--primary-color);
          transform: scaleX(0);
          transform-origin: left;
          transition: var(--transition);
        }
        
        .region-card:hover:before {
          transform: scaleX(1);
        }
        
        .region-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          color: var(--primary-color);
          transition: var(--transition);
        }
        
        .region-card:hover .region-icon {
          transform: rotate(15deg) scale(1.2);
        }
        
        .region-card h3 {
          color: var(--text-dark);
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }
        
        .region-card p {
          color: var(--text-light);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        
        .region-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }
        
        .region-dots span {
          display: block;
          width: 8px;
          height: 8px;
          background: var(--primary-color);
          border-radius: 50%;
          opacity: 0.3;
          transition: var(--transition);
        }
        
        .region-card:hover .region-dots span {
          opacity: 1;
          transform: translateY(-5px);
        }
        
        .region-card:hover .region-dots span:nth-child(2) {
          transition-delay: 0.1s;
        }
        
        .region-card:hover .region-dots span:nth-child(3) {
          transition-delay: 0.2s;
        }
        
        /* CTA Section */
        .services-cta {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
          color: var(--white);
          padding: 6rem 0;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .services-cta:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        
        .services-cta h2 {
          font-size: 2.8rem;
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 2;
        }
        
        .services-cta p {
          font-size: 1.3rem;
          max-width: 700px;
          margin: 0 auto 3rem;
          opacity: 0.9;
          position: relative;
          z-index: 2;
        }
        
                .cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.1rem;
          text-decoration: none;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
          z-index: 1;
          min-width: 220px;
        }
        
        .cta-btn svg {
          width: 20px;
          height: 20px;
          margin-left: 10px;
          transition: var(--transition);
        }
        
        .cta-btn.primary {
          background: var(--white);
          color: var(--primary-color);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .cta-btn.primary:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .cta-btn.primary:hover svg {
          transform: translateX(5px);
        }
        
        .cta-btn.secondary {
          background: transparent;
          color: var(--white);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .cta-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--white);
          transform: translateY(-3px);
        }
        
        .cta-btn.secondary svg {
          margin-right: 10px;
          margin-left: 0;
        }
        
        .cta-btn.secondary:hover svg {
          transform: rotate(15deg);
        }
        
        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) translateX(-50%);
          }
          40% {
            transform: translateY(-20px) translateX(-50%);
          }
          60% {
            transform: translateY(-10px) translateX(-50%);
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.1);
          }
        }
        
        /* Responsive Styles */
        @media (max-width: 992px) {
          .hero-content h1 {
            font-size: 2.8rem;
          }
          
          .hero-content p {
            font-size: 1.3rem;
          }
          
          .section-header h2 {
            font-size: 2.3rem;
          }
        }
        
        @media (max-width: 768px) {
          .services-hero {
            height: 70vh;
          }
          
          .hero-content h1 {
            font-size: 2.3rem;
          }
          
          .hero-content p {
            font-size: 1.1rem;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
          
          .services-grid {
            grid-template-columns: 1fr;
          }
          
          .cta-buttons {
            flex-direction: column;
            gap: 1rem;
          }
          
          .cta-btn {
            width: 100%;
          }
        }
        
        @media (max-width: 576px) {
          .services-hero {
            height: 60vh;
            min-height: 400px;
          }
          
          .hero-content h1 {
            font-size: 2rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .section-header h2 {
            font-size: 2rem;
          }
          
          .services-cta h2 {
            font-size: 2rem;
          }
          
          .services-cta p {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </>
  );
};

export default Services;