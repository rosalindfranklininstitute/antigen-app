import { Badge, Button, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAntigen, selectAntigen } from "../../antigen/slice";
import { getElisaWell, selectElisaWell } from "../../elisa_well/slice";
import { ElisaWellRef } from "../../elisa_well/utils";
import { getNanobody, selectNanobody } from "../../nanobody/slice";
import { partialEq } from "../../utils/state_management";
import { selectElisaPlate } from "../slice";
import { ElisaWellEditPopover } from "./edit_popover";
import { ElisaWellInfoPopover } from "./info_popover";
import { objToColor } from "./utils";

export function ElisaWellElement(params: { elisaWellRef: ElisaWellRef }) {
  const dispatch = useDispatch();
  const elisaPlate = useSelector(
    selectElisaPlate({
      project: params.elisaWellRef.project,
      number: params.elisaWellRef.plate,
    })
  );
  const elisaWell = useSelector(
    params.elisaWellRef ? selectElisaWell(params.elisaWellRef) : () => undefined
  );
  const antigen = useSelector(
    elisaWell ? selectAntigen(elisaWell.antigen) : () => undefined
  );
  const nanobody = useSelector(
    elisaWell ? selectNanobody(elisaWell.nanobody) : () => undefined
  );

  const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLElement | null>(null);
  const [editAnchorEl, setEditAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (
      elisaPlate?.elisawell_set.find((well) =>
        partialEq(well, params.elisaWellRef)
      )
    )
      dispatch(getElisaWell({ elisaWellRef: params.elisaWellRef }));
  }, [dispatch, params, elisaPlate]);

  useEffect(() => {
    if (elisaWell) {
      dispatch(getAntigen(elisaWell.antigen));
      dispatch(getNanobody(elisaWell.nanobody));
    }
  }, [dispatch, elisaWell]);

  const antigenColor = objToColor(antigen);
  const nanobodyColor = objToColor(nanobody);

  const InfoPopover = () =>
    params.elisaWellRef ? (
      <ElisaWellInfoPopover
        elisaWellRef={params.elisaWellRef}
        anchorEl={infoAnchorEl}
        setAnchorEl={setInfoAnchorEl}
      />
    ) : null;
  const EditPopover = () =>
    params.elisaWellRef ? (
      <ElisaWellEditPopover
        elisaWellRef={params.elisaWellRef}
        anchorEl={editAnchorEl}
        setAnchorEl={setEditAnchorEl}
      />
    ) : null;

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
          onMouseLeave={() => setInfoAnchorEl(null)}
          onClick={(evt) => {
            setInfoAnchorEl(null);
            setEditAnchorEl(evt.currentTarget);
          }}
        />
        <InfoPopover />
        <EditPopover />
      </Paper>
    </Badge>
  );
}
