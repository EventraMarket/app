export default function BannerSection() {
  return (
    <section className="w-full flex flex-col items-center py-4 px-2 sm:px-0 bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-300">
      <div className="rounded-2xl overflow-hidden shadow-lg w-full max-w-5xl mb-4">
        {/* Replace the src below with your actual banner image or content */}
        <img src="/Banner.png" alt="Banner" className="w-full h-32 sm:h-48 object-cover mx-auto" />
      </div>
    </section>
  );
}
