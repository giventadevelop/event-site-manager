import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'The Servants of the Cross | MOSC',
  description: 'President H. G. Geevarghese Mar Coorilos Metropolitan General Secretary Fr. Somu K. Samuel Ph- +91 9447933220 Office Address Carmel Dayara. Kandanad, Ph- 0484 2...',
};

const TheServantsOfTheCrossPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="The Servants of the Cross">✝️</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              The Servants of the Cross
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              President H. G. Geevarghese Mar Coorilos Metropolitan General Secretary Fr. Somu K. Samuel Ph- +91 9447933220 Office Address Carmel Dayara. Kandanad, Ph- 0484 2792159
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                  About The Servants of the Cross
                </h2>
                <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
                  <p>President H. G. Geevarghese Mar Coorilos Metropolitan General Secretary Fr. Somu K. Samuel Ph- +91 9447933220 Office Address Carmel Dayara. Kandanad, Ph- 0484 2792159</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                  Quick Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-primary text-xl" role="img" aria-label="Organization">✝️</span>
                    <div>
                      <h4 className="font-heading font-medium text-foreground">Organization Type</h4>
                      <p className="font-body text-muted-foreground text-sm">Spiritual Organization</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-primary text-xl" role="img" aria-label="Church">⛪</span>
                    <div>
                      <h4 className="font-heading font-medium text-foreground">Church Affiliation</h4>
                      <p className="font-body text-muted-foreground text-sm">Malankara Orthodox Syrian Church</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Organizations */}
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                  Related Organizations
                </h3>
                <div className="space-y-3">
                  <Link 
                    href="/mosc/spiritual-organizations" 
                    className="block text-primary hover:text-primary/80 font-medium reverent-transition"
                  >
                    ← All Spiritual Organizations
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
            Get Involved
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Learn more about how you can participate in the activities and programs of The Servants of the Cross.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/mosc/spiritual-organizations"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 reverent-transition"
            >
              Explore All Organizations
            </Link>
            <Link
              href="/mosc"
              className="inline-flex items-center justify-center px-6 py-3 bg-background text-foreground border border-border rounded-lg hover:bg-muted reverent-transition"
            >
              Learn About MOSC
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TheServantsOfTheCrossPage;