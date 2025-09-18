import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = ({ dep }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollableElement = document.querySelector(".scrollable-container"); 
    if (scrollableElement) {
      scrollableElement.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname, dep]);

  return null;
};

export default ScrollToTop;
