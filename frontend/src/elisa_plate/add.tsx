import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { DispatchType } from "../store";
import { LoadingPaper } from "../utils/api";
import { postElisaPlate } from "./slice";

export default function AddElisaPlateView() {
  const dispatch = useDispatch<DispatchType>();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(postElisaPlate({ threshold: 0.0 })).then((uuid) =>
      navigate(`/elisa_plate/${uuid}/`)
    );
  }, [dispatch, navigate]);

  return <LoadingPaper text={"Adding new elisa plate to database."} />;
}
