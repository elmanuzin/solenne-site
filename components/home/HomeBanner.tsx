import Link from "next/link";

interface HomeBannerProps {
    bannerUrl: string;
    bannerTitle: string;
    bannerSubtitle: string;
}

export default function HomeBanner({
    bannerUrl,
    bannerTitle,
    bannerSubtitle,
}: HomeBannerProps) {
    return (
        <>
            <section
                className="w-full min-h-[50vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden bg-contain md:bg-cover bg-no-repeat bg-center"
                style={{
                    backgroundImage: `url("${bannerUrl}")`,
                    backgroundPosition: "center",
                }}
            />

            <section className="w-full flex justify-center px-6 py-6 bg-brand-bg">
                <div className="w-full max-w-2xl text-center">
                    <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-brand-text">
                        {bannerTitle}
                    </h1>
                    <p className="text-sm md:text-base text-brand-muted mt-3">
                        {bannerSubtitle}
                    </p>
                    <div className="mt-6 flex justify-center">
                        <Link
                            href="/catalogo"
                            className="w-full sm:w-auto py-4 px-8 rounded-full bg-black text-white text-center"
                        >
                            Ver coleção
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
