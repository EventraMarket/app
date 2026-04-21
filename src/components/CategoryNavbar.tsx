import Link from "next/link";

export default function CategoryNavbar() {
  return (
    <nav className="w-full flex flex-row flex-wrap items-center gap-2 px-2 sm:px-4 md:px-12 py-1.5 sm:py-2 bg-[#F9F6F0] border-b border-gray-100 z-40 overflow-x-auto scrollbar-hide">
      <Link href="/trending" className="px-3 sm:px-4 py-1 rounded-full font-semibold text-xs sm:text-sm text-black hover:bg-yellow-100 transition whitespace-nowrap">Trending</Link>
      <Link href="/new" className="px-3 sm:px-4 py-1 rounded-full font-semibold text-xs sm:text-sm text-black hover:bg-yellow-100 transition whitespace-nowrap">New</Link>
      <Link href="/sports" className="px-3 sm:px-4 py-1 rounded-full font-semibold text-xs sm:text-sm text-black hover:bg-yellow-100 transition whitespace-nowrap">Sports</Link>
      <Link href="/politics" className="px-3 sm:px-4 py-1 rounded-full font-semibold text-xs sm:text-sm text-black hover:bg-yellow-100 transition whitespace-nowrap">Politics</Link>
      <Link href="/crypto" className="px-3 sm:px-4 py-1 rounded-full font-semibold text-xs sm:text-sm text-black hover:bg-yellow-100 transition whitespace-nowrap">Crypto</Link>
      <Link href="/esports" className="px-3 sm:px-4 py-1 rounded-full font-semibold text-xs sm:text-sm text-black hover:bg-yellow-100 transition whitespace-nowrap">Esports</Link>
      <Link href="/finance" className="px-3 sm:px-4 py-1 rounded-full font-semibold text-xs sm:text-sm text-black hover:bg-yellow-100 transition whitespace-nowrap">Finance</Link>
      <Link href="/economy" className="px-3 sm:px-4 py-1 rounded-full font-semibold text-xs sm:text-sm text-black hover:bg-yellow-100 transition whitespace-nowrap">Economy</Link>
      <Link href="/culture" className="px-3 sm:px-4 py-1 rounded-full font-semibold text-xs sm:text-sm text-black hover:bg-yellow-100 transition whitespace-nowrap">Culture</Link>
      <Link href="/more" className="px-3 sm:px-4 py-1 rounded-full font-semibold text-xs sm:text-sm text-black hover:bg-yellow-100 transition whitespace-nowrap">More</Link>
    </nav>
  );
}
