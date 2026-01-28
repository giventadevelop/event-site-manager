import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Ecumenical Relations',
  description: 'Learn about the ecumenical relations and inter-church dialogue of the Syro-Malabar Church.',
};

const EcumenicalPage = () => {
  const ecumenicalRelations = [
    {
      title: 'World Council of Churches',
      description: 'Active participation in global Christian unity initiatives',
      href: '/syro/ecumenical/world-council-of-churches',
      icon: '🌍'
    },
    {
      title: 'Orthodox Churches',
      description: 'Relations with other Orthodox jurisdictions worldwide',
      href: '/syro/ecumenical/orthodox-churches',
      icon: '⛪'
    },
    {
      title: 'Catholic Church',
      description: 'Dialogue and cooperation with the Roman Catholic Church',
      href: '/syro/ecumenical/catholic-church',
      icon: '✟'
    },
    {
      title: 'Protestant Churches',
      description: 'Relations with various Protestant denominations',
      href: '/syro/ecumenical/protestant-churches',
      icon: '📖'
    },
    {
      title: 'Oriental Orthodox',
      description: 'Unity within the Oriental Orthodox family',
      href: '/syro/ecumenical/oriental-orthodox',
      icon: '🤝'
    },
    {
      title: 'Interfaith Dialogue',
      description: 'Engagement with other religious traditions',
      href: '/syro/ecumenical/interfaith-dialogue',
      icon: '🕊️'
    }
  ];

  const recentActivities = [
    {
      title: 'Orthodox Unity Conference',
      date: '2024',
      description: 'Participation in the global Orthodox unity conference held in Istanbul',
      icon: '🤝'
    },
    {
      title: 'Ecumenical Prayer Service',
      date: '2024',
      description: 'Joint prayer service with local Christian communities for peace and unity',
      icon: '🙏'
    },
    {
      title: 'Interfaith Dialogue Forum',
      date: '2024',
      description: 'Representation at the national interfaith dialogue forum in New Delhi',
      icon: '🕊️'
    }
  ];

  return (
    <div className="bg-syro-bg-gray">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-white to-syro-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-syro-red rounded-[5px] flex items-center justify-center mx-auto mb-6 shadow-syro-card">
              <span className="text-white text-4xl font-bold" role="img" aria-label="Ecumenical">🤝</span>
            </div>
            <h1 className="font-syro-display font-semibold text-syro-h1 text-syro-blue mb-4">
              Ecumenical Relations
            </h1>
            <p className="font-syro-primary text-syro-body text-syro-text-gray max-w-3xl mx-auto leading-relaxed">
              The Syro-Malabar Church actively participates in ecumenical dialogue
              and inter-church relations, working toward Christian unity while preserving our
              Orthodox tradition and identity.
            </p>
          </div>
        </div>
      </section>

      {/* Ecumenical Relations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syro-display font-semibold text-syro-h2 text-syro-blue mb-4">
              Our Ecumenical Relations
            </h2>
            <p className="font-syro-primary text-syro-body text-syro-text-gray max-w-3xl mx-auto">
              We maintain relationships with various Christian churches and religious organizations,
              participating in dialogue and cooperation for the greater good of humanity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecumenicalRelations.map((relation) => (
              <Link
                key={relation.title}
                href={relation.href}
                className="bg-syro-bg-gray rounded-[5px] shadow-syro-card p-6 hover:shadow-syro-card-hover transition-all duration-500 group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-syro-red-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-syro-red/20 transition-all duration-300">
                    <span className="text-2xl" role="img" aria-label={relation.title}>{relation.icon}</span>
                  </div>
                  <h3 className="font-syro-display font-semibold text-syro-h4 text-syro-blue mb-3 group-hover:text-syro-red transition-all duration-300">
                    {relation.title}
                  </h3>
                  <p className="font-syro-primary text-syro-label text-syro-text-gray leading-relaxed">
                    {relation.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activities */}
      <section className="py-16 bg-syro-light-gray/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syro-display font-semibold text-syro-h2 text-syro-blue mb-4">
              Recent Ecumenical Activities
            </h2>
            <p className="font-syro-primary text-syro-body text-syro-text-gray max-w-3xl mx-auto">
              Our ongoing participation in various ecumenical initiatives and inter-church dialogues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="bg-white rounded-[5px] shadow-syro-card p-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-syro-red-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-syro-red" role="img" aria-label="Activity">{activity.icon}</span>
                  </div>
                  <h3 className="font-syro-display font-semibold text-syro-h4 text-syro-blue mb-2">
                    {activity.title}
                  </h3>
                  <p className="font-syro-primary text-syro-red font-medium mb-3">
                    {activity.date}
                  </p>
                  <p className="font-syro-primary text-syro-label text-syro-text-gray leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecumenical Principles */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-syro-display font-semibold text-syro-h2 text-syro-blue mb-6">
                Our Ecumenical Principles
              </h2>
              <div className="space-y-4 font-syro-primary text-syro-body text-syro-text-gray leading-relaxed">
                <p>
                  The Syro-Malabar Church approaches ecumenical relations with a commitment
                  to Christian unity while maintaining our Orthodox faith and tradition. We believe that
                  true unity comes through shared faith in Christ, not through compromise of essential doctrines.
                </p>
                <p>
                  Our participation in ecumenical dialogue is guided by the principle of "unity in diversity,"
                  recognizing that different Christian traditions can work together for common goals while
                  respecting each other's distinct theological and liturgical traditions.
                </p>
                <p>
                  We are committed to promoting peace, justice, and human dignity through our ecumenical
                  partnerships, working with other Christian churches to address the spiritual and material
                  needs of our communities and the world.
                </p>
              </div>
            </div>

            <div className="bg-syro-bg-gray rounded-[5px] shadow-syro-card p-6">
              <h3 className="font-syro-display font-semibold text-syro-h3 text-syro-blue mb-4">
                Key Commitments
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Faith">⛪</span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Preserve Orthodox Faith</h4>
                    <p className="font-syro-primary text-syro-small text-syro-text-gray">Maintain our Orthodox tradition and teachings</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Unity">🤝</span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Promote Christian Unity</h4>
                    <p className="font-syro-primary text-syro-small text-syro-text-gray">Work toward visible unity among Christians</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Dialogue">💬</span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Engage in Dialogue</h4>
                    <p className="font-syro-primary text-syro-small text-syro-text-gray">Participate in theological and pastoral dialogue</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Service">🛠️</span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Serve Humanity</h4>
                    <p className="font-syro-primary text-syro-small text-syro-text-gray">Collaborate on humanitarian and social issues</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EcumenicalPage;
