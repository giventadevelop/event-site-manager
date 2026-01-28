import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'The Managing Committee',
  description: 'The executive body responsible for day-to-day administration.',
};

const ManagingCommitteePage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Managing Committee">⚙️</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              The Managing Committee
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The executive body responsible for day-to-day administration.
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
                    src="/images/administration/managing-committee.jpg"
                    alt="The Managing Committee"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    In the Mulamthuruthy synod which formulated the Malankara association had laid down the provision for the 
                    managing committee, a smaller body to look into the financial and other administrative matters. The members 
                    are elected by the association, two priests and four lay people representing each Diocese are elected for a 
                    period of five years. Other than the elected members, a proportionate number of members are nominated to the 
                    Managing Committee by the Malankara Metropolitan. The members of the Working Committee are also members of 
                    the Managing Committee.
                  </p>

                  {/* Current Members Section */}
                  <div className="bg-muted/30 rounded-lg p-6 mb-6">
                    <h3 className="font-heading font-semibold text-xl text-foreground mb-4 text-center">
                      Present Members of the Committee
                    </h3>
                    <p className="font-body text-muted-foreground text-center mb-6">
                      <strong>2022-2027</strong>
                    </p>
                    <p className="font-body text-success text-center mb-6">
                      <strong>(ELECTED MEMBERS)</strong>
                    </p>

                    {/* Sample Members - You can expand this with all members from the legacy file */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-heading font-semibold text-lg text-foreground mb-3">THIRUVANANTHAPURAM</h4>
                        <div className="space-y-3">
                          <div className="bg-card rounded-lg p-4">
                            <p className="font-body text-muted-foreground">
                              <strong>Rev. Fr. Koshy Alexander Ashby</strong><br />
                              Vayalirakkathu, KP 612/7<br />
                              Kudappanakkunnu,<br />
                              Thiruvananthapuram - 695043<br />
                              Mob: 9447694840<br />
                              ashbykoshy@gmail.com
                            </p>
                          </div>
                          <div className="bg-card rounded-lg p-4">
                            <p className="font-body text-muted-foreground">
                              <strong>Rev. Fr. John Varghese</strong><br />
                              Panachamoottil<br />
                              Ayoor P.O, Kollam – 691 533<br />
                              Mob: 9495054966<br />
                              fr.johnv.ayoor@gmail.com
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-heading font-semibold text-lg text-foreground mb-3">KOLLAM</h4>
                        <div className="space-y-3">
                          <div className="bg-card rounded-lg p-4">
                            <p className="font-body text-muted-foreground">
                              <strong>Rev.Fr. Iype Ninan</strong><br />
                              Thekkedath House,<br />
                              Salempuram,<br />
                              Pathanapuram P.O. 689695.<br />
                              Mob: 9447561175<br />
                              friypeninan@gmail.com
                            </p>
                          </div>
                          <div className="bg-card rounded-lg p-4">
                            <p className="font-body text-muted-foreground">
                              <strong>Rev.Fr. Mathew Abraham</strong><br />
                              Kizhakkedathu Bethel,<br />
                              Perumpuzha P.O.,<br />
                              Kollam 691504.<br />
                              Mob: 9447905560<br />
                              frmathalavoor@gmail.com
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-heading font-semibold text-lg text-foreground mb-3">KOTTARAKKARA-PUNALUR</h4>
                        <div className="space-y-3">
                          <div className="bg-card rounded-lg p-4">
                            <p className="font-body text-muted-foreground">
                              <strong>Rev. Fr. Joseph Mathew</strong><br />
                              Kaleeckal Veedu,<br />
                              Elambal P.O., Punalur,<br />
                              Kollam 691322.<br />
                              Mob: 9447303821, 9446126340<br />
                              frjosephmathewelampal@gmail.com
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <p className="font-body text-muted-foreground text-sm">
                        <em>Note: This is a sample of committee members. The complete list includes representatives from all dioceses.</em>
                      </p>
                    </div>
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
                    className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
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

export default ManagingCommitteePage;
