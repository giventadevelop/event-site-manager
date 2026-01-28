import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Malankara Sabha Magazine (Masika) | Publications | MOSC',
  description: 'The official monthly magazine of the Malankara Orthodox Syrian Church, published since 1946. Learn about our rich history and how to subscribe.',
};

export default function MalankaraSabhaMagazinePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <section className="bg-muted py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 font-body text-sm text-muted-foreground">
            <Link href="/mosc" className="hover:text-primary reverent-transition">
              MOSC
            </Link>
            <span>/</span>
            <Link href="/mosc/publications" className="hover:text-primary reverent-transition">
              Publications
            </Link>
            <span>/</span>
            <span className="text-foreground">Malankara Sabha Magazine (Masika)</span>
          </nav>
        </div>
      </section>

      {/* Hero Section with Image */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden sacred-shadow-lg">
              <Image
                src="/images/publications/mal.jpg"
                alt="Malankara Sabha Magazine (Masika)"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
                Malankara Sabha Magazine (Masika)
              </h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                The official monthly magazine of the Malankara Orthodox Syrian Church, serving as the voice of our ancient tradition since 1946.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            {/* History */}
            <div className="mb-12">
              <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
                A Rich History
              </h2>
              <p className="font-body text-lg text-muted-foreground leading-relaxed mb-4">
                On August 8th 1946, due to the dedicated conviction and enthusiasm of H.H. Baselius Geevarghese II Catholicos of Blessed memory, the Magazine was published from the Catholicate Palace of Devalokam. Very Rev. M.C. Kuriakose Ramban of Blessed memory was the first chief editor. From January 1968 to February 1969 &quot;Malankara Sabha&quot; was published as a biweekly. At present, this is a monthly published Magazine and it is the official organ of the Indian Orthodox Church.
              </p>
            </div>

            {/* Editorial Board */}
            <div className="mb-12">
              <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
                Editorial Board
              </h2>
              <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">
                The editorial board appointed by the Holy Episcopal Synod of the Church oversees the administration and growth of the Magazine. At present, the editorial board includes:
              </p>
              <div className="bg-muted rounded-lg p-6 mb-6">
                <ul className="space-y-3 font-body text-lg text-foreground">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span><strong>H.G Dr Yuhanon Mar Diascoros Metropolitan</strong> (President)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span><strong>Fr Zachariah Thomas Puthupally</strong> (Chief Editor)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span><strong>Fr. Thomas Raju Karuvatta</strong> (Managing-Editor)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span><strong>Fr.Alex Thomas Nazhoorimattathil</strong> (Sub-Editor)</span>
                  </li>
                </ul>
              </div>
              <p className="font-body text-lg text-foreground font-medium mb-3">
                Editorial Board Members:
              </p>
              <ul className="space-y-2 font-body text-lg text-muted-foreground ml-6">
                <li>Fr dr Bijesh Philip</li>
                <li>Fr. Thomas Varghese chavadiyil</li>
                <li>Adv Biju Oommen</li>
                <li>Dr Thomas Kuruvila</li>
                <li>Alexin George IPoS</li>
                <li>Merlin T Mathew</li>
              </ul>
            </div>

            {/* Subscription Information */}
            <div className="mb-12">
              <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
                Subscribe to Malankara Sabha
              </h2>
              <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">
                The magazine is published on the 10th of every month. In order to subscribe for the magazine and for other information, contact:
              </p>
              <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-6 sacred-shadow">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                  Contact Information
                </h3>
                <div className="space-y-2 font-body text-lg text-foreground">
                  <p><strong>The Managing Editor</strong></p>
                  <p>Malankara Sabha Monthly</p>
                  <p>Devalokam P.O</p>
                  <p>Kottayam – 686 038</p>
                  <p><strong>Tel:</strong> 0481-2573234</p>
                  <div className="mt-4 pt-4 border-t border-primary/20">
                    <p><strong>Email:</strong></p>
                    <p>
                      <a 
                        href="mailto:malankarasabha1946@gmail.com" 
                        className="text-primary hover:underline"
                      >
                        malankarasabha1946@gmail.com
                      </a>
                    </p>
                    <p>
                      <a 
                        href="mailto:sabhamasika@yahoo.com" 
                        className="text-primary hover:underline"
                      >
                        sabhamasika@yahoo.com
                      </a>
                    </p>
                    <p className="mt-4">
                      <strong>Website:</strong>{' '}
                      <a 
                        href="http://www.malankarasabhaonline.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        www.malankarasabhaonline.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="bg-gradient-to-br from-muted to-background rounded-lg p-8 sacred-shadow">
              <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
                Our Mission
              </h2>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Malankara Sabha Magazine serves as the official organ of the Indian Orthodox Church, dedicated to preserving and sharing our rich spiritual heritage, theological insights, and church news. Through its monthly publication, the magazine continues to strengthen the faith of our community and connect Orthodox believers worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
            Stay Connected with Our Faith Community
          </h2>
          <p className="font-body text-lg text-muted-foreground mb-8">
            Subscribe today to receive monthly insights, theological articles, and church news delivered to your doorstep.
          </p>
          <Link
            href="/mosc/publications"
            className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow hover:sacred-shadow-lg"
          >
            Explore More Publications
          </Link>
        </div>
      </section>
    </div>
  );
}


