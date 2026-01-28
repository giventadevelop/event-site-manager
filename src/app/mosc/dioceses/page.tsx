import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Dioceses',
  description: 'Explore the dioceses of the Malankara Orthodox Syrian Church across India and worldwide.',
};

const DiocesesPage = () => {
  const dioceses = [
    // Kerala Dioceses
    {
      region: 'Kerala',
      dioceses: [
        { name: 'Diocese of Thiruvananthapuram', href: '/mosc/dioceses/diocese-of-thiruvananthapuram-diocese' },
        { name: 'Diocese of Kollam', href: '/mosc/dioceses/diocese-of-kollam' },
        { name: 'Diocese of Kottarakara – Punalur', href: '/mosc/dioceses/diocese-of-kottarakara-punalur' },
        { name: 'Diocese of Adoor – Kadampanadu', href: '/mosc/dioceses/diocese-of-adoor-kadampanadu' },
        { name: 'Diocese of Thumpamon', href: '/mosc/dioceses/diocese-of-thumpamon' },
        { name: 'Diocese of Mavelikara', href: '/mosc/dioceses/diocese-of-mavelikara' },
        { name: 'Diocese of Chengannur', href: '/mosc/dioceses/diocese-of-chengannur' },
        { name: 'Diocese of Niranam', href: '/mosc/dioceses/diocese-of-niranam' },
        { name: 'Diocese of Nilackal', href: '/mosc/dioceses/diocese-of-nilackal' },
        { name: 'Diocese of Kottayam', href: '/mosc/dioceses/diocese-of-kottayam' },
        { name: 'Diocese of Kottayam Central', href: '/mosc/dioceses/diocese-of-kottayam-central' },
        { name: 'Diocese of Idukki', href: '/mosc/dioceses/diocese-of-idukki' },
        { name: 'Diocese of Kandanad East', href: '/mosc/dioceses/diocese-of-kandanad-east' },
        { name: 'Diocese of Kandanad West', href: '/mosc/dioceses/diocese-of-kandanad-west' },
        { name: 'Diocese of Ankamaly', href: '/mosc/dioceses/diocese-of-ankamaly' },
        { name: 'Diocese of Kochi', href: '/mosc/dioceses/diocese-of-kochi' },
        { name: 'Diocese of Thrissur', href: '/mosc/dioceses/diocese-of-thrissur' },
        { name: 'Diocese of Kunnamkulam', href: '/mosc/dioceses/diocese-of-kunnamkulam' },
        { name: 'Diocese of Malabar', href: '/mosc/dioceses/diocese-of-malabar' },
        { name: 'Diocese of Sulthan Bathery', href: '/mosc/dioceses/diocese-of-sulthan-bathery-diocese' },
        { name: 'Diocese of Brahamavar', href: '/mosc/dioceses/diocese-of-brahamavar' }
      ]
    },
    // Indian Dioceses (Outside Kerala)
    {
      region: 'India',
      dioceses: [
        { name: 'Diocese of Madras', href: '/mosc/dioceses/diocese-of-chennai-diocese' },
        { name: 'Diocese of Bangalore', href: '/mosc/dioceses/diocese-of-bangalore' },
        { name: 'Diocese of Bombay', href: '/mosc/dioceses/diocese-of-mumbai' },
        { name: 'Diocese of Calcutta', href: '/mosc/dioceses/diocese-of-calcutta' },
        { name: 'Diocese of Delhi', href: '/mosc/dioceses/diocese-of-delhi' },
        { name: 'Diocese of Ahmedabad', href: '/mosc/dioceses/diocese-of-ahmedabad' }
      ]
    },
    // International Dioceses
    {
      region: 'International',
      dioceses: [
        { name: 'Diocese of Northeast America', href: '/mosc/dioceses/northeast-america' },
        { name: 'Diocese of South West America', href: '/mosc/dioceses/diocese-of-south-west-america' },
        { name: 'Diocese of UK Europe and Africa', href: '/mosc/dioceses/diocese-of-uk-europe-and-africa' }
      ]
    }
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Dioceses">🗺️</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Dioceses of the Malankara Orthodox Syrian Church
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our church is organized into dioceses across India and worldwide, each serving local communities
              while maintaining unity with the global Orthodox family.
            </p>
          </div>
        </div>
      </section>

      {/* Dioceses by Region */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Our Dioceses
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              The Malankara Orthodox Syrian Church is organized into dioceses that serve communities
              across different regions, ensuring spiritual care and administrative support for all members.
            </p>
          </div>

          {dioceses.map((region) => (
            <div key={region.region} className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl text-primary" role="img" aria-label="Region">
                    {region.region === 'Kerala' ? '🏞️' : region.region === 'India' ? '🇮🇳' : '🌍'}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-2xl text-foreground">
                  {region.region} Dioceses
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {region.dioceses.map((diocese) => (
                  <Link
                    key={diocese.name}
                    href={diocese.href}
                    className="bg-background rounded-lg sacred-shadow p-4 hover:sacred-shadow-lg reverent-transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 reverent-transition">
                        <span className="text-primary" role="img" aria-label="Diocese">⛪</span>
                      </div>
                      <span className="font-body font-medium text-foreground group-hover:text-primary reverent-transition">
                        {diocese.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Diocese Information */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
                About Our Dioceses
              </h2>
              <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
                <p>
                  Each diocese in the Malankara Orthodox Syrian Church is led by a Metropolitan or Bishop
                  who provides spiritual guidance and administrative oversight to the parishes within their jurisdiction.
                </p>
                <p>
                  Our dioceses are organized geographically to serve the spiritual needs of our members,
                  whether they are in Kerala, other parts of India, or in international communities
                  around the world.
                </p>
                <p>
                  Each diocese maintains its own administrative structure while remaining united with
                  the central church authority, ensuring both local autonomy and global unity in our faith.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-lg sacred-shadow p-6">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                Diocese Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-body text-muted-foreground">Total Dioceses</span>
                  <span className="font-heading font-semibold text-foreground">30</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body text-muted-foreground">Kerala Dioceses</span>
                  <span className="font-heading font-semibold text-foreground">21</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body text-muted-foreground">Indian Dioceses</span>
                  <span className="font-heading font-semibold text-foreground">6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body text-muted-foreground">International Dioceses</span>
                  <span className="font-heading font-semibold text-foreground">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body text-muted-foreground">Total Parishes</span>
                  <span className="font-heading font-semibold text-foreground">2000+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DiocesesPage;














