import { Badge, Button, Paper } from "@mui/material";
import { useContext, useState } from "react";
import { ElisaWellRef } from "../../elisa_well/utils";
import { ElisaWellEditPopover } from "./edit_popover";
import { ElisaWellInfoPopover } from "./info_popover";
import { numToColor } from "./utils";
import { ElisaWellMapContext } from "./well_map_context";

/**
 *
 * A circular MUI Paper element which displays the antigen, nanobody and
 * functionality of the elisa well as the left colour, right colour and a
 * circular badge respectively. The element provides a hover popover which
 * shows textual information including the antigen and nanobody names and an
 * edit popover which allows editing of the antigen, nanobody and optical
 * density of a well. Elisa well, antigen and nanobody information is retrieved
 * from the elisa well map context
 *
 * @param params An elisa well reference from which the elisa well can be
 * retrievd.
 * @param params.elisaWellRef The elisa well reference.
 * @returns A circular MUI Paper element which displays the antigen, nanobody
 * and functionality of the elisa well
 */
export function ElisaWellElement(params: { elisaWellRef: ElisaWellRef }) {
  const { getElisaWell, getAntigen, getNanobody } =
    useContext(ElisaWellMapContext);
  const elisaWell = getElisaWell(params.elisaWellRef);
  const antigen = elisaWell ? getAntigen(elisaWell.antigen) : undefined;
  const nanobody = elisaWell ? getNanobody(elisaWell.nanobody) : undefined;

  const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLElement | undefined>(
    undefined
  );
  const [editAnchorEl, setEditAnchorEl] = useState<HTMLElement | undefined>(
    undefined
  );

  const antigenColor = numToColor(antigen?.number);
  const nanobodyColor = numToColor(nanobody?.number);

  return (
    <Badge
      badgeContent={elisaWell?.functional ? "" : null}
      color="success"
      overlap="circular"
    >
      <Paper
        sx={{
          background: `linear-gradient(90deg,
            ${antigenColor} 50%,
            ${nanobodyColor} 50%)`,
          borderRadius: "50%",
          overflow: "hidden",
        }}
      >
        <Button
          sx={{
            width: "100%",
            padding: "0 0 100% 0",
          }}
          onMouseEnter={(evt) => setInfoAnchorEl(evt.currentTarget)}
          onMouseLeave={() => setInfoAnchorEl(undefined)}
          onClick={(evt) => {
            setInfoAnchorEl(undefined);
            setEditAnchorEl(evt.currentTarget);
          }}
          data-testid={elisaWell?.location}
        />
        <ElisaWellInfoPopover
          elisaWellRef={params.elisaWellRef}
          anchorEl={infoAnchorEl}
          setAnchorEl={setInfoAnchorEl}
        />
        <ElisaWellEditPopover
          elisaWellRef={params.elisaWellRef}
          anchorEl={editAnchorEl}
          setAnchorEl={setEditAnchorEl}
        />
      </Paper>
    </Badge>
  );
}
