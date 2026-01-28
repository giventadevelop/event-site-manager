import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'H.H. Baselios Paulos I - The First Catholicos of the East in Malankara (1912–1913)',
  description: 'Learn about His Holiness Baselios Paulos I, the first Catholicos of the East in Malankara, his life, ministry, and historical significance.',
};

const BaseliosPaulosIPage = () => {
  const catholicosLinks = [
    {
      name: 'The Catholicate Overview',
      href: '/mosc/catholicate/catholicate'
    },
    {
      name: 'H.H. Baselios Geevarghese I',
      period: '1925–1928',
      description: 'The Second Catholicos of the East in Malankara',
      href: '/mosc/catholicate/his-holiness-baselios-geevarghese-i-second-catholicos-of-the-east-in-malankara'
    },
    {
      name: 'H.H. Baselios Geevarghese II',
      period: '1929–1964',
      description: 'The Third Catholicos of the East in Malankara',
      href: '/mosc/catholicate/his-holiness-baselios-geevarghese-ii-third-catholicos-of-the-east-in-malankara'
    },
    {
      name: 'H.H. Baselios Augen I',
      period: '1964–1975',
      description: 'The Fourth Catholicos of the East in Malankara',
      href: '/mosc/catholicate/his-holiness-baselios-oughen-i-the-fourth-catholicos-of-the-east-in-malankara'
    },
    {
      name: 'H.H. Baselios Marthoma Mathews I',
      period: '1975–1991',
      description: 'The Fifth Catholicos of the East in Malankara',
      href: '/mosc/catholicate/his-holiness-baselios-marthoma-mathews-i-fifth-catholicos-of-the-east-in-malankara'
    },
    {
      name: 'H.H. Baselios Marthoma Mathews II',
      period: '1991–2005',
      description: 'The Sixth Catholicos of the East in Malankara',
      href: '/mosc/catholicate/his-holiness-baselios-marthoma-mathews-ii-sixth-catholicos-of-the-east-in-malankara'
    },
    {
      name: 'H.H. Baselios Marthoma Didymos I',
      period: '2005-2010',
      description: 'The Seventh Catholicos of the East in Malankara',
      href: '/mosc/catholicate/his-holiness-baselios-marthoma-didymos-i-seventh-catholicos-of-the-east-in-malankara'
    },
    {
      name: 'H.H. Baselios Marthoma Paulose II',
      period: '2010–2021',
      description: 'The Eighth Catholicos of the East in Malankara',
      href: '/mosc/catholicate/h-h-baselios-marthoma-paulose-ii'
    }
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Crown">👑</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              H.H. Baselios Paulos I
            </h1>
            <p className="font-body text-lg text-primary mb-2 font-medium">
              The First Catholicos of the East in Malankara
            </p>
            <p className="font-body text-lg text-muted-foreground">
              1912–1913
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <div className="mb-8">
                  <Image
                    src="/images/catholicate/Untitled-11.jpg"
                    alt="H.H. Baselios Paulos I, The First Catholicos of the East in Malankara"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow mb-6"
                    priority
                  />
                </div>

                <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
                  <div>
                    <h2 className="font-heading font-semibold text-2xl text-primary mb-4">
                      Biography
                    </h2>
                    <p>
                      His Holiness was born on 19 January 1836 to Murimattom Kurian and Mariamma in Kolencherry.
                      He received deaconship from Cheppad Mar Dionysius in 1843 and in 1852 he was ordained as Priest
                      by Metropolitan Yuyakim Mar Kurilos. He served for a long period as Vicar of Kolencherry Church.
                    </p>
                    <p>
                      On 17th May 1877, His Holiness Patriarch Pathrose consecrated him as Paulose Mar Ivanios at
                      Cherallayam Palli, Kunnam kulam and appointed him as Metropolitan of Kandanad diocese.
                    </p>
                    <p>
                      On 15th September 1912, His Holiness Patriarch Abdhedh Messiah with the co-operation of
                      Vattasseril Geevarghese Mar Dionysios Metropolitan and Geevarghese Mar Gregorios Metropolitan
                      elevated him to the Apostolic throne of St. Thomas as Catholicos of Malankara church.
                    </p>
                    <p>
                      He passed away on 2 May 1913. He was laid to rest in Pampakuda Cheriya Palli.
                      His death Anniversary is on 3rd May.
                    </p>
                  </div>

                  <div>
                    <h2 className="font-heading font-semibold text-2xl text-primary mb-4">
                      Historical Significance
                    </h2>
                    <p>
                      His Holiness Baselios Paulos I holds a unique place in the history of the Malankara Orthodox Syrian Church
                      as the first Catholicos of the East in Malankara. His consecration marked a pivotal moment in the church's
                      journey toward ecclesiastical independence and self-governance.
                    </p>
                    <p>
                      The establishment of the Catholicate in 1912 was a response to the challenges faced by the Malankara Church
                      and represented the culmination of centuries of spiritual and administrative development within the Indian Orthodox tradition.
                    </p>
                  </div>

                  <div>
                    <h2 className="font-heading font-semibold text-2xl text-primary mb-4">
                      Legacy
                    </h2>
                    <p>
                      Though his tenure as Catholicos was brief, His Holiness Baselios Paulos I laid the foundation for the
                      Catholicate tradition that continues to guide the Malankara Orthodox Syrian Church today. His consecration
                      established the apostolic succession and ecclesiastical authority that has been carried forward by
                      subsequent Catholicos throughout the church's history.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Catholicos Links */}
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                  Catholicate History
                </h3>
                <div className="space-y-3">
                  {catholicosLinks.map((catholicos, index) => (
                    <Link
                      key={catholicos.name}
                      href={catholicos.href}
                      className={`block p-3 rounded-lg hover:bg-muted/50 reverent-transition group ${index === 0 ? 'bg-primary/5 border border-primary/20' : ''
                        }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 reverent-transition">
                          <span className="text-sm text-primary" role="img" aria-label="Catholicos">👑</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading font-medium text-sm text-foreground group-hover:text-primary reverent-transition">
                            {catholicos.name}
                          </h4>
                          {catholicos.period && (
                            <p className="font-body text-xs text-primary font-medium">
                              {catholicos.period}
                            </p>
                          )}
                          {catholicos.description && (
                            <p className="font-body text-xs text-muted-foreground">
                              {catholicos.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Facts */}
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                  Quick Facts
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-foreground">Born:</span>
                    <p className="text-sm text-muted-foreground">19 January 1836</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Consecrated:</span>
                    <p className="text-sm text-muted-foreground">15 September 1912</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Reign:</span>
                    <p className="text-sm text-muted-foreground">1912–1913</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Passed Away:</span>
                    <p className="text-sm text-muted-foreground">2 May 1913</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Resting Place:</span>
                    <p className="text-sm text-muted-foreground">Pampakuda Cheriya Palli</p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <Link href="/mosc/catholicate" className="block text-sm text-muted-foreground hover:text-primary reverent-transition">
                    The Catholicate
                  </Link>
                  <Link href="/mosc/holy-synod" className="block text-sm text-muted-foreground hover:text-primary reverent-transition">
                    Holy Synod
                  </Link>
                  <Link href="/mosc/dioceses" className="block text-sm text-muted-foreground hover:text-primary reverent-transition">
                    Dioceses
                  </Link>
                  <Link href="/mosc/gallery" className="block text-sm text-muted-foreground hover:text-primary reverent-transition">
                    Photo Gallery
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BaseliosPaulosIPage;
