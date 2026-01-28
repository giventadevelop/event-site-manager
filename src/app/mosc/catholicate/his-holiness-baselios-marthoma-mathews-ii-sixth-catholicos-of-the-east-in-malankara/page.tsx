import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'H.H. Baselios Marthoma Mathews II, The Sixth Catholicos of the East in Malankara (1991–2005)',
  description: 'Biography of His Holiness Baselios Marthoma Mathews II, the sixth Catholicos of the East in Malankara.',
};

const BaseliosMarthomaMathewsIIPage = () => {
  return (
    <div className="bg-background text-foreground">
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
              <div className="bg-card rounded-lg sacred-shadow p-6 mb-8">
                <div className="flex flex-col items-center mb-6">
                  <Image
                    src="/images/catholicate/sas.jpg"
                    alt="H.H. Baselios Marthoma Mathews II"
                    width={300}
                    height={188}
                    className="rounded-lg mb-4 sacred-shadow-lg"
                  />
                  <h3 className="font-heading font-semibold text-2xl text-primary text-center">
                    His Holiness Baselios Marthoma Mathews II, The Sixth Catholicos of the East in Malankara (1991–2005)
                  </h3>
                </div>
                <div className="space-y-4 font-body text-muted-foreground leading-relaxed text-justify">
                  <p>
                    His Holiness Moran Mar Baselios Marthoma Mathews II, Catholicos of the East, and 89th successor to the Holy Apostolic Throne of St. Thomas was enthroned on 29 April 1991.
                  </p>
                  <p>
                    He was born on January 30, 1915 at Perinad in Kollam District of Kerala. His Holiness had his early education in a local school. After his High School education he had his training at Old Seminary Kottayam and also at Basil Dayara, Pathanamthitta. Later he joined Bishop's College, Calcutta for his B.D. Degree. He had his higher education in Theology at General Theological Seminary, New York.He was ordained as Deacon in 1938 and as Priest in 1941. It was during his stay at St. George Dayara. Othara that Father Mathews made a mark as a devoted and an able priest of the Indian Orthodox Church. He was noted for his spiritual leadership and loving nature and could endear himself to everyone who came in contact with him. He was known as "Father Angel" at that time. The Catholicos His Holiness Baselios Geevarghese II took special interest to see that the services of Father Mathews are utilized in a still better way for the church and the community. On May 15, 1953 he was ordained as a Bishop of Orthodox church. He was only thirty eight years at that time. The young Bishop grew in stature very soon. As Metropolitan of the Diocese of Kollam he was fully responsible for its growth and progress and the number of parishes almost doubled within a short period. Several monasteries and convents were started. A large number of educational institutions and hospitals were established. His services in the field of education and social service are all very well known. Several Colleges, Schools, Hospitals and other service institutions are successfully established and administered under his direct control and leadership. He has traveled wide in various countries: the United States, Canada, Europe, Malaya, Singapore, Gulf countries etc. and has attended various international meetings and conferences. It was in 1980 that he was unanimously elected by the Malankara Syrian Christian Association as successor to the throne of Catholicos of the East and Malankara Metropolitan. In recent years some of the new schemes started under his directions are found to be of much help and benefit for the community at large. A Civil Service Academy was started at Thiruvananthapuram, to give proper training for candidates appearing for IAS, IPS, IFS and other Central Service Examinations. With a view to provide shelter for the poor, an House Building Assistance project was started. The Community Marriage Scheme is found beneficial for the marriage of poor girls. Human Resources Development and Services Wing is also helpful for the community in general. As President of the Ecumenical committee in Kerala and also in various other Inter-Church Committees he has shown excellent leadership. He keeps in touch with Heads of other Churches constantly and is keenly interested to promote Ecumenism. He has very friendly relations with leaders of other religions as well and has fully demonstrated by his activities the role the Head of a Christian Church has to play in the Secular, Socialist, Democratic, Republic of India. He encourages all activities directed towards the progress and development of the Nation and promotion of communal harmony and maintenance of peace in the country. A good orator, an eminent scholar, a renowned theologian, an able administrator and a man of the Word of God, he has all the qualities needed for a spiritual leader and a good shepherd. With his intelligence, wisdom, love and vision and with his vast experience in various fields he has proved himself successful as a skillful ecclesiastical head of an ancient Church. With his devotion and dedication in life and sincerity of purpose, no doubt the community at large is benefited by his true Christian life as a servant of God in the service of mankind.
                  </p>
                  <p>
                    He entered into eternal rest on 26 Jan 2006 and laid to rest in Mar Elia Chapel Shastamcotta.
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

export default BaseliosMarthomaMathewsIIPage;
