import HomeFooter from "../Global/Footer";
import Header from "../Global/Header";
import { useState, useMemo } from 'react';

// Move static data outside the component
const GLOBAL_LOCATIONS = [
  { country: "Saudi Arabia", cities: ["Riyadh", "Jeddah", "Dammam"], coordinates: [24.7136, 46.6753] },
  { country: "UAE", cities: ["Dubai", "Abu Dhabi"], coordinates: [25.2048, 55.2708] },
  { country: "Qatar", cities: ["Doha"], coordinates: [25.2769, 51.5200] },
  { country: "Kuwait", cities: ["Kuwait City"], coordinates: [29.3759, 47.9774] },
  { country: "Oman", cities: ["Muscat"], coordinates: [23.5880, 58.3829] },
  { country: "India", cities: ["Mumbai", "Delhi", "Bangalore"], coordinates: [20.5937, 78.9629] },
  { country: "Pakistan", cities: ["Karachi", "Lahore"], coordinates: [30.3753, 69.3451] },
  { country: "Philippines", cities: ["Manila"], coordinates: [12.8797, 121.7740] },
  { country: "UK", cities: ["London"], coordinates: [55.3781, -3.4360] },
  { country: "USA", cities: ["Houston", "New York"], coordinates: [37.0902, -95.7129] },
];

const LEADERSHIP_TEAM = [
  {
    name: "John Smith",
    position: "Chairman & CEO",
    bio: "With over 25 years of experience in human capital management, John founded ERAM Workforce with a vision to revolutionize global recruitment.",
  },
  {
    name: "Sarah Johnson",
    position: "Chief Operating Officer",
    bio: "Sarah oversees all operational aspects of ERAM Workforce, ensuring seamless service delivery across all our global offices.",
  },
  {
    name: "Michael Chen",
    position: "Director of Global Recruitment",
    bio: "Michael leads our international recruitment teams, specializing in cross-border talent acquisition strategies.",
  },
  {
    name: "Aisha Al-Mansoori",
    position: "Middle East Regional Director",
    bio: "Aisha manages our operations across the GCC, bringing deep expertise in the regional labor markets.",
  }
];

const INDUSTRIES = [
  { name: "Oil & Gas", icon: "🛢️" },
  { name: "Construction", icon: "🏗️" },
  { name: "Power & Energy", icon: "⚡" },
  { name: "Healthcare", icon: "🏥" },
  { name: "Information Technology", icon: "💻" },
  { name: "Manufacturing", icon: "🏭" }
];

const CULTURE = [
  { title: "Collaborative", icon: "🤝", description: "We believe in teamwork across borders and departments to deliver exceptional results." },
  { title: "Innovative", icon: "🚀", description: "Constantly evolving our methods to stay ahead in the dynamic HR landscape." },
  { title: "Global Mindset", icon: "🌍", description: "We think globally while acting locally to serve our diverse client base." },
  { title: "Solution-Oriented", icon: "💡", description: "Focused on delivering practical, effective solutions to complex HR challenges." }
];

const VALUES = [
  { title: "Integrity", icon: "🤝", description: "We conduct all our business with the highest ethical standards, ensuring transparency and honesty in every interaction." },
  { title: "Excellence", icon: "🎯", description: "We strive for the highest quality in all our services, continuously improving to exceed client expectations." },
  { title: "Global Perspective", icon: "🌍", description: "We embrace cultural diversity and leverage our international presence to deliver world-class solutions." },
  { title: "Commitment", icon: "❤️", description: "We stand by our promises and are dedicated to the long-term success of our clients and candidates." },
  { title: "Innovation", icon: "💡", description: "We constantly seek new and better ways to solve workforce challenges through technology and creativity." },
  { title: "Partnership", icon: "👥", description: "We view our relationships as true partnerships, working collaboratively to achieve shared goals." }
];

