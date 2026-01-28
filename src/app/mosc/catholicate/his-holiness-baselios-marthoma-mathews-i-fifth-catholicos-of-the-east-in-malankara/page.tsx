import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'H.H. Baselios Marthoma Mathews I, The Fifth Catholicos of the East in Malankara (1975–1991)',
  description: 'Biography of His Holiness Baselios Marthoma Mathews I, the fifth Catholicos of the East in Malankara.',
};

const BaseliosMarthomaMathewsIPage = () => {
  return (
    <div className="bg-background text-foreground">
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
              <div className="bg-card rounded-lg sacred-shadow p-6 mb-8">
                <div className="flex flex-col items-center mb-6">
                  <Image
                    src="/images/catholicate/mathews-i.jpg"
                    alt="H.H. Baselios Marthoma Mathews I"
                    width={300}
                    height={188}
                    className="rounded-lg mb-4 sacred-shadow-lg"
                  />
                  <h3 className="font-heading font-semibold text-2xl text-primary text-center">
                    His Holiness Baselios Marthoma Mathews I, The Fifth Catholicos of the East in Malankara (1975–1991)
                  </h3>
                </div>
                <div className="space-y-4 font-body text-muted-foreground leading-relaxed text-justify">
                  <p>
                    His Holiness was born on 27th, March 1907 as the youngest son of Vattakunnel Kurien Kathanar and Olesha Pulickaparampil Mariamma in Kottayam. He took his B.A, B.D. degrees. Even as a layman he had achieved the unique distinction in studies and also in the Canonical Laws; he was selected as a member of the Managing committee in 1944. He received on 18 August 1945 at the Old Seminary the order of "Musmrono" and on 19 August at Mar Elia Chapel he became a full deacon; on 27 October 1946 he was ordained as priest by His Holess Baselios Geevarghese II, Catholicos of the East. Later, on 21 September 1951, he was elevated to the rank of Ramban (Monk). His Holiness Baselios Geevarghese II consecrated him as Episcopa under the name Mahews Mar Athanasios. He was further elevated to the office of Metropolitan on 12 July 1959. In 1960, he became Head of outside Kerala Diocese of the Malankara church. He was unanimously elected as the Supreme Head
                    of the church and successor to the Catholicate of the East/Malankara Metropolitanate by the Malankara Association, which met on 31 December 1970 at M.D.Seminary, Kottayam. On 24 September 1975, he became Malankara Metropolitan. On 27 October 1975, at the Old Seminary, he was installed as Catholicos of the East with the title His Holiness Baselios Marthoma Mathews I. He executed many administrative innovations and helped to strengthen the sovereignty of the Malankara Orthodox Church and its right to have its own sovereign Head. He was able to project the name and fame of the church on an international level. On 27 April 1991, due to failing health he relinquished his office. On 8 November 1996 he passed away, and was laid to rest in Devalokam Aramana.
                  </p>
                  <p>
                    Anniversary: 8 November
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

export default BaseliosMarthomaMathewsIPage;
