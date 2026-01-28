import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Theological Seminaries | Syro-Malabar Church',
  description: 'Theological seminaries of the Syro-Malabar Church providing theological education and training for clergy and laity.',
  keywords: ['Theological Seminaries', 'Orthodox Theology', 'Syro-Malabar Education', 'Seminary Training'],
};

const TheologicalSeminariesPage = () => {
  const seminaries = [
    {
      slug: 'the-orthodox-theological-seminary',
      title: 'The Orthodox Theological Seminary',
      subtitle: 'Old Seminary, Kottayam',
      description: 'The first Orthodox Christian school of theology in Asia, founded in 1815 at Kottayam by Ramban Ittoop, a priest-monk of the Syro-Malabar Church.',
      icon: '📚',
      location: 'Kottayam, Kerala',
      established: '1815'
    },
    {
      slug: 'st-thomas-orthodox-theological-seminary-nagpur',
      title: 'St. Thomas Orthodox Theological Seminary',
      subtitle: 'STOTS, Nagpur',
      description: 'A growing centre of the Orthodox Church in Central and North India, creating a new vision about the mission of the Church in a multi-lingual and multi-religious context.',
      icon: '⛪',
      location: 'Nagpur, India',
      established: 'Modern Era'
    }
  ];

  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white to-syro-light-gray min-h-[400px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-[5px] flex items-center justify-center mx-auto mb-6 shadow-syro-card-lg">
              <span className="text-white text-4xl font-bold" role="img" aria-label="Theological Seminaries">🎓</span>
            </div>
            <h1 className="font-syro-display font-semibold text-syro-h1 text-syro-blue mb-4">
              Theological Seminaries
            </h1>
            <p className="font-syro-body text-lg text-syro-text-gray max-w-3xl mx-auto leading-relaxed">
              Centers of theological excellence providing education and formation for the spiritual leadership of the Syro-Malabar Church.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-syro-display font-semibold text-syro-h2 text-syro-blue mb-4">
              Centers of Learning and Formation
            </h2>
            <p className="font-syro-body text-lg text-syro-text-gray leading-relaxed">
              Our theological seminaries have been serving the Church for generations, preparing clergy and lay leaders with deep theological knowledge, spiritual formation, and pastoral skills to serve God's people with wisdom and compassion.
            </p>
          </div>

          {/* Seminaries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {seminaries.map((seminary) => (
              <Link
                key={seminary.slug}
                href={`/syro/theological-seminaries/${seminary.slug}`}
                className="group"
              >
                <div className="bg-syro-bg-gray rounded-[5px] shadow-syro-card p-8 h-full hover:shadow-syro-card-lg transition-all duration-300">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-syro-red/10 rounded-[5px] flex items-center justify-center mb-6 group-hover:bg-syro-red/20 transition-colors duration-300">
                    <span className="text-4xl" role="img" aria-label={seminary.title}>{seminary.icon}</span>
                  </div>

                  {/* Content */}
                  <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-2 group-hover:text-syro-red transition-colors duration-300">
                    {seminary.title}
                  </h3>
                  <p className="font-syro-body text-sm text-syro-red mb-3">
                    {seminary.subtitle}
                  </p>
                  <p className="font-syro-body text-syro-text-gray leading-relaxed mb-6">
                    {seminary.description}
                  </p>

                  {/* Meta Information */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-syro-border">
                    <div className="flex items-center space-x-2">
                      <span className="text-syro-red" role="img" aria-label="Location">📍</span>
                      <span className="font-syro-caption text-sm text-syro-text-gray">{seminary.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-syro-red" role="img" aria-label="Established">📅</span>
                      <span className="font-syro-caption text-sm text-syro-text-gray">Est. {seminary.established}</span>
                    </div>
                  </div>

                  {/* Read More Link */}
                  <div className="mt-6 flex items-center text-syro-red group-hover:translate-x-2 transition-transform duration-300">
                    <span className="font-medium">Learn More</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-syro-light-gray/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-syro-display font-semibold text-syro-h2 text-syro-blue text-center mb-12">
            What We Offer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-syro-red/20 transition-colors duration-300">
                <span className="text-3xl" role="img" aria-label="Academic Excellence">📖</span>
              </div>
              <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">
                Academic Excellence
              </h3>
              <p className="font-syro-body text-syro-text-gray leading-relaxed">
                Rigorous theological education grounded in Orthodox Christian tradition and contemporary scholarship.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-syro-red/20 transition-colors duration-300">
                <span className="text-3xl" role="img" aria-label="Spiritual Formation">🕊️</span>
              </div>
              <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">
                Spiritual Formation
              </h3>
              <p className="font-syro-body text-syro-text-gray leading-relaxed">
                Nurturing deep spiritual life through prayer, worship, and participation in the sacramental life of the Church.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-syro-red/20 transition-colors duration-300">
                <span className="text-3xl" role="img" aria-label="Pastoral Training">👥</span>
              </div>
              <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">
                Pastoral Training
              </h3>
              <p className="font-syro-body text-syro-text-gray leading-relaxed">
                Practical preparation for ministry, including counseling, liturgy, and community leadership skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-syro-display font-semibold text-syro-h2 text-syro-blue mb-4">
            Explore Our Seminaries
          </h2>
          <p className="font-syro-body text-lg text-syro-text-gray max-w-3xl mx-auto mb-8">
            Learn more about our theological programs, admission requirements, and how you can pursue theological education at our seminaries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/syro/institutions"
              className="inline-flex items-center justify-center px-6 py-3 bg-syro-red text-white rounded-[5px] hover:bg-syro-red/90 transition-colors duration-300"
            >
              Church Institutions
            </Link>
            <Link
              href="/syro"
              className="inline-flex items-center justify-center px-6 py-3 bg-syro-bg-gray text-syro-blue border border-syro-border rounded-[5px] hover:bg-syro-light-gray transition-colors duration-300"
            >
              Back to Syro Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TheologicalSeminariesPage;
