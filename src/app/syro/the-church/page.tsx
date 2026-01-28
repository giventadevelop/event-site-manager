import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'The Church',
  description: 'Learn about the beliefs, history, and structure of the Syro-Malabar Church.',
};

const TheChurchPage = () => {
  const churchTopics = [
    {
      title: 'What Do We Believe',
      description: 'Our fundamental beliefs and Orthodox Christian doctrine',
      href: '/syro/the-church/what-do-we-believe',
      icon: '📖'
    },
    {
      title: 'Church History',
      description: 'The historical development of our church from apostolic times',
      href: '/syro/the-church/church-history',
      icon: '📜'
    },
    {
      title: 'Orthodox Faith',
      description: 'Understanding the Orthodox Christian faith and tradition',
      href: '/syro/the-church/orthodox-faith',
      icon: '⛪'
    },
    {
      title: 'Liturgy & Worship',
      description: 'Our liturgical tradition and forms of worship',
      href: '/syro/the-church/liturgy-worship',
      icon: '📿'
    },
    {
      title: 'Sacraments',
      description: 'The seven sacraments and their significance',
      href: '/syro/the-church/sacraments',
      icon: '💒'
    },
    {
      title: 'Church Calendar',
      description: 'Feast days, fasts, and liturgical seasons',
      href: '/syro/the-church/church-calendar',
      icon: '📅'
    }
  ];

  const keyBeliefs = [
    {
      title: 'The Holy Trinity',
      description: 'We believe in one God in three persons: Father, Son, and Holy Spirit',
      icon: '☦️'
    },
    {
      title: 'Incarnation',
      description: 'Jesus Christ is fully God and fully man, the eternal Son of God',
      icon: '✟'
    },
    {
      title: 'Resurrection',
      description: 'Christ rose from the dead, conquering death and offering eternal life',
      icon: '🌅'
    },
    {
      title: 'The Church',
      description: 'The Orthodox Church is the one, holy, catholic, and apostolic Church',
      icon: '⛪'
    }
  ];

  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-white to-syro-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-[5px] flex items-center justify-center mx-auto mb-6 shadow-syro-card">
              <span className="text-white text-4xl font-bold" role="img" aria-label="The Church">⛪</span>
            </div>
            <h1 className="font-syro-display font-semibold text-syro-h1 text-syro-blue mb-4">
              The Syro-Malabar Church
            </h1>
            <p className="font-syro-primary text-syro-body text-syro-text-gray max-w-3xl mx-auto leading-relaxed">
              We are an ancient apostolic church that traces its origins to St. Thomas the Apostle,
              who established Christianity in India in 52 AD. Our church maintains the Orthodox faith
              and tradition while serving our community with love and compassion.
            </p>
          </div>
        </div>
      </section>

      {/* Key Beliefs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syro-display font-semibold text-syro-h2 text-syro-blue mb-4">
              Our Core Beliefs
            </h2>
            <p className="font-syro-primary text-syro-body text-syro-text-gray max-w-3xl mx-auto">
              The foundation of our faith rests on the teachings of Christ, the apostles,
              and the early church fathers, preserved through centuries of Orthodox tradition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyBeliefs.map((belief) => (
              <div
                key={belief.title}
                className="bg-syro-bg-gray rounded-[5px] shadow-syro-card p-6 text-center hover:shadow-syro-card-hover transition-all duration-500"
              >
                <div className="w-16 h-16 bg-syro-red-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-syro-red" role="img" aria-label={belief.title}>{belief.icon}</span>
                </div>
                <h3 className="font-syro-display font-semibold text-syro-h4 text-syro-blue mb-3">
                  {belief.title}
                </h3>
                <p className="font-syro-primary text-syro-small text-syro-text-gray leading-relaxed">
                  {belief.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Church Topics */}
      <section className="py-16 bg-syro-light-gray/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syro-display font-semibold text-syro-h2 text-syro-blue mb-4">
              Learn About Our Church
            </h2>
            <p className="font-syro-primary text-syro-body text-syro-text-gray max-w-3xl mx-auto">
              Explore the rich heritage, beliefs, and traditions of the Syro-Malabar Church.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {churchTopics.map((topic) => (
              <Link
                key={topic.title}
                href={topic.href}
                className="bg-white rounded-[5px] shadow-syro-card p-6 hover:shadow-syro-card-hover transition-all duration-500 group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-syro-red-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-syro-red/20 transition-all duration-300">
                    <span className="text-2xl" role="img" aria-label={topic.title}>{topic.icon}</span>
                  </div>
                  <h3 className="font-syro-display font-semibold text-syro-h4 text-syro-blue mb-3 group-hover:text-syro-red transition-all duration-300">
                    {topic.title}
                  </h3>
                  <p className="font-syro-primary text-syro-small text-syro-text-gray leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Church Identity */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-syro-display font-semibold text-syro-h2 text-syro-blue mb-6">
                Our Church Identity
              </h2>
              <div className="space-y-4 font-syro-primary text-syro-body text-syro-text-gray leading-relaxed">
                <p>
                  The Syro-Malabar Church is part of the Oriental Orthodox family of churches,
                  which includes the Coptic, Ethiopian, Eritrean, Armenian, and Syrian Orthodox churches.
                  We share a common faith and tradition that dates back to the early centuries of Christianity.
                </p>
                <p>
                  Our church is known for its rich liturgical tradition, beautiful Syriac chant,
                  and deep spiritual heritage. We maintain the Orthodox faith as it was received
                  from the apostles and preserved by the early church fathers.
                </p>
                <p>
                  Today, we serve millions of faithful worldwide, providing spiritual guidance,
                  pastoral care, and community services while maintaining our ancient traditions
                  and adapting to the needs of modern society.
                </p>
              </div>
            </div>

            <div className="bg-syro-bg-gray rounded-[5px] shadow-syro-card p-6">
              <h3 className="font-syro-display font-semibold text-syro-h3 text-syro-blue mb-4">
                Church Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-syro-primary text-syro-text-gray">Founded</span>
                  <span className="font-syro-display font-semibold text-syro-blue">52 AD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-syro-primary text-syro-text-gray">Total Members</span>
                  <span className="font-syro-display font-semibold text-syro-blue">2.5+ Million</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-syro-primary text-syro-text-gray">Dioceses</span>
                  <span className="font-syro-display font-semibold text-syro-blue">30</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-syro-primary text-syro-text-gray">Parishes</span>
                  <span className="font-syro-display font-semibold text-syro-blue">2000+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-syro-primary text-syro-text-gray">Countries</span>
                  <span className="font-syro-display font-semibold text-syro-blue">50+</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-syro-red-light rounded-[5px]">
                <h4 className="font-syro-display font-medium text-syro-blue mb-2">
                  Motto
                </h4>
                <p className="font-syro-primary text-syro-small text-syro-text-gray">
                  "Light of the East, Light of the World"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-syro-light-gray/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white rounded-[5px] shadow-syro-card p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-syro-red-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-syro-red" role="img" aria-label="Mission">🎯</span>
                </div>
                <h3 className="font-syro-display font-semibold text-syro-h3 text-syro-blue mb-4">
                  Our Mission
                </h3>
              </div>
              <p className="font-syro-primary text-syro-body text-syro-text-gray leading-relaxed">
                To proclaim the Gospel of Jesus Christ, to preserve and propagate the Orthodox faith,
                to provide spiritual guidance and pastoral care to our members, and to serve humanity
                with love, compassion, and justice in accordance with the teachings of our Lord.
              </p>
            </div>

            <div className="bg-white rounded-[5px] shadow-syro-card p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-syro-red-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-syro-red" role="img" aria-label="Vision">👁️</span>
                </div>
                <h3 className="font-syro-display font-semibold text-syro-h3 text-syro-blue mb-4">
                  Our Vision
                </h3>
              </div>
              <p className="font-syro-primary text-syro-body text-syro-text-gray leading-relaxed">
                To be a vibrant, growing Orthodox Christian community that faithfully preserves
                the apostolic tradition while effectively ministering to the spiritual, social,
                and educational needs of our members and the wider community in the 21st century.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TheChurchPage;
