import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'The Diocesan General Body',
  description: 'The governing body at the diocesan level representing all parishes in a diocese.',
};

const DiocesanGeneralBodyPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Diocesan General Body">🏢</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              The Diocesan General Body
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The governing body at the diocesan level representing all parishes in a diocese.
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
                    src="/images/administration/diocesan-general-body.jpg"
                    alt="The Diocesan General Body"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Diocesan General Body is the governing body at the diocesan level representing all parishes 
                    in a diocese. It consists of representatives from all parishes within the diocese and plays a 
                    crucial role in diocesan administration and decision-making.
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Composition
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Diocesan General Body includes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li className="font-body text-muted-foreground">The Diocesan Metropolitan (President)</li>
                    <li className="font-body text-muted-foreground">Representatives from each parish in the diocese</li>
                    <li className="font-body text-muted-foreground">Diocesan clergy members</li>
                    <li className="font-body text-muted-foreground">Lay representatives elected by parish members</li>
                  </ul>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Functions
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Diocesan General Body is responsible for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li className="font-body text-muted-foreground">Electing diocesan officers and committee members</li>
                    <li className="font-body text-muted-foreground">Approving diocesan budgets and financial matters</li>
                    <li className="font-body text-muted-foreground">Making decisions on diocesan policies and programs</li>
                    <li className="font-body text-muted-foreground">Overseeing diocesan institutions and activities</li>
                    <li className="font-body text-muted-foreground">Representing the diocese at higher church levels</li>
                  </ul>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Meetings
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Diocesan General Body meets regularly to discuss and decide on matters pertaining to the 
                    diocese. These meetings provide a forum for parishes to voice their concerns and participate 
                    in diocesan governance.
                  </p>

                  <div className="bg-muted/30 rounded-lg p-6">
                    <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                      Diocesan Structure
                    </h3>
                    <p className="font-body text-muted-foreground leading-relaxed mb-4">
                      Each diocese is organized with its own General Body that operates under the guidance of 
                      the Diocesan Metropolitan and follows the constitution and canons of the Malankara Orthodox Church.
                    </p>
                    <p className="font-body text-muted-foreground leading-relaxed">
                      The Diocesan General Body serves as a bridge between individual parishes and the central 
                      church administration, ensuring that local needs and concerns are addressed while maintaining 
                      unity with the broader church structure.
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
                    className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
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

export default DiocesanGeneralBodyPage;
