import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Dioceses',
  description: 'Explore the dioceses of the Syro-Malabar Church across India and worldwide.',
};

const DiocesesPage = () => {
  const dioceses = [
    // Kerala Dioceses
    {
      region: 'Kerala',
      dioceses: [
        { name: 'Diocese of Thiruvananthapuram', href: '/syro/dioceses/diocese-of-thiruvananthapuram-diocese' },
        { name: 'Diocese of Kollam', href: '/syro/dioceses/diocese-of-kollam' },
        { name: 'Diocese of Kottarakara – Punalur', href: '/syro/dioceses/diocese-of-kottarakara-punalur' },
        { name: 'Diocese of Adoor – Kadampanadu', href: '/syro/dioceses/diocese-of-adoor-kadampanadu' },
        { name: 'Diocese of Thumpamon', href: '/syro/dioceses/diocese-of-thumpamon' },
        { name: 'Diocese of Mavelikara', href: '/syro/dioceses/diocese-of-mavelikara' },
        { name: 'Diocese of Chengannur', href: '/syro/dioceses/diocese-of-chengannur' },
        { name: 'Diocese of Niranam', href: '/syro/dioceses/diocese-of-niranam' },
        { name: 'Diocese of Nilackal', href: '/syro/dioceses/diocese-of-nilackal' },
        { name: 'Diocese of Kottayam', href: '/syro/dioceses/diocese-of-kottayam' },
        { name: 'Diocese of Kottayam Central', href: '/syro/dioceses/diocese-of-kottayam-central' },
        { name: 'Diocese of Idukki', href: '/syro/dioceses/diocese-of-idukki' },
        { name: 'Diocese of Kandanad East', href: '/syro/dioceses/diocese-of-kandanad-east' },
        { name: 'Diocese of Kandanad West', href: '/syro/dioceses/diocese-of-kandanad-west' },
        { name: 'Diocese of Ankamaly', href: '/syro/dioceses/diocese-of-ankamaly' },
        { name: 'Diocese of Kochi', href: '/syro/dioceses/diocese-of-kochi' },
        { name: 'Diocese of Thrissur', href: '/syro/dioceses/diocese-of-thrissur' },
        { name: 'Diocese of Kunnamkulam', href: '/syro/dioceses/diocese-of-kunnamkulam' },
        { name: 'Diocese of Malabar', href: '/syro/dioceses/diocese-of-malabar' },
        { name: 'Diocese of Sulthan Bathery', href: '/syro/dioceses/diocese-of-sulthan-bathery-diocese' },
        { name: 'Diocese of Brahamavar', href: '/syro/dioceses/diocese-of-brahamavar' }
      ]
    },
    // Indian Dioceses (Outside Kerala)
    {
      region: 'India',
      dioceses: [
        { name: 'Diocese of Madras', href: '/syro/dioceses/diocese-of-chennai-diocese' },
        { name: 'Diocese of Bangalore', href: '/syro/dioceses/diocese-of-bangalore' },
        { name: 'Diocese of Bombay', href: '/syro/dioceses/diocese-of-mumbai' },
        { name: 'Diocese of Calcutta', href: '/syro/dioceses/diocese-of-calcutta' },
        { name: 'Diocese of Delhi', href: '/syro/dioceses/diocese-of-delhi' },
        { name: 'Diocese of Ahmedabad', href: '/syro/dioceses/diocese-of-ahmedabad' }
      ]
    },
    // International Dioceses
    {
      region: 'International',
      dioceses: [
        { name: 'Diocese of Northeast America', href: '/syro/dioceses/northeast-america' },
        { name: 'Diocese of South West America', href: '/syro/dioceses/diocese-of-south-west-america' },
        { name: 'Diocese of UK Europe and Africa', href: '/syro/dioceses/diocese-of-uk-europe-and-africa' }
      ]
    }
  ];

  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-white to-syro-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-[5px] flex items-center justify-center mx-auto mb-6 shadow-syro-card">
              <span className="text-white text-4xl font-bold" role="img" aria-label="Dioceses">🗺️</span>
            </div>
            <h1 className="font-syro-display font-semibold text-syro-h1 text-syro-blue mb-4">
              Dioceses of the Syro-Malabar Church
            </h1>
            <p className="font-syro-primary text-syro-body text-syro-text-gray max-w-3xl mx-auto leading-relaxed">
              Our church is organized into dioceses across India and worldwide, each serving local communities
              while maintaining unity with the global Orthodox family.
            </p>
          </div>
        </div>
      </section>

      {/* Dioceses by Region */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syro-display font-semibold text-syro-h2 text-syro-blue mb-4">
              Our Dioceses
            </h2>
            <p className="font-syro-primary text-syro-body text-syro-text-gray max-w-3xl mx-auto">
              The Syro-Malabar Church is organized into dioceses that serve communities
              across different regions, ensuring spiritual care and administrative support for all members.
            </p>
          </div>

          {dioceses.map((region) => (
            <div key={region.region} className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-syro-red-light rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl text-syro-red" role="img" aria-label="Region">
                    {region.region === 'Kerala' ? '🏞️' : region.region === 'India' ? '🇮🇳' : '🌍'}
                  </span>
                </div>
                <h3 className="font-syro-display font-semibold text-syro-h3 text-syro-blue">
                  {region.region} Dioceses
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {region.dioceses.map((diocese) => (
                  <Link
                    key={diocese.name}
                    href={diocese.href}
                    className="bg-syro-bg-gray rounded-[5px] shadow-syro-card p-4 hover:shadow-syro-card-hover transition-all duration-500 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-syro-red-light rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-syro-red/20 transition-all duration-300">
                        <span className="text-syro-red" role="img" aria-label="Diocese">⛪</span>
                      </div>
                      <span className="font-syro-primary font-medium text-syro-blue group-hover:text-syro-red transition-all duration-300">
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
      <section className="py-16 bg-syro-light-gray/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-syro-display font-semibold text-syro-h2 text-syro-blue mb-6">
                About Our Dioceses
              </h2>
              <div className="space-y-4 font-syro-primary text-syro-body text-syro-text-gray leading-relaxed">
                <p>
                  Each diocese in the Syro-Malabar Church is led by a Metropolitan or Bishop
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

            <div className="bg-white rounded-[5px] shadow-syro-card p-6">
              <h3 className="font-syro-display font-semibold text-syro-h3 text-syro-blue mb-4">
                Diocese Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-syro-primary text-syro-text-gray">Total Dioceses</span>
                  <span className="font-syro-display font-semibold text-syro-blue">30</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-syro-primary text-syro-text-gray">Kerala Dioceses</span>
                  <span className="font-syro-display font-semibold text-syro-blue">21</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-syro-primary text-syro-text-gray">Indian Dioceses</span>
                  <span className="font-syro-display font-semibold text-syro-blue">6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-syro-primary text-syro-text-gray">International Dioceses</span>
                  <span className="font-syro-display font-semibold text-syro-blue">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-syro-primary text-syro-text-gray">Total Parishes</span>
                  <span className="font-syro-display font-semibold text-syro-blue">2000+</span>
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
