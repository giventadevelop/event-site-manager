import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Liturgy & Worship',
  description: 'Our liturgical tradition and forms of worship.',
};

const LiturgyWorshipPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Liturgy & Worship">📿</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Liturgy & Worship
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our liturgical tradition and forms of worship.
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
                    src="/images/church/liturgy-worship.jpg"
                    alt="Liturgy & Worship"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <div className="bg-muted/30 rounded-lg p-6 mb-8">
                    <p className="font-body text-muted-foreground leading-relaxed text-center italic text-lg">
                      "We have seen the true Light, we have received the heavenly Spirit; we have found 
                      the true Faith, worshiping the undivided Trinity: for He has saved us."
                    </p>
                    <p className="font-body text-primary font-semibold text-center mt-2">
                      The Liturgy of St. John Chrysostom
                    </p>
                  </div>

                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    The Meaning of the Liturgy
                  </h2>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    When Moses led the people of Israel out of Egypt, he was given a very explicit set 
                    of instructions on how they were to worship the God who freed them. These instructions 
                    were revealed by God on Mount Sinai and are found in the books of Exodus, Leviticus, 
                    Numbers and Deuteronomy in the Old Testament. From this beginning arose the complex 
                    liturgical Temple worship of ancient Israel.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    In the New Testament, we find that Jesus' disciples, who were all Jewish, at first 
                    continued to worship in the Temple and afterwards gathered at a private home to celebrate 
                    the particularly Christian "breaking of bread," the Holy Eucharist.
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Early Christian Worship
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Christian life at that time is described in the Book of Acts as continuing "steadfastly 
                    in the apostle's doctrine and fellowship, in the breaking of bread, and in the prayers." 
                    Christians would "break bread" on the first day of the week, the day the Lord had risen 
                    from the dead.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Christians came to see their worship as the legitimate maturation of the worship given 
                    to Moses, supplanting the cult of the Temple in Jerusalem. Inasmuch as Christ had 
                    established a better covenant between God and the fallen world, He obtained for us 
                    "a more excellent liturgy": "For if [Jesus] were on earth, He would not be a priest, 
                    since there are priests who offer gifts according to the law (i.e., the Jewish priests 
                    in Jerusalem); who serve the copy and shadow of the heavenly things, as Moses was 
                    divinely instructed when he was about to make the tabernacle. For He said, 'See that 
                    you make all things according to the pattern shown you on the mountain.' But now He 
                    has obtained a more excellent ministry (leitourgias, or "liturgy" in English), inasmuch 
                    as He is also Mediator of a better covenant, which was established on better promises."
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Heavenly Worship
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Like the worship given to Moses, which as we read above was "a copy and shadow of the 
                    heavenly things," Christians also saw their liturgical worship as mirroring the worship 
                    of the heavenly hosts. As Saint Germanus, the eighth century Patriarch of Constantinople, 
                    would later put it, "The church is an earthly heaven in which the super-celestial God 
                    dwells and walks about."
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    The Etymology of Liturgy
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The word "liturgy" is a contraction of two Greek words, the word lakos meaning "common," 
                    as in "belonging to the people," and the word ergon, meaning "work." Thus "liturgy" 
                    refers to the work of the common people in praising God. In this work, the bishop or 
                    priest presides as an image, or icon, of Jesus Christ, conducting the worship along 
                    with the Faithful. In the words of Saint Ignatius, the third bishop of Antioch who 
                    was martyred around A.D. 110, "Wherever the bishop appears let the congregation also 
                    be present; just as wherever Jesus Christ is, there is the catholic (Greek: the "whole") 
                    Church."
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Biblical Foundation
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The word "liturgy" is routinely used in the New Testament, and is used as well in the 
                    Greek translation of the Old Testament known as the Septuagint (made in Alexandria).
                  </p>

                  <div className="bg-muted/30 rounded-lg p-6 mt-8">
                    <h4 className="font-heading font-semibold text-lg text-foreground mb-4">
                      Key Elements of Orthodox Liturgy
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-card rounded-lg p-4">
                        <h5 className="font-heading font-medium text-foreground mb-2">Holy Qurbana</h5>
                        <p className="font-body text-muted-foreground text-sm">
                          The Divine Liturgy - the central act of worship
                        </p>
                      </div>
                      <div className="bg-card rounded-lg p-4">
                        <h5 className="font-heading font-medium text-foreground mb-2">Liturgical Music</h5>
                        <p className="font-body text-muted-foreground text-sm">
                          Traditional Syriac chant and hymns
                        </p>
                      </div>
                      <div className="bg-card rounded-lg p-4">
                        <h5 className="font-heading font-medium text-foreground mb-2">Feast and Festivals</h5>
                        <p className="font-body text-muted-foreground text-sm">
                          Celebration of saints and holy days
                        </p>
                      </div>
                      <div className="bg-card rounded-lg p-4">
                        <h5 className="font-heading font-medium text-foreground mb-2">Liturgical Seasons</h5>
                        <p className="font-body text-muted-foreground text-sm">
                          The Church calendar and liturgical year
                        </p>
                      </div>
                      <div className="bg-card rounded-lg p-4">
                        <h5 className="font-heading font-medium text-foreground mb-2">Sacraments</h5>
                        <p className="font-body text-muted-foreground text-sm">
                          The seven holy mysteries of the Church
                        </p>
                      </div>
                      <div className="bg-card rounded-lg p-4">
                        <h5 className="font-heading font-medium text-foreground mb-2">West Syrian Worship</h5>
                        <p className="font-body text-muted-foreground text-sm">
                          Traditional Antiochian liturgical practices
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-6 mt-8">
                    <h4 className="font-heading font-semibold text-lg text-foreground mb-4">
                      The Purpose of Liturgy
                    </h4>
                    <p className="font-body text-muted-foreground leading-relaxed">
                      The Orthodox liturgy is not merely a ceremony or ritual, but a participation in 
                      the eternal worship of heaven. Through the liturgy, we join with the angels and 
                      saints in praising God, and we receive the grace and blessings of the Holy Spirit. 
                      The liturgy transforms us and brings us closer to God, making us partakers of 
                      the divine nature.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-background rounded-lg sacred-shadow p-6 mb-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  The Church
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc/the-church/what-do-we-believe" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    What Do We Believe
                  </Link>
                  <Link 
                    href="/mosc/the-church/church-history" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Church History
                  </Link>
                  <Link 
                    href="/mosc/the-church/orthodox-faith" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Orthodox Faith
                  </Link>
                  <Link 
                    href="/mosc/the-church/liturgy-worship" 
                    className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
                  >
                    Liturgy & Worship
                  </Link>
                  <Link 
                    href="/mosc/the-church/sacraments" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Sacraments
                  </Link>
                  <Link 
                    href="/mosc/the-church/church-calendar" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Church Calendar
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

export default LiturgyWorshipPage;
