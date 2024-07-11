import Hero from "@/components/Hero";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Chess Game",
  description: "Welcome to our real-time chess game",
};

export default function Home() {
  return (
    <>
      <Hero />
    </>
  );
}
