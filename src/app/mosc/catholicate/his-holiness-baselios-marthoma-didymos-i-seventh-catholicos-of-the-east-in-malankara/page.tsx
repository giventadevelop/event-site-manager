import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'H.H. Baselios Marthoma Didymos I, The Seventh Catholicos of the East in Malankara (2005-2010)',
  description: 'Biography of His Holiness Baselios Marthoma Didymos I, the seventh Catholicos of the East in Malankara.',
};

const BaseliosMarthomaDidymosIPage = () => {
  return (
    <div className="bg-background text-foreground">
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
              <div className="bg-card rounded-lg sacred-shadow p-6 mb-8">
                <div className="flex flex-col items-center mb-6">
                  <Image
                    src="/images/catholicate/didymus.jpg"
                    alt="H.H. Baselios Marthoma Didymos I"
                    width={300}
                    height={188}
                    className="rounded-lg mb-4 sacred-shadow-lg"
                  />
                  <h3 className="font-heading font-semibold text-2xl text-primary text-center">
                    His Holiness Baselios Marthoma Didymos I, The Seventh Catholicos of the East in Malankara (2005-2010)
                  </h3>
                </div>
                <div className="space-y-4 font-body text-muted-foreground leading-relaxed text-justify">
                  <p>
                    His Holiness was consecrated and enthroned at Parumala Seminary as Catholicoi of the East in the Apostolic throne of St. Thomas on 31 October 2005. He is the seventh Catholicos since the Catholicate of the East was relocated to India and 90th in the lineage of Catholicoi of the East in the Apostolic throne of St. Thomas. He is also the 19th Malankara Metropolitan of the Church.
                  </p>
                  <p>
                    His Holiness Baselios Marthoma Didimos I was born on 29 October 1921 to Ittyavira Thomas of Mulamootil House in Nedumbram near Thiruvalla and Sosamma of Chiramel House in Mavelikara. He joined the Tabor Dayara in Pathanapuram in 1939 and completed his high school education. He passed his Intermediate from C.M.S College, Kottayam in 1945, his B.A from National College, Tiruchirapalli in 1951, his B.T from Maston Training College, Madras in 1954, and his M.A from Christ Church College, Kanpur in 1961. He completed his training for priesthood under the disciplined guidance of Thoma Mar Dionysius and His Holiness Baselios Oughen, Catholicos of the East. He received from His Holiness Geevarghese II Catholicos of the East the order of Korooyo on 11 March 1942, full deaconship on 22 May 1947 and priesthood on 25 January 1950. He Has served as headmaster of Ponnayya High School, Thiruchirapalli and St. Stephen's High School, Pathanapuram, as Professor of English in St. Stephens College Pathanapuram and President of the Orthodox Youth Movement.
                    On 16 May 1965 His Holiness Baselios Oughen made him Ramban. The Malankara Syrian Christian Association, which met on 28 December 1965 at M.D Seminary, Kottayam, elected him to the high offer of Metropolitan. On 24 August 1966 at Kolencherry His Holiness Baselios Oughen Bava consecrated him as Metropolitan Thomas Mar Timotheos..
                  </p>
                  <p>
                    He became the Metropolitan of Malabar on 11 November 1966. He continues to serve as the General Superior of Mount Tabor Dayara and Convent in Pathanapuram. On 10 September 1992, the Malankara Association, which met at Parumala, elected him as successor- designate to the Malankara Metropolitan and Catholicos of the East.
                  </p>
                  <p>
                    His Holiness started his service to the Church as a monk when he was a teenager. He was called to the monastic life by the late Metropolitan Mar Dionysius of Niranam. He went through a rigorous monastic life that tuned up his body through hard work and his mind through intense discipline and his spirit through spiritual exercise. This writer believes Mor Baselios Didimos I is an exemplification of eastern monastic life. Our tradition of selecting bishops from the monastic ranks has a long history.    Unfortunately due to discontinued monastic communities, we could not always select our bishops from thorough-bred ascetics period. Mor Didimos is an exemption to our recently fabricated monasticism as a preparation to receive the episcopate. He has been deeply rooted in his monastic practices and exercises long before he became a priest and a bishop. He has witnessed many late nights during which our new Shepherd kept vigil in the chapel of Mount Tabor Monastery. Yes, indeed the church of Malankara is blessed to be shepherded by a monk of prayer.
                  </p>
                  <p>
                    Mar Didimos is not just a monk, who is enamored of some primitive practices of monasticism. He is endowed with erudition which he derived from his long career as a student of theology, mathematics and English literature. Prior to his consecration to the episcopate he had been a professional educator holding various positions in the academia. He was a mathematics instructor for many years, and was a high school headmaster for more than a decade. After receiving his post graduate degree in English literature he held his lectureship in English literature when St. Stephen's college of Pathanapuram came into existence. His Holiness is also rightly credited with his musical skills; his divine liturgies are musically mellifluous to the ears of the participants.
                  </p>
                  <p>
                    He entered the eternal realms on 26 May 2014 at Parumala Seminary. He was laid to rest at Mount Tabor Dayara, Pathanapuram.
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

export default BaseliosMarthomaDidymosIPage;
