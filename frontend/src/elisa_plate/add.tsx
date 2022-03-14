import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { selectCurrentProject } from "../project/slice";
import { projectItemURI } from "../project/utils";
import { DispatchType } from "../store";
import { LoadingPaper } from "../utils/api";
import { postElisaPlate } from "./slice";
import { ElisaPlate } from "./utils";

export default function AddElisaPlateView() {
  const dispatch = useDispatch<DispatchType>();
  const navigate = useNavigate();
  const currentProject = useSelector(selectCurrentProject);

  useEffect(() => {
    if (currentProject)
      dispatch(
        postElisaPlate({ project: currentProject, threshold: 0.0 })
      ).then((action) => {
        if (action.meta.requestStatus === "fulfilled")
          navigate(
            `/elisa_plate/${projectItemURI(action.payload as ElisaPlate)}/`
          );
      });
  }, [dispatch, navigate, currentProject]);

  return <LoadingPaper text={"Adding new elisa plate to database."} />;
}
