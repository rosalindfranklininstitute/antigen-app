import { Typography, Grid, Stack, Divider } from "@mui/material";
import { ElisaPlateRef } from "../utils";
import { ElisaPlateMapLegend } from "./legend";
import { ElisaPlateThresholdSlider } from "./threshold_slider";
import { ElisaWellElement } from "./well";

export function ElisaWellMapElement(params: { elisaPlateRef: ElisaPlateRef }) {
  return (
    <Stack gap={2} divider={<Divider />}>
      <Grid container spacing={2} columns={13}>
        <Grid item xs={1} key={0} />
        {Array.from({ length: 12 }, (_, col) => (
          <Grid item xs={1} key={col + 1}>
            <Typography>{col + 1}</Typography>
          </Grid>
        ))}
        {Array.from({ length: 8 }, (_, row) => {
          return [
            <Grid item xs={1} key={(row + 1) * 13}>
              <Typography>{String.fromCharCode(row + 65)}</Typography>
            </Grid>,
            Array.from({ length: 12 }, (_, col) => (
              <Grid item xs={1} key={(row + 1) * 13 + col}>
                <ElisaWellElement
                  elisaWellRef={{
                    project: params.elisaPlateRef.project,
                    plate: params.elisaPlateRef.number,
                    location: row * 12 + col + 1,
                  }}
                />
              </Grid>
            )),
          ];
        })}
      </Grid>
      <ElisaPlateThresholdSlider elisaPlateRef={params.elisaPlateRef} />
      <ElisaPlateMapLegend elisaWellRef={params.elisaPlateRef} />
    </Stack>
  );
}
