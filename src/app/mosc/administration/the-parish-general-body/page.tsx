import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'The Parish General Body',
  description: 'The general assembly of all parish members for decision-making.',
};

const ParishGeneralBodyPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Parish General Body">👨‍👩‍👧‍👦</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              The Parish General Body
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The general assembly of all parish members for decision-making.
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
                    src="/images/administration/parish-general-body.jpg"
                    alt="The Parish General Body"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Parish General Body is the supreme decision-making body at the parish level, consisting 
                    of all baptized members of the parish who are eligible to participate in parish governance. 
                    It serves as the democratic foundation of parish administration.
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Membership
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    All baptized members of the parish who meet the following criteria are eligible to be members 
                    of the Parish General Body:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li className="font-body text-muted-foreground">Must be baptized in the Malankara Orthodox Church</li>
                    <li className="font-body text-muted-foreground">Must be regular attendees of parish services</li>
                    <li className="font-body text-muted-foreground">Must be at least 18 years of age</li>
                    <li className="font-body text-muted-foreground">Must be in good standing with the parish</li>
                    <li className="font-body text-muted-foreground">Must have contributed to parish activities</li>
                  </ul>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Functions and Powers
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Parish General Body has the authority to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li className="font-body text-muted-foreground">Elect members of the Parish Managing Committee</li>
                    <li className="font-body text-muted-foreground">Approve annual budgets and financial reports</li>
                    <li className="font-body text-muted-foreground">Make decisions on major parish projects and initiatives</li>
                    <li className="font-body text-muted-foreground">Approve changes to parish constitution and by-laws</li>
                    <li className="font-body text-muted-foreground">Decide on matters affecting the entire parish community</li>
                    <li className="font-body text-muted-foreground">Review and approve parish policies and programs</li>
                    <li className="font-body text-muted-foreground">Elect representatives to diocesan bodies</li>
                  </ul>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Meetings
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Parish General Body meets regularly throughout the year:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li className="font-body text-muted-foreground">Annual General Meeting - for elections and major decisions</li>
                    <li className="font-body text-muted-foreground">Special General Meetings - for urgent matters</li>
                    <li className="font-body text-muted-foreground">Regular meetings - for ongoing parish business</li>
                  </ul>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Decision Making Process
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Decisions in the Parish General Body are made through democratic processes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li className="font-body text-muted-foreground">Majority vote for most decisions</li>
                    <li className="font-body text-muted-foreground">Two-thirds majority for constitutional changes</li>
                    <li className="font-body text-muted-foreground">Consensus building for important matters</li>
                    <li className="font-body text-muted-foreground">Open discussion and debate on all issues</li>
                  </ul>

                  <div className="bg-muted/30 rounded-lg p-6">
                    <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                      Democratic Foundation
                    </h3>
                    <p className="font-body text-muted-foreground leading-relaxed mb-4">
                      The Parish General Body represents the democratic foundation of the Malankara Orthodox Church 
                      at the local level. It ensures that all parish members have a voice in parish governance and 
                      that decisions are made collectively by the community.
                    </p>
                    <p className="font-body text-muted-foreground leading-relaxed">
                      This body maintains the connection between individual parish members and the broader church 
                      structure, ensuring that local needs and concerns are addressed while maintaining unity with 
                      the universal church.
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
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Parish Managing Committee
                  </Link>
                  <Link 
                    href="/mosc/administration/the-parish-general-body" 
                    className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
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

export default ParishGeneralBodyPage;
