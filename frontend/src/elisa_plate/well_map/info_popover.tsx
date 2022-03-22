import { Popover, Stack } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAntigen, selectAntigen } from "../../antigen/slice";
import { getElisaWell, selectElisaWell } from "../../elisa_well/slice";
import { ElisaWellRef } from "../../elisa_well/utils";
import { getNanobody, selectNanobody } from "../../nanobody/slice";
import { partialEq } from "../../utils/state_management";
import { selectElisaPlate } from "../slice";

export function ElisaWellInfoPopover(params: {
  elisaWellRef: ElisaWellRef;
  anchorEl: HTMLElement | undefined;
  setAnchorEl: (anchorEl: undefined) => void;
}) {
  const dispatch = useDispatch();
  const elisaPlate = useSelector(
    selectElisaPlate({
      project: params.elisaWellRef.project,
      number: params.elisaWellRef.plate,
    })
  );
  const elisaWell = useSelector(selectElisaWell(params.elisaWellRef));
  const antigen = useSelector(
    elisaWell ? selectAntigen(elisaWell.antigen) : () => undefined
  );
  const nanobody = useSelector(
    elisaWell ? selectNanobody(elisaWell.nanobody) : () => undefined
  );

  useEffect(() => {
    if (
      elisaPlate?.elisawell_set.find((well) =>
        partialEq(well, params.elisaWellRef)
      )
    )
      dispatch(getElisaWell({ elisaWellRef: params.elisaWellRef }));
  });

  useEffect(() => {
    if (elisaWell) {
      dispatch(getAntigen({ ...elisaWell.antigen, plate: elisaWell.plate }));
      dispatch(getNanobody({ ...elisaWell.nanobody, plate: elisaWell.plate }));
    }
  }, [dispatch, elisaWell]);

  return (
    <Popover
      open={Boolean(params.anchorEl && elisaWell)}
      anchorEl={params.anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      onClose={() => params.setAnchorEl(undefined)}
      sx={{ pointerEvents: "none" }}
    >
      <Stack alignItems="center">
        {antigen && <div>Antigen: {antigen.name}</div>}
        {nanobody && <div>Nanobody: {nanobody.name}</div>}
      </Stack>
    </Popover>
  );
}
