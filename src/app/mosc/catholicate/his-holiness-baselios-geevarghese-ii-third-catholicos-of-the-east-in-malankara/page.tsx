import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'H.H. Baselios Geevarghese II, The Third Catholicos of the East in Malankara (1929–1964)',
  description: 'Biography of His Holiness Baselios Geevarghese II, the third Catholicos of the East in Malankara.',
};

const BaseliosGeevargheseIIPage = () => {
  return (
    <div className="bg-background text-foreground">
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
              <div className="bg-card rounded-lg sacred-shadow p-6 mb-8">
                <div className="flex flex-col items-center mb-6">
                  <Image
                    src="/images/catholicate/geevar.jpg"
                    alt="H.H. Baselios Geevarghese II"
                    width={300}
                    height={188}
                    className="rounded-lg mb-4 sacred-shadow-lg"
                  />
                  <h3 className="font-heading font-semibold text-2xl text-primary text-center">
                    His Holiness Baselios Geevarghese II, The Third Catholicos of the East in Malankara (1929–1964)
                  </h3>
                </div>
                <div className="space-y-4 font-body text-muted-foreground leading-relaxed text-justify">
                  <p>
                    His Holiness was born to Ulahannan and Naithi of Kallaserri family in Kurichi, Kottayam on 16 June 1874. On 24 April 1892, Kadavil Paulose Mar Athanasios ordained him as deacon and on 24 November and 27 November 1898 he was ordained as priest and Ramban (Monk) respectively by St.Gregorios. As per the order of St. Gregorios, he resided in Kadambanad church and took charge of the southern dioceses. He also served as Manager and Malpan of Old Seminary. He published books like "Sahodaran- marude Charithram". "Rehasya Prarthanakal". "Parudaisa", and "Mar Yuhanon Mamdana". On 8 September 1912, His Holiness Patriarch Abdhedh Meshiah consecrated him as Metropolitan Geevarghese Mar Gregorios at Parumala Seminary. He was appointed as the Metropolitan of Thumpamon, Kollam and Niranam dioceses. On 15 February 1929. With the Malankara Metropolitan Vattaserril Geevarghese Mar Dionysios as the chief priest, he was installed as the Catholicos of the East. When the Association met on 24 December 1934 at M. D. Seminary, Kottayam, he was chosen as Malankara Metropolitan. It was a period when issues became very complex. Through prayer and fasting he received strength from God to lead his people for long years, courageously, inspiring his people to work for their church and for the glory of God. Following the peace pact of 1958, he had the good fortune to guide the destiny of the unified Malankara Church. Apart from consecrating twelve Meropolitans, and ordaining more than thousand priests and deacons, he founded and consecrated many churches. On 22 April 1932 and on 20 April 1951 he conducted the 'Mooron Koodasha' (Chrism Consecration) at the Old Seminary. On 2 November 1947 he declared Geevarghese Mar Gregorios and Yeldo Mar Baselios as Saints. From his time onwards the offices of Catholicos and Malankara Metropolitan came to repose in one and the same person. The deep spirituality and wisdom of this Catholicos earned him the title "Valiya Bava," or "The Great Catholicos." Shedding luster like a Beacon illuminating the history of the church, he led it from glory to glory. He entered the eternal realms on 3 January 1964 at Develokam Aramana He was laid to rest beside the Devalokam Aramana Chapel. His Anniversary is 3 January.
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

export default BaseliosGeevargheseIIPage;
