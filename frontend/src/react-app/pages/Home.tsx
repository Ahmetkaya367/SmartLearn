import { useEffect } from "react";
import { useLocation } from "react-router";
import Hero3D from "@/react-app/components/hero/Hero3D";
import { Features } from "@/react-app/components/Features";
import { Categories } from "@/react-app/components/Categories";

export default function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [hash]);

  return (
    <>
      <Hero3D />
      <Features />
      <Categories />
    </>
  );
}
