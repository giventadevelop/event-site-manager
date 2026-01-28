import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Administration',
  description: 'Learn about the administrative structure and governance of the Malankara Orthodox Syrian Church.',
};

const AdministrationPage = () => {
  const adminStructure = [
    {
      title: 'The Constitution of the Malankara Orthodox Church',
      description: 'The fundamental document that governs the structure and operation of our church.',
      href: '/mosc/administration/administration',
      icon: '📜'
    },
    {
      title: 'The Canon Law of the Malankara Orthodox Church',
      description: 'The ecclesiastical laws and regulations that guide our church governance.',
      href: '/mosc/administration/he-canon-law-of-the-malankara-orthodox-church',
      icon: '⚖️'
    },
    {
      title: 'The Holy Episcopal Synod',
      description: 'The highest governing body consisting of all bishops of the church.',
      href: '/mosc/administration/the-holy-episcopal-synod',
      icon: '👥'
    },
    {
      title: 'Malankara Association',
      description: 'The supreme legislative body of the church representing all parishes.',
      href: '/mosc/administration/malankara-association',
      icon: '🏛️'
    },
    {
      title: 'The Managing Committee',
      description: 'The executive body responsible for day-to-day administration.',
      href: '/mosc/administration/the-managing-committee',
      icon: '⚙️'
    },
    {
      title: 'The Working Committee',
      description: 'The operational committee that implements church policies and decisions.',
      href: '/mosc/administration/the-working-committee',
      icon: '🔧'
    },
    {
      title: 'The Diocesan General Body',
      description: 'The governing body at the diocesan level representing all parishes in a diocese.',
      href: '/mosc/administration/the-diocesan-general-body',
      icon: '🏢'
    },
    {
      title: 'The Parish Managing Committee',
      description: 'The local administrative body responsible for individual parish management.',
      href: '/mosc/administration/the-parish-managing-committee',
      icon: '⛪'
    },
    {
      title: 'The Parish General Body',
      description: 'The general assembly of all parish members for decision-making.',
      href: '/mosc/administration/the-parish-general-body',
      icon: '👨‍👩‍👧‍👦'
    }
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Administration">🏛️</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Church Administration & Structure
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The Malankara Orthodox Syrian Church operates under a well-defined administrative structure
              that ensures proper governance, spiritual guidance, and community service at all levels.
            </p>
          </div>
        </div>
      </section>

      {/* Administrative Structure */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Administrative Structure
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              Our church is governed by a hierarchical structure that balances spiritual authority
              with democratic participation, ensuring both tradition and modern governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminStructure.map((item, index) => (
              <Link
                key={item.title}
                href={item.href}
                className="bg-background rounded-lg sacred-shadow p-6 hover:sacred-shadow-lg reverent-transition group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 reverent-transition">
                    <span className="text-2xl" role="img" aria-label={item.title}>{item.icon}</span>
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-3 group-hover:text-primary reverent-transition">
                    {item.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Governance Principles */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
                Governance Principles
              </h2>
              <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
                <p>
                  The administrative structure of the Malankara Orthodox Syrian Church is based on
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

            <div className="bg-card rounded-lg sacred-shadow p-6">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                Key Features
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-primary text-xl" role="img" aria-label="Democratic">🗳️</span>
                  <div>
                    <h4 className="font-heading font-medium text-foreground">Democratic Participation</h4>
                    <p className="font-body text-muted-foreground text-sm">All major decisions involve consultation with clergy and laity</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary text-xl" role="img" aria-label="Hierarchical">📊</span>
                  <div>
                    <h4 className="font-heading font-medium text-foreground">Hierarchical Structure</h4>
                    <p className="font-body text-muted-foreground text-sm">Clear levels of authority from parish to global level</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary text-xl" role="img" aria-label="Transparent">🔍</span>
                  <div>
                    <h4 className="font-heading font-medium text-foreground">Transparency</h4>
                    <p className="font-body text-muted-foreground text-sm">Open processes and accountability in all administrative matters</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary text-xl" role="img" aria-label="Spiritual">🙏</span>
                  <div>
                    <h4 className="font-heading font-medium text-foreground">Spiritual Authority</h4>
                    <p className="font-body text-muted-foreground text-sm">Maintaining apostolic succession and ecclesiastical tradition</p>
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














