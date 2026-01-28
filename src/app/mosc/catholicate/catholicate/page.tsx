import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'The Catholicate of the Malankara Orthodox Syrian Church',
  description: 'Learn about the Catholicate of the Malankara Orthodox Syrian Church, its historical development, and significance in the Orthodox tradition.',
};

const CatholicateOverviewPage = () => {
  const catholicosLinks = [
    {
      name: 'H.H. Baselios Paulos I',
      period: '1912–1913',
      description: 'The First Catholicos of the East in Malankara',
      href: '/mosc/catholicate/his-holiness-baselios-paulos-i-1st-catholicos-of-the-east-in-malankara'
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
              The Catholicate of the Malankara Orthodox Syrian Church
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The Catholicate represents the highest spiritual and administrative authority in the Malankara Orthodox Syrian Church,
              embodying the apostolic succession and ecclesiastical governance of our ancient tradition.
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
                    src="/images/catholicate/Untitled-1.jpg"
                    alt="The Catholicate of the Malankara Orthodox Syrian Church"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow mb-6"
                    priority
                  />
                </div>

                <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
                  <div>
                    <h2 className="font-heading font-semibold text-2xl text-primary mb-4">
                      Introduction
                    </h2>
                    <p>
                      The word 'Catholicos' means "the general head" or "general bishop". It can be considered as equivalent to "universal Bishop".
                      This title and rank is much more ancient than the title Patriarch in the church.
                    </p>
                    <p>
                      In the ministry of the early church there were only three ranks namely; Episcopos (Bishop), Priest and Deacon.
                      By the end of the third century or by the beginning of the fourth century certain bishops of certain important cities
                      or provincial capitals in the Roman empire gained pre-eminence than other bishops and they came to be known as Metropolitans.
                      The Ecumenical councils of the fourth century recognized the authority of these Metropolitans.
                    </p>
                    <p>
                      By the fifth century the Bishops in major cities like Rome, Constantinople, Alexandria, Antioch etc. gained control over
                      the churches in the surrounding cities. Gradually they became the heads of each independent regional church and were called
                      Patriarch which means 'common father'. The same rank in the Churches outside the Roman Empire was called Catholicos.
                      There were three ancient Catholicates in the Church before the fifth century. They were the Catholicate of the East (Persia),
                      the Catholicate of Armenia and the Catholicate of Georgia. None of these ranks and titles are the monopoly of any church.
                      Any Apostolic and national church has the authority to declare and call its head, Catholicose, Pope, or Patriarch.
                    </p>
                  </div>

                  <div>
                    <h2 className="font-heading font-semibold text-2xl text-primary mb-4">
                      Historical Development of Catholicate in India
                    </h2>

                    <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                      Archdeacons
                    </h3>
                    <p>
                      In India St.Thomas founded the church and appointed prelates to continue apostolic ministry in the church.
                      It is believed that the prelates were appointed from four ancient families namely, Pakalomattom, Sankarapuri, Kalli, and Kaliankal.
                      Gradually the Pakalomattom family gained prominence in the ministry and chief prelates of the community were hailed from that family.
                    </p>
                    <p>
                      The Arch deacon of the community was the unquestioned social and political leader and he got even local soldiers under his command
                      to protect himself and protect the interest of the community. The Arch deacon was the unquestioned leader of the community when
                      the Portuguese arrived Malabar in the 16th century.
                    </p>

                    <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                      The Archdeacon as Bishop
                    </h3>
                    <p>
                      After the coonan cross oath the Church ordained the Arch deacon as a bishop with the name Mar Thoma I.
                      This ordination of the archdeacon as a bishop was a very important turning point in the history of the development
                      of authority in the Malankara Church. All the powers of the century old arch deacon with some more spiritual authority
                      was given to the Archdeacon when he was elevated to the position of a bishop.
                    </p>
                    <p>
                      The Marthoma Metrans continued in succession till the early 19th century with the names Mar Thoma I,II,etc.
                      till Mar Thoma VIII. and they ruled the church from 1653 to 1816. The spiritual as well as the administrative
                      authority of the community were vested on the Mar Thoma Metrans during this period.
                    </p>

                    <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                      Malankara Metropolitan
                    </h3>
                    <p>
                      In 1816 Pulikottil Joseph Mar Dioysius became a bishop and he got an approval letter known as the Royal Proclamation
                      from the Travancore government to function as the Metropolitan of the community. Now onwards the head of the Church
                      came to be known as Malankara Metropolitan. The position of the Malanakara Metropolitan in the 19th century is a growth
                      from the position of the Marthoma Metrans.
                    </p>

                    <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                      The way to Catholicate
                    </h3>
                    <p>
                      After the synod of Mulanthuruthy the Church became more conscious about establishing a Catholicate (Maphrianate)
                      in the Malanakra Church mainly to avoid unnecessary interference of the Patriarch of Antioch in the internal affairs of the Church.
                    </p>

                    <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                      The consecration of the Catholicose
                    </h3>
                    <p>
                      On 15th September 1912, at St. Marys Church founded by St.Thomas in Niranam, Mar Ivanios Metropolitan was consecrated
                      with the name Mar Baselios Paulose First as the first Catholicose of Malankara Church. The chief celebrant of the consecration
                      ceremony was the Patriarch Mar Abdedmassiah himself. After the consecration the Patriarch issued two Kalpanas declaring the importance,
                      privileges, powers and functions of the Catholicose.
                    </p>
                    <p>
                      By the consecration of the Catholicose the Indian Church asserted and declared its full autonomy and became a full autocephalous
                      (having its own head) Church.
                    </p>

                    <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                      Conclusion
                    </h3>
                    <p>
                      The Catholicate in India was a growth and development through centuries within the Malankara Church. Of course the developments
                      in other churches like Persia, Antioch Rome and external interferences has influenced the growth in different stages.
                    </p>
                    <p>
                      It should always be considered as a symbol of Apostolic origin, authority and heritage as well as nationality and independence
                      of the Malankara Orthodox Church. Throughout centuries the Metropolitan heads of the Thomas Christians were known as the apostolic
                      successors of St.Thomas, the founder of the Indian church.
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
                  Historical Catholicos
                </h3>
                <div className="space-y-3">
                  {catholicosLinks.map((catholicos) => (
                    <Link
                      key={catholicos.name}
                      href={catholicos.href}
                      className="block p-3 rounded-lg hover:bg-muted/50 reverent-transition group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 reverent-transition">
                          <span className="text-sm text-primary" role="img" aria-label="Catholicos">👑</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading font-medium text-sm text-foreground group-hover:text-primary reverent-transition">
                            {catholicos.name}
                          </h4>
                          <p className="font-body text-xs text-primary font-medium">
                            {catholicos.period}
                          </p>
                          <p className="font-body text-xs text-muted-foreground">
                            {catholicos.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <Link href="/mosc/holy-synod" className="block text-sm text-muted-foreground hover:text-primary reverent-transition">
                    Holy Synod
                  </Link>
                  <Link href="/mosc/dioceses" className="block text-sm text-muted-foreground hover:text-primary reverent-transition">
                    Dioceses
                  </Link>
                  <Link href="/mosc/administration" className="block text-sm text-muted-foreground hover:text-primary reverent-transition">
                    Administration
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

export default CatholicateOverviewPage;
