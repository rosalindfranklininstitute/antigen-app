import { Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { selectAntigen } from "../../antigen/slice";
import { Antigen, AntigenRef } from "../../antigen/utils";
import { selectElisaWell } from "../../elisa_well/slice";
import { ElisaWell } from "../../elisa_well/utils";
import { selectNanobody } from "../../nanobody/slice";
import { Nanobody, NanobodyRef } from "../../nanobody/utils";
import { RootState } from "../../store";
import { selectElisaPlate } from "../slice";
import { ElisaPlate, ElisaPlateRef } from "../utils";
import { numToColor } from "./utils";

export function ElisaPlateMapLegend(params: { elisaWellRef: ElisaPlateRef }) {
  const elisaPlate = useSelector(
    selectElisaPlate(params.elisaWellRef)
  ) as ElisaPlate;
  const elisaWells = useSelector((state: RootState) =>
    elisaPlate?.elisawell_set.map((elisaWellRef) =>
      selectElisaWell(elisaWellRef)(state)
    )
  ).filter((elisaWell): elisaWell is ElisaWell => !!elisaWell);
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
