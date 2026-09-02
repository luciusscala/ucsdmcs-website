import { PhotoCarousel } from "@/components/photo-carousel";
import { intro, slides } from "@/lib/data/home";

export default function Home() {
  return (
    <section className="bg-background">
      <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div>
          <h1 className="headline text-3xl text-navy sm:text-4xl">
            {intro.heading}
            <span className="mt-1 block text-blue">{intro.headingAccent}</span>
          </h1>
          <div className="mt-5 max-w-md space-y-3.5 text-sm leading-relaxed text-muted">
            {intro.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <PhotoCarousel slides={slides} />
      </div>
    </section>
  );
}
