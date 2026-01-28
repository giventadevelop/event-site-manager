import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'The Catholicate',
  description: 'Learn about the Catholicate of the Syro-Malabar Church, its history, and the spiritual leadership of our Catholicos.',
};

const CatholicatePage = () => {
  const catholicosHistory = [
    {
      name: 'H.H. Baselios Paulos I',
      period: '1912–1913',
      description: 'The First Catholicos of the East in Malankara',
      href: '/syro/catholicate/his-holiness-baselios-paulos-i-1st-catholicos-of-the-east-in-malankara',
      image: '/images/catholicate/Untitled-11.jpg'
    },
    {
      name: 'H.H. Baselios Geevarghese I',
      period: '1925–1928',
      description: 'The Second Catholicos of the East in Malankara',
      href: '/syro/catholicate/his-holiness-baselios-geevarghese-i-second-catholicos-of-the-east-in-malankara',
      image: '/images/catholicate/Untitled-12.jpg'
    },
    {
      name: 'H.H. Baselios Geevarghese II',
      period: '1929–1964',
      description: 'The Third Catholicos of the East in Malankara',
      href: '/syro/catholicate/his-holiness-baselios-geevarghese-ii-third-catholicos-of-the-east-in-malankara',
      image: '/images/catholicate/geevar.jpg'
    },
    {
      name: 'H.H. Baselios Augen I',
      period: '1964–1975',
      description: 'The Fourth Catholicos of the East in Malankara',
      href: '/syro/catholicate/his-holiness-baselios-oughen-i-the-fourth-catholicos-of-the-east-in-malankara',
      image: '/images/catholicate/augen.jpg'
    },
    {
      name: 'H.H. Baselios Marthoma Mathews I',
      period: '1975–1991',
      description: 'The Fifth Catholicos of the East in Malankara',
      href: '/syro/catholicate/his-holiness-baselios-marthoma-mathews-i-fifth-catholicos-of-the-east-in-malankara',
      image: '/images/catholicate/mathews-i.jpg'
    },
    {
      name: 'H.H. Baselios Marthoma Mathews II',
      period: '1991–2005',
      description: 'The Sixth Catholicos of the East in Malankara',
      href: '/syro/catholicate/his-holiness-baselios-marthoma-mathews-ii-sixth-catholicos-of-the-east-in-malankara',
      image: '/images/catholicate/sas.jpg'
    },
    {
      name: 'H.H. Baselios Marthoma Didymos I',
      period: '2005-2010',
      description: 'The Seventh Catholicos of the East in Malankara',
      href: '/syro/catholicate/his-holiness-baselios-marthoma-didymos-i-seventh-catholicos-of-the-east-in-malankara',
      image: '/images/catholicate/didymus.jpg'
    },
    {
      name: 'H.H. Baselios Marthoma Paulose II',
      period: '2010–2021',
      description: 'The Eighth Catholicos of the East in Malankara',
      href: '/syro/catholicate/h-h-baselios-marthoma-paulose-ii',
      image: '/images/catholicate/bava.jpg'
    }
  ];

  return (
    <div className="bg-syro-bg-gray">
      {/* The Catholicate Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Heading - Centered */}
          <div className="text-center mb-8">
            <h1 className="text-syro-h1 font-bold text-syro-blue mb-8">
              The Catholicate
            </h1>
          </div>
          
          {/* Emblem/Logo - Centered */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full text-syro-red" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>

          {/* Descriptive Text - Left Aligned */}
          <div className="max-w-4xl mx-auto mb-8">
            <p className="text-syro-body text-syro-dark-gray leading-relaxed text-left mb-4">
              <span className="font-semibold text-syro-blue">Introduction</span> The word 'Catholicos' means "the general head" or "general bishop". It can be considered as equivalent to "universal Bishop". This title and rank is much more ancient than the title Patriarch in the church.
            </p>
            <p className="text-syro-body text-syro-dark-gray leading-relaxed text-left">
              In the ministry of the early church there were only three ranks namely; Episcopos (Bishop), Priest and Deacon. By the end of the third century or by the beginning of the fourth century certain bishops of certain important cities or provincial capitals in the Roman empire gained pre-eminence than other bishops and they came to be known as Metropolitans. The Ecumenical councils of the fourth century recognized the authority of these Metropolitans.
            </p>
          </div>

          {/* Read More Button - Left Aligned */}
          <div className="flex justify-start max-w-4xl mx-auto">
            <Link
              href="/syro/catholicate/catholicate"
              className="no-underline text-white bg-syro-red py-2.5 px-5 border-r-[7px] border-syro-red-darker font-light inline-block transition-all duration-1000 hover:bg-syro-red-darker hover:border-r-[6px] hover:border-syro-red hover:text-white flex items-center gap-2"
            >
              <span>Read More</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Historical Catholicos */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-syro-h3 font-bold text-syro-blue mb-4">
              Historical Catholicos
            </h2>
            <p className="text-syro-body text-syro-text-gray max-w-3xl mx-auto">
              Learn about the spiritual leaders who have guided our church through history,
              each contributing to the rich legacy of the Syro-Malabar tradition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {catholicosHistory.map((catholicos) => (
              <Link
                key={catholicos.name}
                href={catholicos.href}
                className="bg-white rounded-[5px] shadow-syro-card p-4 hover:shadow-syro-card-hover transition-all duration-500 group w-full max-w-xs"
              >
                <div className="text-center">
                  <div className="w-full h-48 mx-auto mb-4 rounded-[5px] overflow-hidden shadow-syro-card group-hover:shadow-syro-card-hover transition-all">
                    <Image
                      src={catholicos.image}
                      alt={catholicos.name}
                      width={300}
                      height={192}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-syro-h6 font-semibold text-syro-blue mb-2 group-hover:text-syro-red transition-colors">
                    {catholicos.name}
                  </h3>
                  <p className="text-syro-small text-syro-red mb-2 font-medium">
                    {catholicos.period}
                  </p>
                  <p className="text-syro-label text-syro-text-gray leading-relaxed">
                    {catholicos.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CatholicatePage;