const About = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [hoveredCard, setHoveredCard] = useState(null);

  // Memoize the data to prevent unnecessary re-renders
  const globalLocations = useMemo(() => GLOBAL_LOCATIONS, []);
  const leadershipTeam = useMemo(() => LEADERSHIP_TEAM, []);
  const industries = useMemo(() => INDUSTRIES, []);
  const culture = useMemo(() => CULTURE, []);
  const values = useMemo(() => VALUES, []);

  return (
    <>
      <head>
        <title>About ERAM Workforce | Global HR Solutions Provider</title>
        <meta name="description" content="Learn about ERAM Workforce - a leading global human capital management company providing comprehensive recruitment and workforce solutions across multiple industries." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <Header />

      {/* Hero Section */}
      <section className="about-hero" aria-labelledby="hero-heading">
        <div className="container">
          <div className="hero-content">
            <h1 id="hero-heading">About ERAM Workforce</h1>
            <p>Global human capital solutions with local expertise</p>
          </div>
        </div>
      </section>

      {/* About Tabs Navigation */}
      <nav className="about-tabs" aria-label="About page sections">
        <div className="container">
          <ul role="tablist">
            <li
              role="tab"
              aria-selected={activeTab === 'about'}
              className={activeTab === 'about' ? 'active' : ''}
              onClick={() => setActiveTab('about')}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveTab('about')}
            >
              About Us
            </li>
            <li
              role="tab"
              aria-selected={activeTab === 'global'}
              className={activeTab === 'global' ? 'active' : ''}
              onClick={() => setActiveTab('global')}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveTab('global')}
            >
              Global Presence
            </li>
            <li
              role="tab"
              aria-selected={activeTab === 'leadership'}
              className={activeTab === 'leadership' ? 'active' : ''}
              onClick={() => setActiveTab('leadership')}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveTab('leadership')}
            >
              Leadership
            </li>
            <li
              role="tab"
              aria-selected={activeTab === 'values'}
              className={activeTab === 'values' ? 'active' : ''}
              onClick={() => setActiveTab('values')}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveTab('values')}
            >
              Our Values
            </li>
          </ul>
        </div>
      </nav>

      {/* Tab Content */}
      <div className="tab-content">
        {/* About Us Section */}
        {activeTab === 'about' && (
          <section className="about-section" aria-labelledby="about-heading">
            <div className="container">
              <div className="section-header">
                <h2 id="about-heading">Our Story</h2>
                <p>ERAM Workforce is an independent Human Capital Management company</p>
                <div className="header-underline"></div>
              </div>

              <div className="about-content">
                <div className="about-text">
                  <p>ERAM Workforce is an independent Human Capital Management company with global expertise in providing end-to-end recruitment solutions to clients across diverse industries including Oil & Gas, Petrochemicals, Power, Water, Infrastructure, Healthcare, IT, and more.</p>

                  <p>Based in the Kingdom of Saudi Arabia, we cater to requirements where we are able to provide manpower that is carefully headhunted by a dedicated team of Talent Acquisition Specialists on a global scale which includes regions such as but not limited to the Middle East, Asia, Europe, Far East, Africa, Caucasian, etc.</p>

                  <p>As such, we provide global mobility services for our clients with a quick turnaround time backed with the support of our affiliates at strategic locations on an international level.</p>

                  <div className="about-stats">
                    {[
                      { value: "15+", label: "Years of Experience" },
                      { value: "35+", label: "Countries Served" },
                      { value: "500K+", label: "Candidates in Database" },
                      { value: "200+", label: "Global Clients" }
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="stat-item"
                        onMouseEnter={() => setHoveredCard(index + 1)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <h3>{stat.value}</h3>
                        <p>{stat.label}</p>
                        <div className={`stat-underline ${hoveredCard === index + 1 ? 'animated' : ''}`}></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="about-image">
                  <div className="image-frame">
                    <img
                      src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                      alt="ERAM Workforce team working together"
                      width={600}
                      height={400}
                      priority
                    />
                  </div>
                </div>
              </div>

              <div className="industries-section" aria-labelledby="industries-heading">
                <h3 id="industries-heading">Industries We Serve</h3>
                <div className="industries-grid">
                  {industries.map((industry, index) => (
                    <div
                      key={index}
                      className="industry-card"
                      onMouseEnter={() => setHoveredCard(index + 10)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className={`industry-icon ${hoveredCard === index + 10 ? 'animated' : ''}`} aria-hidden="true">{industry.icon}</div>
                      <h4>{industry.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Global Presence Section */}
        {activeTab === 'global' && (
          <section className="global-section" aria-labelledby="global-heading">
            <div className="container">
              <div className="section-header">
                <h2 id="global-heading">Our Global Presence</h2>
                <p>Strategically located offices and affiliates across key global markets</p>
                <div className="header-underline"></div>
              </div>

              <div className="global-content">
                <div className="map-container">
                  <div className="world-map">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1200px-World_map_-_low_resolution.svg.png"
                      alt="World map showing ERAM Workforce locations"
                      width={1200}
                      height={600}
                    />
                    {globalLocations.map((location, index) => (
                      <div
                        key={index}
                        className="map-marker"
                        style={{
                          left: `${((location.coordinates[1] + 180) / 360) * 100}%`,
                          top: `${((90 - location.coordinates[0]) / 180) * 100}%`
                        }}
                        aria-label={`${location.country} locations: ${location.cities.join(', ')}`}
                      >
                        <div className="marker-dot"></div>
                        <div className="marker-tooltip">
                          <h4>{location.country}</h4>
                          <ul>
                            {location.cities.map((city, i) => (
                              <li key={i}>{city}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="locations-list" aria-labelledby="locations-heading">
                  <h3 id="locations-heading">Our Key Locations</h3>
                  <div className="locations-grid">
                    {globalLocations.map((location, index) => (
                      <div
                        key={index}
                        className="location-card"
                        onMouseEnter={() => setHoveredCard(index + 20)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <h4>{location.country}</h4>
                        <ul>
                          {location.cities.map((city, i) => (
                            <li key={i}>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                              </svg>
                              {city}
                            </li>
                          ))}
                        </ul>
                        <div className={`card-underline ${hoveredCard === index + 20 ? 'animated' : ''}`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Leadership Section */}
        {activeTab === 'leadership' && (
          <section className="leadership-section" aria-labelledby="leadership-heading">
            <div className="container">
              <div className="section-header">
                <h2 id="leadership-heading">Our Leadership Team</h2>
                <p>The experienced professionals guiding ERAM Workforce's global success</p>
                <div className="header-underline"></div>
              </div>

              <div className="leadership-grid">
                {leadershipTeam.map((member, index) => (
                  <div
                    key={index}
                    className="leader-card"
                    onMouseEnter={() => setHoveredCard(index + 30)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="leader-image">
                      <img
                        src={member.image}
                        alt={`Portrait of ${member.name}, ${member.position}`}
                        width={334}
                        height={334}
                      />
                      <div className="image-overlay"></div>
                    </div>
                    <div className="leader-info">
                      <h3>{member.name}</h3>
                      <p className="position">{member.position}</p>
                      <p className="bio">{member.bio}</p>
                    </div>
                    <div className={`leader-underline ${hoveredCard === index + 30 ? 'animated' : ''}`}></div>
                  </div>
                ))}
              </div>

              <div className="culture-section" aria-labelledby="culture-heading">
                <h3 id="culture-heading">Our Company Culture</h3>
                <div className="culture-grid">
                  {culture.map((item, index) => (
                    <div
                      key={index}
                      className="culture-card"
                      onMouseEnter={() => setHoveredCard(index + 40)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className={`culture-icon ${hoveredCard === index + 40 ? 'animated' : ''}`} aria-hidden="true">{item.icon}</div>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Values Section */}
        {activeTab === 'values' && (
          <section className="values-section" aria-labelledby="values-heading">
            <div className="container">
              <div className="section-header">
                <h2 id="values-heading">Our Core Values</h2>
                <p>The principles that guide every decision we make at ERAM Workforce</p>
                <div className="header-underline"></div>
              </div>

              <div className="values-grid">
                {values.map((value, index) => (
                  <div
                    key={index}
                    className="value-card"
                    onMouseEnter={() => setHoveredCard(index + 50)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className={`value-icon ${hoveredCard === index + 50 ? 'animated' : ''}`} aria-hidden="true">{value.icon}</div>
                    <h3>{value.title}</h3>
                    <p>{value.description}</p>
                  </div>
                ))}
              </div>

              <div className="mission-vision">
                <div className="mv-card vision">
                  <h3>Our Vision</h3>
                  <p>To be the most trusted global workforce solutions provider, recognized for our ability to connect exceptional talent with transformative opportunities across borders and industries.</p>
                </div>
                <div className="mv-card mission">
                  <h3>Our Mission</h3>
                  <p>To deliver comprehensive, innovative, and ethical human capital solutions that empower organizations to thrive and individuals to achieve their professional aspirations.</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* CTA Section */}
      <section className="about-cta" aria-labelledby="cta-heading">
        <div className="container">
          <h2 id="cta-heading">Ready to Partner with ERAM Workforce?</h2>
          <p>Our team is ready to discuss your workforce needs and develop customized solutions for your organization.</p>
          <div className="cta-buttons">
            <a href="/contacts" className="cta-btn primary" aria-label="Contact our team">
              Contact Our Team
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </a>
            <a href="/services" className="cta-btn secondary" aria-label="Explore our services">
              Explore Our Services
            </a>
          </div>
        </div>
      </section>

      <HomeFooter />
      <style jsx>{`
        :root {
          /* Colors */
          --primary-color: #da2c46;
          --primary-dark: #b8233a;
          --primary-light: #ff4d6d;
          --text-dark: #333;
          --text-light: #666;
          --bg-light: #f8f9fa;
          --white: #fff;
          --black: #000;
          
          /* Spacing */
          --space-xs: 0.5rem;
          --space-sm: 1rem;
          --space-md: 1.5rem;
          --space-lg: 2rem;
          --space-xl: 3rem;
          
          /* Shadows */
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
          --shadow-md: 0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08);
          --shadow-lg: 0 10px 20px rgba(0,0,0,0.1), 0 6px 6px rgba(0,0,0,0.1);
          --shadow-hover: 0 14px 28px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.12);
          
          /* Transitions */
          --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        
        /* Base Styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        
        /* Hero Section */
        .about-hero {
          background: linear-gradient(135deg, rgba(218, 44, 70, 0.9) 0%, rgba(0, 0, 0, 0.9) 100%), 
                      url('https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
          background-size: cover;
          background-position: center;
          padding: 8rem 0;
          color: var(--white);
          text-align: center;
          position: relative;
        }
        
        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .about-hero h1 {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }
        
        .about-hero p {
          font-size: 1.5rem;
          opacity: 0.9;
        }
        
        /* Tabs Navigation */
        .about-tabs {
          background: var(--white);
          box-shadow: var(--shadow-sm);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .about-tabs ul {
          display: flex;
          list-style: none;
          justify-content: center;
          margin: 0;
          padding: 0;
        }
        
        .about-tabs li {
          padding: 1.5rem 2rem;
          cursor: pointer;
          font-weight: 600;
          color: var(--text-light);
          transition: var(--transition);
          position: relative;
        }
        
        .about-tabs li:hover {
          color: var(--primary-color);
        }
        
        .about-tabs li.active {
          color: var(--primary-color);
        }
        
        .about-tabs li.active:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: var(--primary-color);
        }
        
        /* Tab Content Sections */
        .tab-content {
          padding: 5rem 0;
        }
        
        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }
        
        .section-header h2 {
          font-size: 2.8rem;
          color: var(--text-dark);
          margin-bottom: 1.5rem;
        }
        
        .section-header p {
          font-size: 1.2rem;
          color: var(--text-light);
          max-width: 700px;
          margin: 0 auto;
        }
        
        .header-underline {
          width: 80px;
          height: 4px;
          background: var(--primary-color);
          margin: 1.5rem auto;
          border-radius: 2px;
        }
        
        /* About Us Section */
        .about-content {
          display: flex;
          gap: 4rem;
          margin-bottom: 5rem;
        }
        
        .about-text {
          flex: 1;
        }
        
        .about-text p {
          color: var(--text-light);
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }
        
        .about-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }
        
        .stat-item {
          text-align: center;
          padding: 1.5rem;
          background: var(--white);
          border-radius: 8px;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
          position: relative;
        }
        
        .stat-item:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }
        
        .stat-item h3 {
          font-size: 2.5rem;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }
        
        .stat-item p {
          font-size: 1rem;
          margin-bottom: 0;
        }
        
        .stat-underline {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 3px;
          background: var(--primary-color);
          transition: var(--transition);
        }
        
        .stat-underline.animated {
          width: 50px;
        }
        
        .about-image {
          flex: 1;
          position: relative;
        }
        
        .image-frame {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          transition: var(--transition);
        }
        
        .image-frame:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-hover);
        }
        
        .image-frame img {
          width: 100%;
          height: auto;
          display: block;
        }
        
        /* Industries Section */
        .industries-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }
        
        .industry-card {
          background: var(--white);
          padding: 2rem 1rem;
          border-radius: 8px;
          text-align: center;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }
        
        .industry-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }
        
        .industry-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          transition: var(--transition);
        }
        
        .industry-icon.animated {
          animation: pulse 1s infinite alternate;
        }
        
        .industry-card h4 {
          font-size: 1.1rem;
          color: var(--text-dark);
        }
        
        /* Global Presence Section */
        .map-container {
          position: relative;
          margin-bottom: 4rem;
        }
        
        .world-map {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }
        
        .world-map img {
          width: 100%;
          height: auto;
          display: block;
        }
        
        .map-marker {
          position: absolute;
          transform: translate(-50%, -50%);
          cursor: pointer;
          z-index: 2;
        }
        
        .marker-dot {
          width: 12px;
          height: 12px;
          background: var(--primary-color);
          border-radius: 50%;
          border: 2px solid var(--white);
          box-shadow: 0 0 0 2px var(--primary-color);
          transition: var(--transition);
        }
        
        .map-marker:hover .marker-dot {
          transform: scale(1.5);
        }
        
        .marker-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--white);
          padding: 1rem;
          border-radius: 8px;
          box-shadow: var(--shadow-md);
          width: 200px;
          opacity: 0;
          visibility: hidden;
          transition: var(--transition);
          margin-bottom: 1rem;
        }
        
        .map-marker:hover .marker-tooltip {
          opacity: 1;
          visibility: visible;
          margin-bottom: 1.5rem;
        }
        
        .marker-tooltip h4 {
          color: var(--primary-color);
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }
        
        .marker-tooltip ul {
          list-style: none;
        }
        
        .marker-tooltip li {
          color: var(--text-light);
          font-size: 0.9rem;
          padding: 0.2rem 0;
        }
        
        .locations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }
        
        .location-card {
          background: var(--white);
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
          position: relative;
        }
        
        .location-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }
        
        .location-card h4 {
          color: var(--primary-color);
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }
        
        .location-card ul {
          list-style: none;
        }
        
        .location-card li {
          display: flex;
          align-items: center;
          color: var(--text-light);
          margin-bottom: 0.5rem;
        }
        
        .location-card svg {
          width: 16px;
          height: 16px;
          margin-right: 0.5rem;
          color: var(--primary-color);
        }
        
        .card-underline {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 3px;
          background: var(--primary-color);
          transition: var(--transition);
        }
        
        .card-underline.animated {
          width: 50px;
        }
        
        /* Leadership Section */
        .leadership-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 3rem;
          margin-bottom: 5rem;
        }
        
        .leader-card {
          background: var(--white);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-md);
          transition: var(--transition);
          position: relative;
        }
        
        .leader-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-hover);
        }
        
        .leader-image {
          position: relative;
          height: 300px;
          overflow: hidden;
        }
        
        .leader-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition);
        }
        
        .leader-card:hover .leader-image img {
          transform: scale(1.05);
        }
        
        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%);
        }
        
        .leader-info {
          padding: 1.5rem;
        }
        
        .leader-info h3 {
          color: var(--text-dark);
          margin-bottom: 0.5rem;
        }
        
        .leader-info .position {
          color: var(--primary-color);
          font-weight: 600;
          margin-bottom: 1rem;
        }
        
        .leader-info .bio {
          color: var(--text-light);
          line-height: 1.6;
        }
        
        .leader-underline {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 3px;
          background: var(--primary-color);
          transition: var(--transition);
        }
        
        .leader-underline.animated {
          width: 100px;
        }
        
        /* Culture Section */
        .culture-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }
        
        .culture-card {
          background: var(--white);
          padding: 2rem 1.5rem;
          border-radius: 8px;
          text-align: center;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }
        
        .culture-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }
        
        .culture-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          transition: var(--transition);
        }
        
        .culture-icon.animated {
          animation: pulse 1s infinite alternate;
        }
        
        .culture-card h4 {
          color: var(--text-dark);
          margin-bottom: 1rem;
        }
        
        .culture-card p {
          color: var(--text-light);
          font-size: 0.9rem;
          line-height: 1.6;
        }
        
        /* Values Section */
        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 5rem;
        }
        
        .value-card {
          background: var(--white);
          padding: 2rem;
          border-radius: 8px;
          text-align: center;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }
        
        .value-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }
        
        .value-icon {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          transition: var(--transition);
        }
        
        .value-icon.animated {
          animation: pulse 1s infinite alternate;
        }
        
        .value-card h3 {
          color: var(--text-dark);
          margin-bottom: 1rem;
        }
        
        .value-card p {
          color: var(--text-light);
          line-height: 1.6;
        }
        
        .mission-vision {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
}

.mv-card {
  padding: 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.mv-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.mv-card.vision {
  background: linear-gradient(135deg, rgba(218, 44, 70, 0.1) 0%, rgba(218, 44, 70, 0.05) 100%);
  border-left: 4px solid var(--primary-color);
}

.mv-card.mission {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.02) 100%);
  border-left: 4px solid var(--text-dark);
}

.mv-card h3 {
  color: var(--text-dark);
  margin-bottom: 1.5rem;
  position: relative;
  display: inline-block;
}

.mv-card h3:after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 50px;
  height: 3px;
  background: var(--primary-color);
}

.mv-card.mission h3:after {
  background: var(--text-dark);
}

.mv-card p {
  color: var(--text-light);
  line-height: 1.8;
}

/* CTA Section */
.about-cta {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  padding: 5rem 0;
  color: var(--white);
  text-align: center;
}

.about-cta h2 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

.about-cta p {
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto 2.5rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  transition: var(--transition);
}

.cta-btn.primary {
  background: var(--white);
  color: var(--primary-color);
}

.cta-btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.cta-btn.primary svg {
  margin-left: 0.5rem;
  width: 20px;
  height: 20px;
}

.cta-btn.secondary {
  border: 2px solid var(--white);
  color: var(--white);
}

.cta-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

/* Animations */
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
  .about-content {
    flex-direction: column;
  }
  
  .about-image {
    order: -1;
    margin-bottom: 3rem;
  }
  
  .about-hero h1 {
    font-size: 2.8rem;
  }
  
  .section-header h2 {
    font-size: 2.2rem;
  }
}

@media (max-width: 768px) {
  .about-tabs ul {
    flex-wrap: wrap;
  }
  
  .about-tabs li {
    padding: 1rem;
    font-size: 0.9rem;
  }
  
  .about-hero {
    padding: 6rem 0;
  }
  
  .about-hero h1 {
    font-size: 2.2rem;
  }
  
  .about-hero p {
    font-size: 1.1rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .about-hero {
    padding: 4rem 0;
  }
  
  .about-hero h1 {
    font-size: 1.8rem;
  }
  
  .section-header h2 {
    font-size: 1.8rem;
  }
  
  .stat-item h3 {
    font-size: 2rem;
  }
  
  .leader-image {
    height: 250px;
  }
}

/* Accessibility Focus Styles */
.about-tabs li:focus,
.cta-btn:focus,
.industry-card:focus,
.location-card:focus,
.leader-card:focus,
.culture-card:focus,
.value-card:focus,
.mv-card:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Print Styles */
@media print {
  .about-hero,
  .about-tabs,
  .about-cta {
    display: none;
  }
  
  .tab-content {
    padding: 1rem 0;
  }
  
  .section-header {
    margin-bottom: 1rem;
  }
  
  .about-content {
    flex-direction: column;
    margin-bottom: 1rem;
  }
  
  .about-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .industries-grid,
  .locations-grid,
  .leadership-grid,
  .culture-grid,
  .values-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  
  .leader-image {
    height: 200px;
  }
  
  .mission-vision {
    margin-top: 1rem;
  }
  
  * {
    color: #000 !important;
    background: transparent !important;
    box-shadow: none !important;
  }
}
`}</style>
    </>
  );
};

export default About;