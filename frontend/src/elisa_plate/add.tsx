import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { selectCurrentProject } from "../project/slice";
import { projectItemURI } from "../project/utils";
import { DispatchType } from "../store";
import { LoadingPaper } from "../utils/api";
import { postElisaPlate } from "./slice";
import { ElisaPlate } from "./utils";

/**
 *
 * A MUI Card containing a form for adding a new elisa plate; the form consists
 * of a dropdown to select the project which it corresponds to, defaulting to
 * the active project, and a submit button which when pressed dispatches a
 * request to store the elisa plate and redirects the user to the individual
 * view of the newly created plate. Available projects are retrieved from the
 * redux store with a dispatch executed to obtain them if unavailable
 *
 * @returns A MUI card containing a form for adding a new elisa plate
 */
export default function AddElisaPlateView() {
  const dispatch = useDispatch<DispatchType>();
  const navigate = useNavigate();
  const currentProject = useSelector(selectCurrentProject);

  useEffect(() => {
    if (currentProject)
      dispatch(
        postElisaPlate({ project: currentProject.short_title, threshold: 0.0 })
      ).then((action) => {
        if (action.meta.requestStatus === "fulfilled")
          navigate(
            `/elisa_plate/${projectItemURI(action.payload as ElisaPlate)}/`
          );
      });
  }, [dispatch, navigate, currentProject]);

  return <LoadingPaper text={"Adding new elisa plate to database."} />;
}
