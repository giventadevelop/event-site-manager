import Image from "next/image";
import Link from "next/link";
import type { EventSponsorsDTO } from "@/types";
import { useState } from "react";

// Component to handle image loading errors and hide container when image fails
function ImageWithErrorHandling({
  src,
  alt,
  sponsorType,
}: {
  src: string;
  alt: string;
  sponsorType?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Don't render if image fails to load
  if (imageError || !src) {
    return sponsorType ? (
      <div className="relative w-full pt-3 pr-3">
        <div className="flex justify-end">
          <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
            {sponsorType}
          </span>
        </div>
      </div>
    ) : null;
  }

  return (
    <div className="relative w-full h-auto rounded-t-2xl overflow-hidden">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
        style={{
          backgroundColor: "transparent",
          borderRadius: "1rem 1rem 0 0",
        }}
        onError={() => {
          setImageError(true);
        }}
        onLoad={() => {
          setImageLoaded(true);
        }}
      />
      {sponsorType && imageLoaded && !imageError && (
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
            {sponsorType}
          </span>
        </div>
      )}
    </div>
  );
}

interface SponsorCardProps {
  sponsor: EventSponsorsDTO;
  backgroundClass: string;
  onCardClick?: () => void;
  className?: string;
  shadowStyle?: string;
}

const defaultShadow =
  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)";

export function SponsorCard({
  sponsor,
  backgroundClass,
  onCardClick,
  className = "",
  shadowStyle = defaultShadow,
}: SponsorCardProps) {
  const combinedClasses = [
    backgroundClass,
    "rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group",
    onCardClick ? "cursor-pointer" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div
        className={combinedClasses}
        style={{
          boxShadow: shadowStyle,
        }}
        onClick={onCardClick}
        role={onCardClick ? "button" : undefined}
        tabIndex={onCardClick ? 0 : undefined}
        onKeyDown={
          onCardClick
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onCardClick();
                }
              }
            : undefined
        }
      >
        <div className="flex flex-col h-full">
          {sponsor.bannerImageUrl && (
            <ImageWithErrorHandling
              src={sponsor.bannerImageUrl}
              alt={sponsor.name}
              sponsorType={sponsor.type}
            />
          )}
          {!sponsor.bannerImageUrl && sponsor.type && (
            <div className="relative w-full pt-3 pr-3">
              <div className="flex justify-end">
                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                  {sponsor.type}
                </span>
              </div>
            </div>
          )}

          <div className={`flex-1 flex flex-col ${sponsor.bannerImageUrl ? 'border-t border-white/20' : ''}`}>
            <div className="p-5">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {sponsor.name}
              </h2>

              {sponsor.companyName && (
                <p className="text-gray-600 text-base mb-2">
                  {sponsor.companyName}
                </p>
              )}
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-white/20 flex-1 flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 lg:justify-items-center">
                {sponsor.companyName && (
                  <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">
                      {sponsor.companyName}
                    </span>
                  </div>
                )}

                {sponsor.type && (
                  <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">{sponsor.type}</span>
                  </div>
                )}

                {sponsor.contactEmail && (
                  <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-orange-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">
                      {sponsor.contactEmail}
                    </span>
                  </div>
                )}

                {sponsor.contactPhone && (
                  <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">
                      {sponsor.contactPhone}
                    </span>
                  </div>
                )}

                {sponsor.websiteUrl && (
                  <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-teal-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9-9m0 18a9 9 0 009-9M12 3a9 9 0 00-9 9"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">
                      {sponsor.websiteUrl.replace(/^https?:\/\//, "")}
                    </span>
                  </div>
                )}
              </div>

              {(sponsor.tagline || sponsor.id) && (
                <div className="mt-auto space-y-4 pt-4">
                  {sponsor.tagline && (
                    <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-100 shadow-[0_12px_30px_-15px_rgba(146,118,65,0.4)] px-4 py-3 text-center">
                      <p className="relative z-10 text-sm font-medium text-amber-800 italic leading-relaxed line-clamp-2">
                        {sponsor.tagline}
                      </p>
                    </div>
                  )}

                  {typeof sponsor.id !== "undefined" && (
                    <div className="flex justify-end">
                      <Link
                        href={`/sponsors/${sponsor.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                        title={`View sponsor details for ${sponsor.name}`}
                        aria-label={`View sponsor details for ${sponsor.name}`}
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-green-700">View Sponsor Details</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}


