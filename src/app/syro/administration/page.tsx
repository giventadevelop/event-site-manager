import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Administration',
  description: 'Learn about the administrative structure and governance of the Syro-Malabar Church.',
};

const AdministrationPage = () => {
  const adminStructure = [
    {
      title: 'The Constitution of the Syro-Malabar Church',
      description: 'The fundamental document that governs the structure and operation of our church.',
      href: '/syro/administration/administration',
      icon: '📜'
    },
    {
      title: 'The Canon Law of the Syro-Malabar Church',
      description: 'The ecclesiastical laws and regulations that guide our church governance.',
      href: '/syro/administration/he-canon-law-of-the-syro-malabar-church',
      icon: '⚖️'
    },
    {
      title: 'The Holy Episcopal Synod',
      description: 'The highest governing body consisting of all bishops of the church.',
      href: '/syro/administration/the-holy-episcopal-synod',
      icon: '👥'
    },
    {
      title: 'Malankara Association',
      description: 'The supreme legislative body of the church representing all parishes.',
      href: '/syro/administration/malankara-association',
      icon: '🏛️'
    },
    {
      title: 'The Managing Committee',
      description: 'The executive body responsible for day-to-day administration.',
      href: '/syro/administration/the-managing-committee',
      icon: '⚙️'
    },
    {
      title: 'The Working Committee',
      description: 'The operational committee that implements church policies and decisions.',
      href: '/syro/administration/the-working-committee',
      icon: '🔧'
    },
    {
      title: 'The Diocesan General Body',
      description: 'The governing body at the diocesan level representing all parishes in a diocese.',
      href: '/syro/administration/the-diocesan-general-body',
      icon: '🏢'
    },
    {
      title: 'The Parish Managing Committee',
      description: 'The local administrative body responsible for individual parish management.',
      href: '/syro/administration/the-parish-managing-committee',
      icon: '⛪'
    },
    {
      title: 'The Parish General Body',
      description: 'The general assembly of all parish members for decision-making.',
      href: '/syro/administration/the-parish-general-body',
      icon: '👨‍👩‍👧‍👦'
    }
  ];

  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-white to-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-[5px] flex items-center justify-center mx-auto mb-6 shadow-syro-card">
              <span className="text-white text-4xl font-bold" role="img" aria-label="Administration">🏛️</span>
            </div>
            <h1 className="text-syro-h1 font-bold text-syro-blue mb-4">
              Church Administration & Structure
            </h1>
            <p className="text-syro-body text-syro-text-gray max-w-3xl mx-auto leading-relaxed">
              The Syro-Malabar Church operates under a well-defined administrative structure
              that ensures proper governance, spiritual guidance, and community service at all levels.
            </p>
          </div>
        </div>
      </section>

      {/* Administrative Structure */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-syro-h3 font-bold text-syro-blue mb-4">
              Administrative Structure
            </h2>
            <p className="text-syro-body text-syro-text-gray max-w-3xl mx-auto">
              Our church is governed by a hierarchical structure that balances spiritual authority
              with democratic participation, ensuring both tradition and modern governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminStructure.map((item, index) => (
              <Link
                key={item.title}
                href={item.href}
                className="bg-syro-bg-gray rounded-[5px] shadow-syro-card p-6 hover:shadow-syro-card-hover transition-all duration-500 group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-syro-red-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-syro-red transition-all duration-300">
                    <span className="text-2xl" role="img" aria-label={item.title}>{item.icon}</span>
                  </div>
                  <h3 className="text-syro-h6 font-semibold text-syro-blue mb-3 group-hover:text-syro-red transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-syro-label text-syro-text-gray leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Governance Principles */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-syro-h3 font-bold text-syro-blue mb-6">
                Governance Principles
              </h2>
              <div className="space-y-4 text-syro-body text-syro-text-gray leading-relaxed">
                <p>
                  The administrative structure of the Syro-Malabar Church is based on
                  democratic principles while maintaining the apostolic tradition and spiritual authority
                  of the episcopacy.
                </p>
                <p>
                  Our governance model ensures that all major decisions are made through proper
                  consultation and consensus, involving clergy, laity, and administrative bodies
                  at appropriate levels.
                </p>
                <p>
                  The church operates under a system of checks and balances, where spiritual
                  authority is respected while administrative efficiency is maintained through
                  well-defined procedures and responsibilities.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[5px] shadow-syro-card p-6">
              <h3 className="text-syro-h4 font-semibold text-syro-blue mb-4">
                Key Features
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Democratic">🗳️</span>
                  <div>
                    <h4 className="text-syro-h6 font-semibold text-syro-blue">Democratic Participation</h4>
                    <p className="text-syro-label text-syro-text-gray">All major decisions involve consultation with clergy and laity</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Hierarchical">📊</span>
                  <div>
                    <h4 className="text-syro-h6 font-semibold text-syro-blue">Hierarchical Structure</h4>
                    <p className="text-syro-label text-syro-text-gray">Clear levels of authority from parish to global level</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Transparent">🔍</span>
                  <div>
                    <h4 className="text-syro-h6 font-semibold text-syro-blue">Transparency</h4>
                    <p className="text-syro-label text-syro-text-gray">Open processes and accountability in all administrative matters</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Spiritual">🙏</span>
                  <div>
                    <h4 className="text-syro-h6 font-semibold text-syro-blue">Spiritual Authority</h4>
                    <p className="text-syro-label text-syro-text-gray">Maintaining apostolic succession and ecclesiastical tradition</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdministrationPage;
