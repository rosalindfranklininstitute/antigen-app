import { Typography, Grid, Stack, Box } from "@mui/material";
import { ElisaPlateRef } from "../utils";
import { ElisaWellElement } from "./well";

export function ElisaWellMap(params: { elisaPlateRef: ElisaPlateRef }) {
  return (
    <Grid container columns={13} spacing={2}>
      <Grid item xs={1} />
      <Grid item xs={12}>
        <Stack width="100%" direction="row" spacing={2}>
          {Array.from({ length: 12 }, (_, col) => (
            <Typography align="center" key={col} flex={1}>
              {col + 1}
            </Typography>
          ))}
        </Stack>
      </Grid>
      <Grid item xs={1}>
        <Stack height="100%" spacing={2}>
          {Array.from({ length: 8 }, (_, row) => (
            <Box
              key={row}
              flex={1}
              alignItems="center"
              justifyContent="center"
              display="flex"
            >
              <Typography>{String.fromCharCode(row + 65)}</Typography>
            </Box>
          ))}
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Grid container columns={12} spacing={2}>
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 12 }, (_, col) => (
              <Grid item xs={1} key={row * 12 + col}>
                <ElisaWellElement
                  elisaWellRef={{
                    project: params.elisaPlateRef.project,
                    plate: params.elisaPlateRef.number,
                    location: row * 12 + col + 1,
                  }}
                />
              </Grid>
            ))
          ).flat()}
        </Grid>
      </Grid>
    </Grid>
  );
}
