import { Popover, Stack } from "@mui/material";
import { useContext } from "react";

import { ElisaWellRef } from "../../elisa_well/utils";

import { ElisaWellMapContext } from "./well_map_context";

/**
 *
 * A MUI Popover element which displays the antigen and nanobody names
 * corresponding to a well. Popover location and visibility are controlled via
 * the presence of an anchor element, with a callback passed such that the
 * component can hide itself by setting the anchor element to undefined. Elisa
 * well, antigen and nanobody information is retrieved from the elisa well map
 * context
 *
 * @param params An elisa well reference from which the elisa well, antigen and
 * nanboody can be retrieved, an anchor element controlling element visibility
 * and a callback to set the anchor element to undefined
 * @param params.elisaWellRef The elisa well reference
 * @param params.anchorEl The anchor element controlling visibility
 * @param params.setAnchorEl The callback to hide the component
 * @returns A MUI Popover element which displays antigen and nanobody names
 */
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
