import { Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAntigens, selectAntigen } from "../../antigen/slice";
import { Antigen, AntigenRef } from "../../antigen/utils";
import { getElisaWells } from "../../elisa_well/slice";
import { getNanobodies, selectNanobody } from "../../nanobody/slice";
import { Nanobody, NanobodyRef } from "../../nanobody/utils";
import { DispatchType, RootState } from "../../store";
import { ElisaPlateRef } from "../utils";
import { numToColor } from "./utils";

/**
 *
 * A grid of legends for antigens and nanobodies respecitvely, each legend
 * displays a list of entries which consist of a square region coloured by the
 * item number and the item name. Elisa well, antigen and nanobody information
 * is retrieved from the redux store with a dispatch exected to obtain it if
 * unavailable
 *
 * @param params An elisa plate reference from which the elisa plate, elisa
 * wells, antigens and nanobodies can be retrieved
 * @param params.elisaPlateRef The elisa plate reference
 * @returns A grid of lengends, containing lists of antigen and nanobody names
 * with corresponding colors
 */
export function ElisaPlateMapLegend(params: { elisaPlateRef: ElisaPlateRef }) {
  const dispatch = useDispatch<DispatchType>();
  const elisaWells = useSelector((state: RootState) =>
    state.elisaWells.elisaWells.filter(
      (elisaWell) =>
        elisaWell.project === params.elisaPlateRef.project &&
        elisaWell.plate === params.elisaPlateRef.number
    )
  );
  const antigens = useSelector((state: RootState) =>
    elisaWells.map((elisaWell) => selectAntigen(elisaWell.antigen)(state))
  )
    .filter((antigen): antigen is Antigen => !!antigen)
    .filter((antigen, index, antigens) => antigens.indexOf(antigen) === index);
  const nanobodies = useSelector((state: RootState) =>
    elisaWells.map((elisaWell) => selectNanobody(elisaWell.nanobody)(state))
  )
    .filter((nanobody): nanobody is Nanobody => !!nanobody)
    .filter((antigen, index, antigens) => antigens.indexOf(antigen) === index);

  useEffect(() => {
    dispatch(
      getElisaWells({
        project: params.elisaPlateRef.project,
        plate: params.elisaPlateRef.number,
      })
    );
    dispatch(
      getAntigens({
        project: params.elisaPlateRef.project,
        plate: params.elisaPlateRef.number,
      })
    );
    dispatch(
      getNanobodies({
        project: params.elisaPlateRef.project,
        plate: params.elisaPlateRef.number,
      })
    );
  });

  const LegendEntry = (params: {
    elisaWellRef: AntigenRef | NanobodyRef;
    label: string;
  }) => (
    <Stack direction="row" spacing={1}>
      <Paper
        sx={{
          background: `${numToColor(params.elisaWellRef.number)}`,
          display: "table-row",
          aspectRatio: "1",
        }}
      />
      <Typography>{params.label}</Typography>
    </Stack>
  );

  return (
    <Grid container columns={2} columnSpacing={2}>
      <Grid item xs={1}>
        <Stack gap={2} divider={<Divider />}>
          <Typography>Antigens</Typography>
          <Stack spacing={2}>
            {antigens.map((antigen, idx) => (
              <LegendEntry
                elisaWellRef={antigen}
                label={antigen.name}
                key={idx}
              />
            ))}
          </Stack>
        </Stack>
      </Grid>
      <Grid item xs={1}>
        <Stack gap={2} divider={<Divider />}>
          <Typography>Nanobodies</Typography>
          <Stack spacing={2}>
            {nanobodies.map((nanobody, idx) => (
              <LegendEntry
                elisaWellRef={nanobody}
                label={nanobody.name}
                key={idx}
              />
            ))}
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
}
