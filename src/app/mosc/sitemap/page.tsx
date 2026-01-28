import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Sitemap',
  description: 'Complete sitemap of the Malankara Orthodox Syrian Church website.',
};

const SitemapPage = () => {
  const sitemapStructure = [
    {
      title: 'Main Sections',
      links: [
        { name: 'Home', href: '/mosc' },
        { name: 'The Catholicate', href: '/mosc/catholicate' },
        { name: 'Administration', href: '/mosc/administration' },
        { name: 'The Church', href: '/mosc/the-church' },
        { name: 'Holy Synod', href: '/mosc/holy-synod' },
        { name: 'Ecumenical', href: '/mosc/ecumenical' },
        { name: 'Dioceses', href: '/mosc/dioceses' },
        { name: 'Saints', href: '/mosc/saints' }
      ]
    },
    {
      title: 'Spiritual Resources',
      links: [
        { name: 'Liturgical Resources', href: '/mosc/liturgical-resources' },
        { name: 'Theological Writings', href: '/mosc/theological-writings' },
        { name: 'Patristic Fathers', href: '/mosc/patristic-fathers' },
        { name: 'Holy Bible', href: '/mosc/holy-bible' },
        { name: 'Sermons', href: '/mosc/sermons' },
        { name: 'Hymns', href: '/mosc/hymns' },
        { name: 'Prayers', href: '/mosc/prayers' },
        { name: 'Calendar', href: '/mosc/calendar' }
      ]
    },
    {
      title: 'Community Services',
      links: [
        { name: 'Spiritual Organisations', href: '/mosc/spiritual' },
        { name: 'Publications', href: '/mosc/publications' },
        { name: 'Institutions', href: '/mosc/institutions' },
        { name: 'Training', href: '/mosc/training' },
        { name: 'Theological Seminaries', href: '/mosc/theological' },
        { name: 'Lectionary', href: '/mosc/lectionary' },
        { name: 'Downloads', href: '/mosc/downloads' },
        { name: 'Gallery', href: '/mosc/gallery' }
      ]
    },
    {
      title: 'External Links',
      links: [
        { name: 'Directory', href: '/mosc/directory' },
        { name: 'Calendar', href: 'http://calendar.mosc.in/', external: true },
        { name: 'E-mail', href: 'https://accounts.google.com/ServiceLogin', external: true }
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
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Sitemap">🗺️</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Website Sitemap
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Navigate through all sections and pages of the Malankara Orthodox Syrian Church website.
              Find information about our faith, history, administration, and spiritual resources.
            </p>
          </div>
        </div>
      </section>

      {/* Sitemap Structure */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sitemapStructure.map((section) => (
              <div key={section.title} className="bg-background rounded-lg sacred-shadow p-6">
                <h2 className="font-heading font-semibold text-xl text-foreground mb-6">
                  {section.title}
                </h2>
                <nav className="space-y-3" role="navigation" aria-label={`${section.title} navigation`}>
                  {section.links.map((link) => (
                    <div key={link.name}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-muted-foreground hover:text-primary reverent-transition text-sm"
                        >
                          {link.name}
                          <span className="ml-1" role="img" aria-label="External link">🔗</span>
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="block text-muted-foreground hover:text-primary reverent-transition text-sm"
                        >
                          {link.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Search */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="font-body text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Use our search functionality or contact us for assistance in finding specific information.
            </p>

            <div className="max-w-md mx-auto">
              <div className="flex space-x-4">
                <Link
                  href="/mosc/contact-info"
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 reverent-transition"
                >
                  <span className="mr-2" role="img" aria-label="Contact">📞</span>
                  Contact Us
                </Link>
                <Link
                  href="/mosc"
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 reverent-transition"
                >
                  <span className="mr-2" role="img" aria-label="Home">🏠</span>
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SitemapPage;














