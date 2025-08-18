import HomeFooter from "../Global/Footer";
import Header from "../Global/Header";
import { useState, useEffect } from 'react';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Slider images and content
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      title: "Global Workforce Solutions",
      subtitle: "Connecting talent with opportunity across borders"
    },
    {
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      title: "Bulk Recruitment Experts",
      subtitle: "Efficient large-scale staffing solutions for your business"
    },
    {
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      title: "HR Management Solutions",
      subtitle: "Streamlining your human resource processes"
    },
    {
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      title: "Industry Specialists",
      subtitle: "Tailored workforce solutions for your sector"
    },
    {
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      title: "24/7 Support Team",
      subtitle: "Always available to meet your workforce needs"
    }
  ];

  // Auto slide change
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Why Choose Us cards
  const whyChooseUs = [
    {
      title: "Excellent Global Database",
      icon: "🌐",
      description: "Access to over 500,000 pre-screened candidates across 35+ countries"
    },
    {
      title: "Right Mix of Nationalities",
      icon: "👥",
      description: "Diverse workforce solutions tailored to your cultural requirements"
    },
    {
      title: "Equipped to Meet Any Requirements",
      icon: "🛠️",
      description: "From temporary staff to complete department outsourcing"
    },
    {
      title: "Cost Effective Solutions",
      icon: "💰",
      description: "Optimized recruitment processes that reduce your hiring costs"
    },
    {
      title: "Spread in 12 Countries",
      icon: "📍",
      description: "Local expertise with global reach for your international needs"
    },
    {
      title: "24x7 Support Team",
      icon: "🕒",
      description: "Round-the-clock assistance for your urgent staffing requirements"
    }
  ];

  return (
    <>
      <Header />

      <section className="hero-slider">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="slide-overlay"></div>
            <div className="slide-content">
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>
              <div className="slider-buttons">
                <a href="/services" className="slider-btn primary">
                  Explore Services
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                </a>
                <a href="/contacts" className="slider-btn secondary">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Add arrow navigation */}
        <button
          className="slider-arrow left"
          onClick={() => setCurrentSlide(prev => prev === 0 ? slides.length - 1 : prev - 1)}
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
          </svg>
        </button>

        <button
          className="slider-arrow right"
          onClick={() => setCurrentSlide(prev => prev === slides.length - 1 ? 0 : prev + 1)}
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </button>

        <div className="slider-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Chairman's Desk Section */}
      <section className="chairman-section">
        <div className="container">
          <div className="section-header">
            <h2>From the Chairman's Desk</h2>
            <p>We believe that the strength of every company, large or small</p>
            <div className="header-underline"></div>
          </div>

          <div className="chairman-content">
            <div className="chairman-image">
              <div className="image-frame"></div>
            </div>
            <div className="chairman-message">
              <h3>Greetings!</h3>
              <p>We believe that the strength of every company, large or small, is directly proportional to the quality and efficiency of its employees. Such values have helped us to level up as one of the most dependable service providers in the global workforce solutions sector.</p>
              <p>At ERAM Workforce, we are meticulous about providing our recruits with advanced skill and personal development training prior to mobilizing them to clients. Our rigorous screening processes ensure that only the most qualified candidates join your organization.</p>
              <p>With over 15 years of experience in bulk recruitment and workforce management across multiple industries, we've developed methodologies that deliver results while maintaining the highest ethical standards.</p>
              <p>We thank you for your patronage in the past and look forward to being at your service always as we continue to innovate and expand our global reach.</p>
              <div className="signature">
                <p>Yours sincerely,</p>
                <h4>ERAM Workforce Leadership</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="services-preview">
        <div className="container">
          <div className="section-header">
            <h2>Our Comprehensive Services</h2>
            <p>ERAM Workforce specializes in bulk hiring and workforce management solutions tailored to your organizational needs</p>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">👥</div>
              <h3>Bulk Recruitment</h3>
              <p>End-to-end recruitment solutions for large-scale staffing needs across industries</p>
              <a href="/services" className="service-link">
                Learn More
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                </svg>
              </a>
            </div>

            <div className="service-card">
              <div className="service-icon">👔</div>
              <h3>Executive Search</h3>
              <p>Specialized recruitment for leadership and specialized positions requiring niche expertise</p>
              <a href="/services" className="service-link">
                Learn More
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                </svg>
              </a>
            </div>

            <div className="service-card">
              <div className="service-icon">🔄</div>
              <h3>Managed Workforce</h3>
              <p>Comprehensive workforce management including payroll and benefits administration</p>
              <a href="/services" className="service-link">
                Learn More
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="section-cta">
            <a href="/services" className="cta-btn">
              View All Services
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
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

      {/* Vision & Mission Section */}
      <section className="vision-mission">
        <div className="container">
          <div className="section-header">
            <h2>Vision, Mission & Core Values</h2>
            <p>The foundation of our commitment to excellence in workforce solutions</p>
          </div>

          <div className="vm-grid">
            <div className="vm-card vision">
              <div className="vm-icon">🔭</div>
              <h3>Our Vision</h3>
              <p>To spread our business reach globally with facilitating services that sustain unique value propositions for our clients. We aim to be the most trusted workforce solutions partner across all industries we serve.</p>
            </div>

            <div className="vm-card mission">
              <div className="vm-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>To get our teamwork, technology, performance and innovation converge to assure results that exceed customer satisfaction. We commit to delivering exceptional value through our comprehensive workforce solutions.</p>
            </div>

            <div className="vm-card values">
              <div className="vm-icon">❤️</div>
              <h3>Core Values</h3>
              <ul>
                <li><strong>Result-yielding teamwork:</strong> Collaborative approach that delivers measurable outcomes</li>
                <li><strong>Entrepreneurial outlook:</strong> Innovative thinking and proactive problem-solving</li>
                <li><strong>Social commitment:</strong> Ethical practices and community responsibility</li>
                <li><strong>Customer loyalty:</strong> Building long-term partnerships based on trust</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose ERAM Workforce?</h2>
            <p>What sets us apart in the competitive world of workforce solutions</p>
          </div>

          <div className="wcu-grid">
            {whyChooseUs.map((item, index) => (
              <div
                className="wcu-card"
                key={index}
                onMouseEnter={() => setHoveredCard(index + 10)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`wcu-icon ${hoveredCard === index + 10 ? 'animated' : ''}`}>
                  {item.icon}
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-cta">
        <div className="container">
          <h2>Ready to Transform Your Workforce Strategy?</h2>
          <p>Our HR specialists are ready to discuss your requirements and develop a customized solution</p>
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

        /* Hero Slider */
        .hero-slider {
          position: relative;
          height: 90vh;
          min-height: 600px;
          overflow: hidden;
        }
        
        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0;
          transition: opacity 1s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--white);
        }
        
        .slide.active {
          opacity: 1;
          z-index: 1;
        }
        
        .slide-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(218, 44, 70, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%);
        }
        
        .slide-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          padding: 0 20px;
          animation: fadeInUp 1s ease;
        }
        
        .slide-content h1 {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          line-height: 1.2;
        }
        
        .slide-content p {
          font-size: 1.5rem;
          max-width: 800px;
          margin: 0 auto 2rem;
          opacity: 0.9;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .slider-buttons {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 2rem;
        }
        
        .slider-btn {
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
          min-width: 180px;
        }
        
        .slider-btn svg {
          width: 20px;
          height: 20px;
          margin-left: 10px;
          transition: var(--transition);
        }
        
        .slider-btn.primary {
          background: var(--primary-color);
          color: var(--white);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .slider-btn.primary:hover {
          background: var(--primary-dark);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        
        .slider-btn.primary:hover svg {
          transform: translateX(5px);
        }
        
        .slider-btn.secondary {
          background: transparent;
          color: var(--white);
          border: 2px solid rgba(255, 255, 255, 0.5);
        }
        
        .slider-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--white);
          transform: translateY(-3px);
        }
        
        .slider-dots {
          position: absolute;
          bottom: 30px;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          gap: 10px;
          z-index: 2;
        }
        
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          border: none;
          cursor: pointer;
          transition: var(--transition);
          padding: 0;
        }
        
        .dot.active {
          background: var(--primary-color);
          transform: scale(1.2);
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
        
        .header-underline {
          width: 100px;
          height: 4px;
          background: var(--primary-color);
          margin: 1.5rem auto;
          border-radius: 2px;
        }
        
        /* Chairman's Section */
        .chairman-section {
          padding: 6rem 0;
          background: var(--bg-light);
        }
        
        .chairman-content {
          display: flex;
          align-items: center;
          gap: 4rem;
          margin-top: 3rem;
        }
        
        .chairman-image {
          flex: 1;
          position: relative;
          min-height: 400px;
          background: url('https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80') center/cover;
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
        }
        
        .image-frame {
          position: absolute;
          top: -20px;
          left: -20px;
          width: 100%;
          height: 100%;
          border: 3px solid var(--primary-color);
          border-radius: 12px;
          z-index: -1;
        }
        
        .chairman-message {
          flex: 1;
        }
        
        .chairman-message h3 {
          font-size: 2rem;
          color: var(--primary-color);
          margin-bottom: 1.5rem;
        }
        
        .chairman-message p {
          color: var(--text-light);
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }
        
        .signature {
          margin-top: 2rem;
        }
        
        .signature p {
          margin-bottom: 0.5rem;
          font-style: italic;
        }
        
        .signature h4 {
          color: var(--primary-color);
          font-size: 1.3rem;
        }
        
        /* Services Preview */
        .services-preview {
          padding: 6rem 0;
          background: var(--white);
        }
        
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2.5rem;
          margin: 3rem 0;
        }
        
        .service-card {
          background: var(--white);
          border-radius: 12px;
          padding: 2.5rem;
          box-shadow: var(--shadow-md);
          transition: var(--transition);
          position: relative;
          overflow: hidden;
          text-align: center;
        }
        
        .service-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-hover);
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
        
        .service-card:hover:before {
          transform: scaleX(1);
        }
        
        .service-icon {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          transition: var(--transition);
          display: inline-block;
        }
        
        .service-card:hover .service-icon {
          transform: scale(1.1);
          color: var(--primary-color);
        }
        
        .service-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: var(--text-dark);
        }
        
        .service-card p {
          color: var(--text-light);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        
        .service-link {
          display: inline-flex;
          align-items: center;
          color: var(--primary-color);
          font-weight: 600;
          text-decoration: none;
          transition: var(--transition);
        }
        
        .service-link svg {
          width: 18px;
          height: 18px;
          margin-left: 8px;
          transition: var(--transition);
        }
        
        .service-link:hover {
          color: var(--primary-dark);
        }
        
        .service-link:hover svg {
          transform: translateX(5px);
        }
        
        .section-cta {
          text-align: center;
          margin-top: 3rem;
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
          background: var(--primary-color);
          color: var(--white);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .cta-btn svg {
          width: 20px;
          height: 20px;
          margin-left: 10px;
          transition: var(--transition);
        }
        
        .cta-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .cta-btn:hover svg {
          transform: translateX(5px);
        }
        
        /* Stats Section */
        .stats-section {
          padding: 6rem 0;
          background: linear-gradient(135deg, rgba(218, 44, 70, 0.05) 0%, rgba(218, 44, 70, 0.01) 100%);
        }
        
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
        
        /* Vision & Mission */
        .vision-mission {
          padding: 6rem 0;
          background: var(--white);
        }
        
        .vm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2.5rem;
          margin-top: 3rem;
        }
        
        .vm-card {
          background: var(--white);
          padding: 2.5rem 2rem;
          border-radius: 12px;
          box-shadow: var(--shadow-md);
          transition: var(--transition);
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        
        .vm-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-hover);
        }
        
        .vm-card:before {
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
        
        .vm-card:hover:before {
          transform: scaleX(1);
        }
        
        .vm-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          color: var(--primary-color);
          transition: var(--transition);
        }
        
        .vm-card:hover .vm-icon {
          transform: scale(1.2);
        }
        
        .vm-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: var(--text-dark);
        }
        
        .vm-card p, .vm-card li {
          color: var(--text-light);
          line-height: 1.8;
          margin-bottom: 1rem;
        }
        
        .vm-card ul {
          list-style-type: none;
          padding-left: 0;
        }
        
        .vm-card li {
          position: relative;
          padding-left: 2rem;
          margin-bottom: 1rem;
        }
        
        .vm-card li:before {
          content: '•';
          color: var(--primary-color);
          position: absolute;
          left: 0;
          font-weight: bold;
          font-size: 1.5rem;
          line-height: 1;
        }
        
        /* Why Choose Us */
        .why-choose-us {
          padding: 6rem 0;
          background: var(--bg-light);
        }
        
        .wcu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2.5rem;
          margin-top: 3rem;
        }
        
        .wcu-card {
          background: var(--white);
          padding: 2.5rem 2rem;
          border-radius: 12px;
          box-shadow: var(--shadow-md);
          transition: var(--transition);
          text-align: center;
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        
        .wcu-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-hover);
        }
        
        .wcu-card:before {
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
        
        .wcu-card:hover:before {
          transform: scaleX(1);
        }
        
        .wcu-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          color: var(--primary-color);
          transition: var(--transition);
          display: inline-block;
        }
        
        .wcu-icon.animated {
          animation: pulse 1s infinite alternate;
        }
        
        .wcu-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: var(--text-dark);
        }
        
        .wcu-card p {
          color: var(--text-light);
          line-height: 1.6;
        }
        
        /* CTA Section */
        .home-cta {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
          color: var(--white);
          padding: 6rem 0;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .home-cta:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        
        .home-cta h2 {
          font-size: 2.8rem;
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 2;
        }
        
        .home-cta p {
          font-size: 1.3rem;
          max-width: 700px;
          margin: 0 auto 3rem;
          opacity: 0.9;
          position: relative;
          z-index: 2;
        }
        
        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          position: relative;
          z-index: 2;
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
          .hero-slider {
            height: 80vh;
            min-height: 500px;
          }
          
          .slide-content h1 {
            font-size: 2.8rem;
          }
          
          .slide-content p {
            font-size: 1.3rem;
          }
          
          .chairman-content {
            flex-direction: column;
          }
          
          .chairman-image {
            min-height: 300px;
            width: 100%;
          }
          
          .section-header h2 {
            font-size: 2.3rem;
          }
        }
        
        @media (max-width: 768px) {
          .hero-slider {
            height: 70vh;
            min-height: 450px;
          }
          
          .slide-content h1 {
            font-size: 2.3rem;
          }
          
          .slide-content p {
            font-size: 1.1rem;
          }
          
          .slider-buttons {
            flex-direction: column;
            gap: 1rem;
          }
          
          .slider-btn {
            width: 100%;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
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
          .hero-slider {
            height: 60vh;
            min-height: 400px;
          }
          
          .slide-content h1 {
            font-size: 2rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .section-header h2 {
            font-size: 2rem;
          }
          
          .home-cta h2 {
            font-size: 2rem;
          }
          
          .home-cta p {
            font-size: 1.1rem;
          }

          /* Slider Arrows - Base Styles */
.slider-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  opacity: 0.7;
}

.slider-arrow:hover {
  background: rgba(255, 255, 255, 0.3);
  opacity: 1;
}

.slider-arrow svg {
  width: 24px;
  height: 24px;
  transition: var(--transition);
}

.slider-arrow.left {
  left: 30px;
}

.slider-arrow.right {
  right: 30px;
}

/* XX-Large devices (1400px and up) - Default size */

/* Large devices (1200px to 1399px) */
@media (max-width: 1399.98px) {
  .slider-arrow {
    width: 48px;
    height: 48px;
  }
  
  .slider-arrow svg {
    width: 22px;
    height: 22px;
  }
  
  .slider-arrow.left {
    left: 25px;
  }
  
  .slider-arrow.right {
    right: 25px;
  }
}

/* Medium devices (992px to 1199px) */
@media (max-width: 1199.98px) {
  .slider-arrow {
    width: 45px;
    height: 45px;
  }
  
  .slider-arrow svg {
    width: 20px;
    height: 20px;
  }
  
  .slider-arrow.left {
    left: 20px;
  }
  
  .slider-arrow.right {
    right: 20px;
  }
}

/* Small devices (768px to 991px) */
@media (max-width: 991.98px) {
  .slider-arrow {
    width: 42px;
    height: 42px;
    font-size: 1.3rem;
  }
  
  .slider-arrow svg {
    width: 18px;
    height: 18px;
  }
  
  .slider-arrow.left {
    left: 18px;
  }
  
  .slider-arrow.right {
    right: 18px;
  }
}

/* Mobile devices (576px to 767px) */
@media (max-width: 767.98px) {
  .slider-arrow {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
  
  .slider-arrow svg {
    width: 16px;
    height: 16px;
  }
  
  .slider-arrow.left {
    left: 15px;
  }
  
  .slider-arrow.right {
    right: 15px;
  }
}

/* Extra small devices (below 576px) */
@media (max-width: 575.98px) {
  .slider-arrow {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }
  
  .slider-arrow svg {
    width: 14px;
    height: 14px;
  }
  
  .slider-arrow.left {
    left: 10px;
  }
  
  .slider-arrow.right {
    right: 10px;
  }
  
  .slider-arrow:hover {
    background: rgba(255, 255, 255, 0.25); /* Slightly less prominent hover on small devices */
  }
}
        }
      `}</style>
    </>
  );
};

export default Home;