import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'The Parish Managing Committee',
  description: 'The local administrative body responsible for individual parish management.',
};

const ParishManagingCommitteePage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Parish Managing Committee">⛪</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              The Parish Managing Committee
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The local administrative body responsible for individual parish management.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                {/* Featured Image */}
                <div className="mb-8">
                  <Image
                    src="/images/administration/parish-managing-committee.jpg"
                    alt="The Parish Managing Committee"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Parish Managing Committee is the local administrative body responsible for the day-to-day 
                    management and administration of individual parishes. It serves as the executive body at the 
                    parish level and implements decisions made by the Parish General Body.
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Composition
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Parish Managing Committee typically consists of:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li className="font-body text-muted-foreground">The Parish Vicar (President)</li>
                    <li className="font-body text-muted-foreground">Elected lay members from the parish</li>
                    <li className="font-body text-muted-foreground">Representatives from various parish organizations</li>
                    <li className="font-body text-muted-foreground">Youth and women representatives</li>
                    <li className="font-body text-muted-foreground">Treasurer and Secretary</li>
                  </ul>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Responsibilities
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Parish Managing Committee is responsible for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li className="font-body text-muted-foreground">Managing parish finances and budgets</li>
                    <li className="font-body text-muted-foreground">Maintaining church properties and facilities</li>
                    <li className="font-body text-muted-foreground">Organizing parish activities and programs</li>
                    <li className="font-body text-muted-foreground">Coordinating with diocesan authorities</li>
                    <li className="font-body text-muted-foreground">Implementing parish policies and decisions</li>
                    <li className="font-body text-muted-foreground">Supporting spiritual and educational programs</li>
                    <li className="font-body text-muted-foreground">Managing parish staff and volunteers</li>
                  </ul>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Election Process
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Members of the Parish Managing Committee are elected by the Parish General Body through a 
                    democratic process. The election is conducted according to the constitution and by-laws of 
                    the parish, ensuring fair representation of all parish members.
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Term of Office
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The term of office for Parish Managing Committee members is typically three years, with 
                    provisions for re-election. This ensures continuity while allowing for fresh perspectives 
                    and leadership.
                  </p>

                  <div className="bg-muted/30 rounded-lg p-6">
                    <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                      Parish Governance Structure
                    </h3>
                    <p className="font-body text-muted-foreground leading-relaxed mb-4">
                      The Parish Managing Committee operates under the guidance of the Parish Vicar and reports 
                      to the Parish General Body. It maintains close coordination with diocesan authorities 
                      and follows the constitution and canons of the Malankara Orthodox Church.
                    </p>
                    <p className="font-body text-muted-foreground leading-relaxed">
                      This committee plays a vital role in ensuring the smooth functioning of parish activities, 
                      maintaining church properties, and fostering spiritual growth within the parish community.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-background rounded-lg sacred-shadow p-6 mb-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Administration Structure
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc/administration/administration" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Constitution of the Malankara Orthodox Church
                  </Link>
                  <Link 
                    href="/mosc/administration/he-canon-law-of-the-malankara-orthodox-church" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Canon Law of the Malankara Orthodox Church
                  </Link>
                  <Link 
                    href="/mosc/administration/the-holy-episcopal-synod" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Holy Episcopal Synod
                  </Link>
                  <Link 
                    href="/mosc/administration/malankara-association" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Malankara Association
                  </Link>
                  <Link 
                    href="/mosc/administration/the-managing-committee" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Managing Committee
                  </Link>
                  <Link 
                    href="/mosc/administration/the-working-committee" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Working Committee
                  </Link>
                  <Link 
                    href="/mosc/administration/the-diocesan-general-body" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Diocesan General Body
                  </Link>
                  <Link 
                    href="/mosc/administration/the-parish-managing-committee" 
                    className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
                  >
                    The Parish Managing Committee
                  </Link>
                  <Link 
                    href="/mosc/administration/the-parish-general-body" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Parish General Body
                  </Link>
                </nav>
              </div>

              {/* Quick Links */}
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Quick Links
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc/downloads/kalpana" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Kalpana
                  </Link>
                  <Link 
                    href="/mosc/downloads" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Downloads
                  </Link>
                  <Link 
                    href="/mosc/institutions" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Institutions
                  </Link>
                  <Link 
                    href="/mosc/training" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Training
                  </Link>
                  <Link 
                    href="/mosc/publications" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Publications
                  </Link>
                  <Link 
                    href="/mosc/spiritual" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Spiritual Organisations
                  </Link>
                  <Link 
                    href="/mosc/theological" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Theological Seminaries
                  </Link>
                  <Link 
                    href="/mosc/lectionary" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Lectionary
                  </Link>
                  <Link 
                    href="/mosc/gallery" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Gallery
                  </Link>
                  <Link 
                    href="/mosc/contact-info" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Contact Info
                  </Link>
                  <Link 
                    href="/mosc/faqs" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    FAQs
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ParishManagingCommitteePage;
