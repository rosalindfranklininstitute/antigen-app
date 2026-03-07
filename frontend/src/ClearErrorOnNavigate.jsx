import { useEffect } from "react";
import { useLocation } from "react-router";

const ClearErrorOnNavigate = ({ setError }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    setError(null);
  }, [pathname, setError]);
  return null;
};

export default ClearErrorOnNavigate;
