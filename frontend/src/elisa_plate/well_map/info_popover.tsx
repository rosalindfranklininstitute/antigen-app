import { Popover, Stack } from "@mui/material";
import { useContext } from "react";

import { ElisaWellRef } from "../../elisa_well/utils";

import { ElisaWellMapContext } from "./well_map_context";

export function ElisaWellInfoPopover(params: {
  elisaWellRef: ElisaWellRef;
  anchorEl: HTMLElement | undefined;
  setAnchorEl: (anchorEl: undefined) => void;
}) {
  const { getElisaWell, getAntigen, getNanobody } =
    useContext(ElisaWellMapContext);
  const elisaWell = getElisaWell(params.elisaWellRef);
  const antigen = elisaWell ? getAntigen(elisaWell.antigen) : undefined;
  const nanobody = elisaWell ? getNanobody(elisaWell.nanobody) : undefined;

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
