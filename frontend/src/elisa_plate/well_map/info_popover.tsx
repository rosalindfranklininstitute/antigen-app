import { Popover, Stack } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAntigen, selectAntigen } from "../../antigen/slice";
import { getElisaWell, selectElisaWell } from "../../elisa_well/slice";
import { ElisaWellKey } from "../../elisa_well/utils";
import { getNanobody, selectNanobody } from "../../nanobody/slice";
import { selectElisaPlate } from "../slice";

export function ElisaWellInfoPopover(params: {
  wellKey: ElisaWellKey;
  anchorEl: HTMLElement | null;
  setAnchorEl: (anchorEl: HTMLAnchorElement | null) => void;
}) {
  const dispatch = useDispatch();
  const elisaPlate = useSelector(selectElisaPlate(params.wellKey.plate));
  const elisaWell = useSelector(selectElisaWell(params.wellKey));
  const antigen = useSelector(
    elisaWell ? selectAntigen(elisaWell.antigen) : () => undefined
  );
  const nanobody = useSelector(
    elisaWell ? selectNanobody(elisaWell.nanobody) : () => undefined
  );

  useEffect(() => {
    if (
      elisaPlate?.elisawell_set.find(
        (location) => location === params.wellKey.location
      )
    )
      dispatch(getElisaWell(params.wellKey));
  });

  useEffect(() => {
    if (elisaWell) {
      dispatch(getAntigen(elisaWell.antigen));
      dispatch(getNanobody(elisaWell.nanobody));
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
      onClose={() => params.setAnchorEl(null)}
      sx={{ pointerEvents: "none" }}
    >
      <Stack alignItems="center">
        {antigen && <div>Antigen: {antigen.name}</div>}
        {nanobody && <div>Nanobody: {nanobody.name}</div>}
      </Stack>
    </Popover>
  );
}
