import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  Tab,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import {
  getElisaPlate,
  selectElisaPlate,
  selectLoadingElisaPlate,
} from "./slice";
import { ElisaPlateInfo, ElisaPlateRef } from "./utils";
import { ElisaPlateMapLegend } from "./well_map/legend";
import { ElisaPlateThresholdSlider } from "./well_map/threshold_slider";
import { ElisaWellMap } from "./well_map/well_map";

type StrElisaPlateKey = { [K in keyof ElisaPlateRef]: string };

/**
 *
 * A MUI Card with project and number as title and tab pages for the well map -
 * containing the well map, threshold slider and the well map legend - and a
 * table view
 *
 * @returns A MUI Card with project and number as title and tab pages for the
 * well map and a table view
 */
export default function ElisaPlateView() {
  let { project, number: number_str } =
    useParams<StrElisaPlateKey>() as StrElisaPlateKey;
  const number = parseInt(number_str);
  const dispatch = useDispatch();
  const elisaPlate = useSelector(selectElisaPlate({ project, number }));
  const loading = useSelector(selectLoadingElisaPlate);
  const [tab, setTab] = useState<string>("map");

  useEffect(() => {
    dispatch(getElisaPlate({ project, number }));
  }, [dispatch, project, number]);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("hello how are you ");
    let data = new FormData();
    // will sort out and make nice later
    const file = event!.target!.files![0];
    console.log(file.type);
    data.append("number", elisaPlate!.number.toString());
    data.append("csv_file", file);

    fetch(`/api/upload_csv/`, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {},
      body: data,
    });
  };

  if (loading)
    return <LoadingPaper text="Retrieving elisa plate from database." />;
  if (!elisaPlate)
    return (
      <FailedRetrievalPaper
        text={`Could not retrieve entry for ${window.location.href
          .split("/")
          .pop()}`}
      />
    );

  return (
    <Card>
      <CardContent>
        <Stack gap={2} divider={<Divider />}>
          <Typography variant="h4">
            {elisaPlate.project}:{elisaPlate.number}
          </Typography>
          <TabContext value={tab}>
            <TabList onChange={(evt, tab) => setTab(tab)}>
              <Tab label="Map" value="map" />
              <Tab label="Table" value="table" />
            </TabList>
            <TabPanel value="map" tabIndex={0}>
              <Stack gap={2} divider={<Divider />}>
                <ElisaWellMap elisaPlateRef={elisaPlate} />
                <Stack direction="row" spacing={2}>
                  <Button variant="outlined" component="label">
                    Upload CSV
                    <input
                      accept=".csv"
                      type="file"
                      onChange={handleFileInput}
                      hidden
                    />
                  </Button>
                  <ElisaPlateThresholdSlider elisaPlateRef={elisaPlate} />
                </Stack>
                <ElisaPlateMapLegend elisaPlateRef={elisaPlate} />
              </Stack>
            </TabPanel>
            <TabPanel value="table">
              <ElisaPlateInfo elisaPlateRef={elisaPlate} />
            </TabPanel>
          </TabContext>
        </Stack>
      </CardContent>
    </Card>
  );
}
