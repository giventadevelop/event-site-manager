import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Saints',
  description: 'Learn about the saints and holy figures of the Malankara Orthodox Syrian Church.',
};

const SaintsPage = () => {
  const saintsCategories = [
    {
      title: 'The Apostles',
      description: 'The twelve apostles of Jesus Christ and their missionary work',
      href: '/mosc/saints/the-apostles',
      icon: '👥',
      saints: [
        { name: 'St. Thomas', description: 'The Apostle who brought Christianity to India' },
        { name: 'St. Peter', description: 'The first among the apostles' },
        { name: 'St. Paul', description: 'The Apostle to the Gentiles' }
      ]
    },
    {
      title: 'St. Mary Mother of God',
      description: 'The Theotokos and her role in salvation history',
      href: '/mosc/saints/st-mary-mother-of-god',
      icon: '👸',
      saints: [
        { name: 'Theotokos', description: 'Mother of God and our intercessor' },
        { name: 'Virgin Mary', description: 'The blessed virgin who bore our Savior' }
      ]
    },
    {
      title: 'Church Fathers',
      description: 'The early church fathers and their theological contributions',
      href: '/mosc/saints/church-fathers',
      icon: '📚',
      saints: [
        { name: 'St. Basil the Great', description: 'Doctor of the Church and Cappadocian Father' },
        { name: 'St. Gregory of Nazianzus', description: 'Theologian and Archbishop of Constantinople' },
        { name: 'St. John Chrysostom', description: 'Golden-mouthed preacher and Archbishop' }
      ]
    },
    {
      title: 'Indian Saints',
      description: 'Saints who lived and served in the Indian Orthodox tradition',
      href: '/mosc/saints/indian-saints',
      icon: '🇮🇳',
      saints: [
        { name: 'St. Gregorios of Parumala', description: 'The first canonized saint of the Malankara Church' },
        { name: 'St. Geevarghese Mar Dionysius', description: 'Metropolitan and church leader' }
      ]
    }
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Saints">👼</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Saints of the Orthodox Church
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover the lives, teachings, and spiritual legacies of the saints who have shaped
              our Orthodox tradition and continue to inspire our faith journey.
            </p>
          </div>
        </div>
      </section>

      {/* Saints Categories */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Categories of Saints
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              Our Orthodox tradition venerates saints from different periods and backgrounds,
              each contributing uniquely to the growth and preservation of our faith.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {saintsCategories.map((category) => (
              <Link
                key={category.title}
                href={category.href}
                className="bg-background rounded-lg sacred-shadow p-8 hover:sacred-shadow-lg reverent-transition group"
              >
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 reverent-transition">
                    <span className="text-4xl" role="img" aria-label={category.title}>{category.icon}</span>
                  </div>
                  <h3 className="font-heading font-semibold text-2xl text-foreground mb-3 group-hover:text-primary reverent-transition">
                    {category.title}
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    {category.description}
                  </p>
                </div>

                <div className="space-y-3">
                  {category.saints.map((saint, index) => (
                    <div key={index} className="border-l-4 border-primary/20 pl-4">
                      <h4 className="font-heading font-medium text-foreground">{saint.name}</h4>
                      <p className="font-body text-sm text-muted-foreground">{saint.description}</p>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Saints */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Featured Saints
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              Learn about some of the most beloved saints in our Orthodox tradition.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* St. Thomas */}
            <div className="bg-card rounded-lg sacred-shadow p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-primary" role="img" aria-label="St. Thomas">✟</span>
                </div>
                <h3 className="font-heading font-semibold text-2xl text-foreground mb-2">
                  St. Thomas the Apostle
                </h3>
                <p className="font-body text-primary font-medium">Apostle to India</p>
              </div>
              <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
                <p>
                  St. Thomas, one of the twelve apostles of Jesus Christ, is traditionally believed
                  to have brought Christianity to India in 52 AD. His missionary work established
                  the foundation of the Malankara Orthodox Syrian Church.
                </p>
                <p>
                  Known as "Doubting Thomas" for initially doubting the resurrection, he later
                  became one of the most devoted apostles, traveling to distant lands to spread
                  the Gospel message.
                </p>
              </div>
              <div className="mt-6 text-center">
                <Link
                  href="/mosc/saints/the-apostles"
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium reverent-transition"
                >
                  Learn More About St. Thomas
                  <span className="ml-1" role="img" aria-label="Arrow">→</span>
                </Link>
              </div>
            </div>

            {/* St. Gregorios of Parumala */}
            <div className="bg-card rounded-lg sacred-shadow p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-primary" role="img" aria-label="St. Gregorios">👨‍💼</span>
                </div>
                <h3 className="font-heading font-semibold text-2xl text-foreground mb-2">
                  St. Gregorios of Parumala
                </h3>
                <p className="font-body text-primary font-medium">First Canonized Saint</p>
              </div>
              <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
                <p>
                  St. Gregorios of Parumala was the first saint to be canonized by the Malankara
                  Orthodox Syrian Church. He served as Metropolitan of the Niranam diocese and
                  was known for his deep spirituality and pastoral care.
                </p>
                <p>
                  His life of prayer, fasting, and service to the poor continues to inspire
                  Orthodox Christians in India and around the world. He is particularly
                  remembered for his humility and devotion to God.
                </p>
              </div>
              <div className="mt-6 text-center">
                <Link
                  href="/mosc/saints/indian-saints"
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium reverent-transition"
                >
                  Learn More About St. Gregorios
                  <span className="ml-1" role="img" aria-label="Arrow">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Saints */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
                Understanding Saints in Orthodoxy
              </h2>
              <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
                <p>
                  In the Orthodox tradition, saints are not just historical figures but living
                  examples of holiness who continue to intercede for us before God. They serve
                  as models of Christian life and sources of spiritual inspiration.
                </p>
                <p>
                  The veneration of saints is an integral part of Orthodox spirituality,
                  helping us to connect with the great cloud of witnesses who have gone
                  before us in faith.
                </p>
                <p>
                  Through their lives, teachings, and prayers, saints continue to guide
                  and inspire Orthodox Christians in their spiritual journey toward God.
                </p>
              </div>
            </div>

            <div className="bg-background rounded-lg sacred-shadow p-6">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                How We Honor Saints
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-primary text-xl" role="img" aria-label="Prayer">🙏</span>
                  <div>
                    <h4 className="font-heading font-medium text-foreground">Prayer & Intercession</h4>
                    <p className="font-body text-muted-foreground text-sm">Seeking their prayers and intercession</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary text-xl" role="img" aria-label="Feast Days">📅</span>
                  <div>
                    <h4 className="font-heading font-medium text-foreground">Feast Days</h4>
                    <p className="font-body text-muted-foreground text-sm">Celebrating their memory on special days</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary text-xl" role="img" aria-label="Icons">🖼️</span>
                  <div>
                    <h4 className="font-heading font-medium text-foreground">Icons & Images</h4>
                    <p className="font-body text-muted-foreground text-sm">Using their images for veneration and inspiration</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary text-xl" role="img" aria-label="Learning">📚</span>
                  <div>
                    <h4 className="font-heading font-medium text-foreground">Study & Learning</h4>
                    <p className="font-body text-muted-foreground text-sm">Reading about their lives and teachings</p>
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

export default SaintsPage;














