import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'What Do We Believe',
  description: 'Our fundamental beliefs and Orthodox Christian doctrine.',
};

const WhatDoWeBelievePage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="What Do We Believe">📖</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              What Do We Believe
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our fundamental beliefs and Orthodox Christian doctrine.
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
                    src="/images/church/what-do-we-believe.jpg"
                    alt="What Do We Believe"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    What do the Orthodox Believe?
                  </h2>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    It is more to ask: "in whom do we put our trust?" "Believe" is a very vague word. 
                    Often it means simply holding an opinion without demonstrable evidence. But our faith 
                    is not an opinion, not one of many possible views. It is an affirmation of what 
                    ultimate reality is-dependable, trustable reality.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    We do not put our trust either in the ancient character of our Church or in any 
                    dogmas or doctrines. Our trust is in the One True God-Father, Son and Holy Spirit, 
                    eternal, self-existent, indivisible, infinite, incomprehensible, glorious, holy, 
                    not created or owing his being to something else, all-sovereign, Creator of the 
                    whole universe. All things are from Him. We too have our being from Him, acknowledge 
                    him as the source of our being. Of the being of all else, of all good and therefore 
                    worthy of adoration and praise perpetual.
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    The Trinity
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    About the First Person of the Trinity, the Father we know only what the Son and 
                    the Spirit have revealed to us, and still continue to reveal. The knowledge or 
                    statable doctrine, but true worship in the community of Faith. True knowledge of 
                    God comes through the quality of our life than through intellectual clarification. 
                    Some things, however we can affirm conceptually, knowing well that these concepts 
                    do not fully conform to reality.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The Trune God is beyond all conceptual comprehension not only by human beings, 
                    but by any created mind. He is, in a way different from the way anything else in 
                    creation is. We know the Trune God, not because we have comprehended His being or 
                    isness, but through His operations or activities, the energies of God which come 
                    down to us through the Incarnate Son and through the Holy Spirit. The Trune God, 
                    Father, Son and Holy Spirit, share the same is-ness; their being is one-infinite, 
                    eternal, uncreated, self-existent, with three persons or centres of consciousness 
                    and response, always acting in concord and unison as one being. There is no gap 
                    or interval of time or space between the three persons; there is no senior or 
                    junior; greater or lesser.
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Jesus Christ
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    We believe that Jesus Christ the Son of God became a human being, rules in the 
                    universe. All power in heaven (the aspects of the universe now not open to our 
                    senses) and on earth (that is, the universe in all-its tangible, sensible aspects) 
                    is given to Jesus Christ the God-Man. Death and Evil have been overcome, but they 
                    are still allowed to function, serving Christ's purposes. They will disappear-love 
                    and life will triumph-this is the faith of the Church, and this we affirm.
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    The Holy Spirit
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    For us the Holy Spirit is Life-giver, Sanctifier and perfecter. We do think in 
                    terms of sin and grace, but the central category in our understanding of salvation 
                    is the life-giving Spirit. It is He who effects forgiveness of sins, removes 
                    barriers between human beings as well as between them and God, gives life, makes 
                    people more holy and God-like, and draws us to perfection. He works in the Church, 
                    through His special gifts, to build up the body of Christ and to make its members 
                    holy. He also works in the Creation, bringing all things to their fullness and 
                    perfection.
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    The Church
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    We believe in the Church, all who acknowledge the Niceno Constantinopolitan creed 
                    do. The Church is the great consequence of the Son of God becoming flesh. It is 
                    this community that not only bears witness to Christ, but also is the abode of 
                    Christ, Christ dwelling in the Church, which is His body. It is in the Church 
                    that the life-giving power of the Spirit is at work.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    But the Church is not simply the community believers gathered together. It is a 
                    reality which spans heaven and earth, the risen Christ himself as chief cornerstone, 
                    the Apostles and Prophets as foundation, and all who belong to Christ from Adam 
                    to second coming being members of this one, holy Catholic apostolic community.
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    The Blessed Virgin Mary
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Of the great Saints in the Church, the first (after Christ) and unique place goes 
                    to the Blessed Virgin Mary, for she was the first to hear the Gospel of the 
                    Incarnation of our Lord from the Archangel, and to receive Him, on behalf of all 
                    of us human beings, into her womb. She is the mother of Christ, and thus mother 
                    of all the faithful who are joint-heirs with Christ. But she is also the Theotokos, 
                    the Godbearer, for the one whom she bore in her womb was truly God himself.
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Salvation and Mysteries
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Salvation for us means more than escaping hell and going to heaven. It means 
                    separation from evil and growth in the good. It means eternal life with true 
                    holiness and righteousness. It means also being united with Christ in his divine-human 
                    nature, in his sonship and rule over the universe. It means becoming more and more 
                    God-like in love, power and wisdom. This is what the Holy spirit makes possible. 
                    What is humanly impossible becomes reality by the grace and power of God.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    The participation in Christ's body and His being and nature becomes possible, by 
                    the grace of God, by the Holy Spirit, through the "mysteries of the Church" (roze-d-idtho 
                    in Syriac), which are called Sacraments in the West. These mysteries, mainly Baptism 
                    -Chrismation-Eucharist, are acts in the community of Faith by which the eternal and 
                    eschatological (i.e. pertaining to the last times) reality of our oneness with Christ 
                    becomes experienced by faith in the Church, in time, here and now.
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Scripture and Tradition
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    We hold the Bible in very high regard. The Gospel is the Word of Life, the proclamation 
                    of life and salvation to the world. We hold the Scriptures in the highest respect, 
                    and no other writings can have the same standing, for the primary witness to Christ 
                    is in the Scriptures. We revere the Scriptures as the inspired Word of God, and all 
                    our prayers, as well as the services of the mysteries of the Church are saturated 
                    with Biblical reference, and always completed by the public reading of the Scriptures.
                  </p>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    For us Tradition is not something old, static, and life-less; it is the life of the 
                    Church as a counting body, with the presence of Christ and the Holy Spirit in it. 
                    It is the Spirit that makes the Tradition alive and it bears witness to Christ; 
                    it also moves forward in expectation of the final fulfillment. Hence Tradition for 
                    us is dynamic. It includes knowledge of Christ, the teaching of the Apostles, the 
                    doctrine of the Saints and fathers, the practices of worship developed by the 
                    community of faith, its way of doing things and practicing love. Scripture is part 
                    of this tradition. Tradition is not just a body of knowledge, but a way of life 
                    and worship and service.
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                    Our Hope
                  </h3>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    Our hope is focused on Christ's coming again. It is only in that coming that evil 
                    would be separated from good, death from life, so that the good can triumph eternally 
                    and grow eternally also. In that coming there will be a reconstitution of the universe; 
                    all things shall be made new; evil shall be banished. Death and darkness would be 
                    finally overcome; light and life and love will triumph.
                  </p>

                  <div className="bg-muted/30 rounded-lg p-6 mt-8">
                    <p className="font-body text-muted-foreground leading-relaxed text-center italic">
                      It is our task to bear witness to this final reality, while living it out here 
                      and now, as much as we can, beset as we are by sin and frailty.
                    </p>
                    <p className="font-body text-primary font-semibold text-center mt-4">
                      Thy Kingdom Come Lord. And when Thou comest in Thy Kingdom, remember us poor sinners also.
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
                    className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
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
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
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

export default WhatDoWeBelievePage;
