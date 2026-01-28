import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'H.H. Baselios Augen I, The Fourth Catholicos of the East in Malankara (1964–1975)',
  description: 'Biography of His Holiness Baselios Augen I, the fourth Catholicos of the East in Malankara.',
};

const BaseliosAugenIPage = () => {
  return (
    <div className="bg-background text-foreground">
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
              <div className="bg-card rounded-lg sacred-shadow p-6 mb-8">
                <div className="flex flex-col items-center mb-6">
                  <Image
                    src="/images/catholicate/augen.jpg"
                    alt="H.H. Baselios Augen I"
                    width={300}
                    height={188}
                    className="rounded-lg mb-4 sacred-shadow-lg"
                  />
                  <h3 className="font-heading font-semibold text-2xl text-primary text-center">
                    His Holiness Baselios Augen I, The Fourth Catholicos of the East in Malankara (1964–1975)
                  </h3>
                </div>
                <div className="space-y-4 font-body text-muted-foreground leading-relaxed text-justify">
                  <p>
                    His Holiness was born on 26 June 1884 at Perumbavoor , Vengola, to Abraham Kathanar of Chettakulathukara family. He was ordained as deacon by Kadavil Paulose Mar Athanasios and in 1908 at Jerusalem he was elevated to the monastic order of Ramban. He was consecrated as Metropolitan Oughen Mar Timotheos on 15 May 1927 at Jerusalem. He was appointed as the fourth Metropolitan of Kandanad. He has left his imprint in several offices that he held during his life. He was principal of the Orthodox Theological Seminary, and the Metropolitan of Kandanad and Thumpamon dioseses. On 17 May 1962, when the Malankara Association met at Niranam, he was chosen as the Catholicate of the East. It was on 22 May 1964 at M.D. Seminary, Kottayam that he was installed formally as the fourth Catholicos. As he was very old, he relinquished his position as Malankara Metropolitan to his successor on 24 September 1975. Having achieved expectional scholarship in Malayalam and Syriac languages, he translated into Malayalam the 'Pemkisa Namaskaram' 'Prumiyonukal', ' Valiya    Nombilae Namaskaram', 'Pattamkoda Shushrusha Kramangal' and 'Pallikoodasha Kramangal'. He also composed the 'Hood- omakal' for 'Holy Synods' and the 'State after death'. He passed away on 8 December 1975 at Develokam Aramana and was laid to rest near the Aramana Chapel. His Annverary: 8 December.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar for navigation */}
            <div className="lg:w-1/4">
              <div className="bg-card rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                  Catholicate Pages
                </h3>
                <ul className="space-y-2 text-muted-foreground font-body">
                  <li>
                    <Link href="/mosc/catholicate/catholicate" className="hover:text-primary reverent-transition">
                      The Catholicate of the Malankara Orthodox Syrian Church
                    </Link>
                  </li>
                  <li>
                    <Link href="/mosc/catholicate/his-holiness-baselios-paulos-i-1st-catholicos-of-the-east-in-malankara" className="hover:text-primary reverent-transition">
                      H.H. Baselios Paulos I (1912–1913)
                    </Link>
                  </li>
                  <li>
                    <Link href="/mosc/catholicate/his-holiness-baselios-geevarghese-i-second-catholicos-of-the-east-in-malankara" className="hover:text-primary reverent-transition">
                      H.H. Baselios Geevarghese I (1925–1928)
                    </Link>
                  </li>
                  <li>
                    <Link href="/mosc/catholicate/his-holiness-baselios-geevarghese-ii-third-catholicos-of-the-east-in-malankara" className="hover:text-primary reverent-transition">
                      H.H. Baselios Geevarghese II (1929–1964)
                    </Link>
                  </li>
                  <li>
                    <Link href="/mosc/catholicate/his-holiness-baselios-oughen-i-the-fourth-catholicos-of-the-east-in-malankara" className="hover:text-primary reverent-transition">
                      H.H. Baselios Augen I (1964–1975)
                    </Link>
                  </li>
                  <li>
                    <Link href="/mosc/catholicate/his-holiness-baselios-marthoma-mathews-i-fifth-catholicos-of-the-east-in-malankara" className="hover:text-primary reverent-transition">
                      H.H. Baselios Marthoma Mathews I (1975–1991)
                    </Link>
                  </li>
                  <li>
                    <Link href="/mosc/catholicate/his-holiness-baselios-marthoma-mathews-ii-sixth-catholicos-of-the-east-in-malankara" className="hover:text-primary reverent-transition">
                      H.H. Baselios Marthoma Mathews II (1991–2005)
                    </Link>
                  </li>
                  <li>
                    <Link href="/mosc/catholicate/his-holiness-baselios-marthoma-didymos-i-seventh-catholicos-of-the-east-in-malankara" className="hover:text-primary reverent-transition">
                      H.H. Baselios Marthoma Didymos I (2005-2010)
                    </Link>
                  </li>
                  <li>
                    <Link href="/mosc/catholicate/h-h-baselios-marthoma-paulose-ii" className="hover:text-primary reverent-transition">
                      H.H. Baselios Marthoma Paulose II (2010–2021)
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BaseliosAugenIPage;
