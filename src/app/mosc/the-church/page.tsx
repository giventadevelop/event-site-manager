import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'The Church',
  description: 'Learn about the beliefs, history, and structure of the Malankara Orthodox Syrian Church.',
};

const TheChurchPage = () => {
  const churchTopics = [
    {
      title: 'What Do We Believe',
      description: 'Our fundamental beliefs and Orthodox Christian doctrine',
      href: '/mosc/the-church/what-do-we-believe',
      icon: '📖'
    },
    {
      title: 'Church History',
      description: 'The historical development of our church from apostolic times',
      href: '/mosc/the-church/church-history',
      icon: '📜'
    },
    {
      title: 'Orthodox Faith',
      description: 'Understanding the Orthodox Christian faith and tradition',
      href: '/mosc/the-church/orthodox-faith',
      icon: '⛪'
    },
    {
      title: 'Liturgy & Worship',
      description: 'Our liturgical tradition and forms of worship',
      href: '/mosc/the-church/liturgy-worship',
      icon: '📿'
    },
    {
      title: 'Sacraments',
      description: 'The seven sacraments and their significance',
      href: '/mosc/the-church/sacraments',
      icon: '💒'
    },
    {
      title: 'Church Calendar',
      description: 'Feast days, fasts, and liturgical seasons',
      href: '/mosc/the-church/church-calendar',
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
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="The Church">⛪</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              The Malankara Orthodox Syrian Church
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We are an ancient apostolic church that traces its origins to St. Thomas the Apostle,
              who established Christianity in India in 52 AD. Our church maintains the Orthodox faith
              and tradition while serving our community with love and compassion.
            </p>
          </div>
        </div>
      </section>

      {/* Key Beliefs */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Our Core Beliefs
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              The foundation of our faith rests on the teachings of Christ, the apostles,
              and the early church fathers, preserved through centuries of Orthodox tradition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyBeliefs.map((belief) => (
              <div
                key={belief.title}
                className="bg-background rounded-lg sacred-shadow p-6 text-center hover:sacred-shadow-lg reverent-transition"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-primary" role="img" aria-label={belief.title}>{belief.icon}</span>
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-3">
                  {belief.title}
                </h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  {belief.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Church Topics */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Learn About Our Church
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              Explore the rich heritage, beliefs, and traditions of the Malankara Orthodox Syrian Church.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {churchTopics.map((topic) => (
              <Link
                key={topic.title}
                href={topic.href}
                className="bg-card rounded-lg sacred-shadow p-6 hover:sacred-shadow-lg reverent-transition group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 reverent-transition">
                    <span className="text-2xl" role="img" aria-label={topic.title}>{topic.icon}</span>
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-3 group-hover:text-primary reverent-transition">
                    {topic.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Church Identity */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
                Our Church Identity
              </h2>
              <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
                <p>
                  The Malankara Orthodox Syrian Church is part of the Oriental Orthodox family of churches,
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

            <div className="bg-background rounded-lg sacred-shadow p-6">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                Church Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-body text-muted-foreground">Founded</span>
                  <span className="font-heading font-semibold text-foreground">52 AD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body text-muted-foreground">Total Members</span>
                  <span className="font-heading font-semibold text-foreground">2.5+ Million</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body text-muted-foreground">Dioceses</span>
                  <span className="font-heading font-semibold text-foreground">30</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body text-muted-foreground">Parishes</span>
                  <span className="font-heading font-semibold text-foreground">2000+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body text-muted-foreground">Countries</span>
                  <span className="font-heading font-semibold text-foreground">50+</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                <h4 className="font-heading font-medium text-foreground mb-2">
                  Motto
                </h4>
                <p className="font-body text-muted-foreground text-sm">
                  "Light of the East, Light of the World"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-card rounded-lg sacred-shadow p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-primary" role="img" aria-label="Mission">🎯</span>
                </div>
                <h3 className="font-heading font-semibold text-2xl text-foreground mb-4">
                  Our Mission
                </h3>
              </div>
              <p className="font-body text-muted-foreground leading-relaxed">
                To proclaim the Gospel of Jesus Christ, to preserve and propagate the Orthodox faith,
                to provide spiritual guidance and pastoral care to our members, and to serve humanity
                with love, compassion, and justice in accordance with the teachings of our Lord.
              </p>
            </div>

            <div className="bg-card rounded-lg sacred-shadow p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-primary" role="img" aria-label="Vision">👁️</span>
                </div>
                <h3 className="font-heading font-semibold text-2xl text-foreground mb-4">
                  Our Vision
                </h3>
              </div>
              <p className="font-body text-muted-foreground leading-relaxed">
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














