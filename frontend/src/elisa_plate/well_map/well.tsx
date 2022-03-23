import { Badge, Button, Paper } from "@mui/material";
import { useContext, useState } from "react";
import { ElisaWellRef } from "../../elisa_well/utils";
import { ElisaWellEditPopover } from "./edit_popover";
import { ElisaWellInfoPopover } from "./info_popover";
import { objToColor } from "./utils";
import { ElisaWellMapContext } from "./well_map_context";

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

  const antigenColor = objToColor(antigen);
  const nanobodyColor = objToColor(nanobody);

  return (
    <Badge
      badgeContent={elisaWell?.functional ? "" : null}
      color="success"
      overlap="circular"
    >
      <Paper
        sx={{
          background: `linear-gradient(90deg, ${antigenColor} 50%, ${nanobodyColor} 50%)`,
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
