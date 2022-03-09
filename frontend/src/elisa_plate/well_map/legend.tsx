import { Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { selectAntigen } from "../../antigen/slice";
import { Antigen } from "../../antigen/utils";
import { selectElisaWell } from "../../elisa_well/slice";
import { ElisaWell } from "../../elisa_well/utils";
import { selectNanobody } from "../../nanobody/slice";
import { Nanobody } from "../../nanobody/utils";
import { RootState } from "../../store";
import { selectElisaPlate } from "../slice";
import { ElisaPlate } from "../utils";
import { uuidToColor } from "./utils";

export function ElisaPlateMapLegend(params: { plate: string }) {
  const elisaPlate = useSelector(selectElisaPlate(params.plate)) as ElisaPlate;
  const elisaWells = useSelector((state: RootState) =>
    elisaPlate?.elisawell_set.map((location) =>
      selectElisaWell({ plate: params.plate, location })(state)
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

  const LegendEntry = (params: { uuid: string; label: string }) => (
    <Stack direction="row" spacing={1}>
      <Paper
        sx={{
          background: `${uuidToColor(params.uuid)}`,
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
              <LegendEntry uuid={antigen.uuid} label={antigen.name} key={idx} />
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
                uuid={nanobody.uuid}
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
