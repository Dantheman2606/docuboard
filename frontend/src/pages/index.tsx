// import Image from "next/image";
// import { Geist, Geist_Mono } from "next/font/google";
    import { Button } from "@/components/ui/button";


// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export default function Home() {
  return (
    <div className="bg-blue-500 text-white p-4">Hello Tailwind
    <Button>Click me</Button>
    </div>




  );
}
