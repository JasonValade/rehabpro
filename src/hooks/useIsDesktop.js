import { useEffect, useState } from "react";

const DESKTOP_BREAKPOINT = 900;

function getIsDesktop() {
  return typeof window !== "undefined" ? window.innerWidth >= DESKTOP_BREAKPOINT : true;
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(getIsDesktop);

  useEffect(() => {
    const handleResize = () => setIsDesktop(getIsDesktop());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isDesktop;
}
