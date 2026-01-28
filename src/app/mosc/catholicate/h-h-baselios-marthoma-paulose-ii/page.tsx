import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'H.H. Baselios Marthoma Paulose II, The Eighth Catholicos of the East in Malankara (2010–2021)',
  description: 'Biography of His Holiness Baselios Marthoma Paulose II, the eighth Catholicos of the East in Malankara.',
};

const BaseliosMarthomaPauloseIIPage = () => {
  return (
    <div className="bg-background text-foreground">
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
              <div className="bg-card rounded-lg sacred-shadow p-6 mb-8">
                <div className="flex flex-col items-center mb-6">
                  <Image
                    src="/images/catholicate/bava.jpg"
                    alt="H.H. Baselios Marthoma Paulose II"
                    width={300}
                    height={188}
                    className="rounded-lg mb-4 sacred-shadow-lg"
                  />
                  <h3 className="font-heading font-semibold text-2xl text-primary text-center">
                    H.H. Baselios Marthoma Paulose II, The Eighth Catholicos of the East in Malankara (2010–2021)
                  </h3>
                </div>
                <div className="space-y-4 font-body text-muted-foreground leading-relaxed text-justify">
                  <p>
                    His Holiness Baselios MarthomaPaulose II was enthroned as the Catholicos of the East & Malankara Metropolitan (the Supreme Head of the Malankara Orthodox Syrian Church of India) on Monday, 1st November 2010. His Holiness is the 91st Primate on the Apostolic Throne of St. Thomas. Born on 30th August 1946 in a village called Mangad near Kunnamkulam, Trissur District, Kerala as the son of the late Kollannur Iype and the late Pulikkottil Kunjeetty, the boy K.I.Paul had his early education in local schools. After graduating from St. Thomas College, Trichur, Paul joined the Orthodox Theological Seminary, Kottayam from where he obtained G.S.T and B.D. degrees of the Serampore University. After taking the holy orders, he joined C.M.S College, Kottayam and took his M.A in Sociology.
                  </p>
                  <p>
                    At the young age of 36, the church Parliament (Malankara Syrian Christian Association) elected Fr. K.I.Paul as Bishop. On 15th May 1985, he was consecrated as Episcopa ( bishop) with the new name Paulose Mar Milithios. Subsequently, His Grace was elevated as the first Metropolitan of the newly formed Kunnamkulam diocese on 1st August 1985. The Malankara Syrian Christian Association held at Parumala on 12th October 2006 unanimously elected Ills Grace Paulose Mar Milithios Metropolitan as the Catholicos Designate and the successor to the Malankara Metropolitan. On 1st November 2010, following the abdication of his predecessor, His lloliness Baselios Marthoma Didymus I. His Grace Paulose Mar Milithios Metropolitan was enthroned as the Catholicos of the East & Malankara Metropolitan with the new name His Holiness Baselios Marthoma Paulose II. Incidentally, Kunnamkulam which is a stronghold of the Orthodox Community in Kerala has given birth to three Malankara Metropolitans including the reigning Catholicos. His Holiness' illustrious Predecessors Pulikottil Joseph Mar Dionysius II and Pulikottil Joseph Mar Dionysius V were towering personalities who contributed much to making the Malankara Church what it is today.
                  </p>
                  <p>
                    It was His Holiness' keen interest that the Church should have effective and meaningful Inter-Church relations. It is with this emphasis that His Holiness has already finished journeying to all the Oriental Orthodox Churches. Once in this short span of time as Catholicos, he has already had meetings with all the present heads of the Oriental Orthodox Churches. The fraternal relations with the sister Churches too have been given prime importance. The meeting with the present Pope of the Catholic Church has enhanced the bilateral relations between the two Churches. His Holiness' unassuming character and his philanthropic interests, have given new dimensions to the life of the Church. He has authored a few devotional and contemplative books in Malayalam.
                  </p>
                  <p>
                    His Holiness had been called to the eternal abode on 12 July 2021. His mortal remains is interred in the Chapel at Catholicate Palace, Devalokam, Kottayam, India.
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

export default BaseliosMarthomaPauloseIIPage;
