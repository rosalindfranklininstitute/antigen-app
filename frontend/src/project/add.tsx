import { LoadingButton } from "@mui/lab";
import { Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SendIcon from "@mui/icons-material/Send";
import { postProject, selectLoadingProject, switchProject } from "./slice";
import { DispatchType } from "../store";
import { Project } from "./utils";
import { useNavigate } from "react-router-dom";

export default function AddProjectView() {
  const dispatch = useDispatch<DispatchType>();
  const navigate = useNavigate();
  const [shortTitle, setShortTitle] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const loading = useSelector(selectLoadingProject);

  const submit = () =>
    dispatch(postProject({ short_title: shortTitle, title, description })).then(
      (action) => {
        if (action.meta.requestStatus === "fulfilled") {
          dispatch(switchProject((action.payload as Project).short_title));
          navigate("/");
        }
      }
    );

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h4">Add new project</Typography>
          <TextField
            label="Short Title"
            value={shortTitle}
            onChange={(evt) => setShortTitle(evt.target.value)}
            required
          />
          <TextField
            label="Title"
            value={title}
            onChange={(evt) => setTitle(evt.target.value)}
            required
          />
          <TextField
            label="Description"
            value={description}
            onChange={(evt) => setDescription(evt.target.value)}
            required
            multiline
            rows={8}
          />
          <LoadingButton
            variant="contained"
            loading={loading}
            endIcon={<SendIcon />}
            onClick={submit}
          >
            Submit
          </LoadingButton>
        </Stack>
      </CardContent>
    </Card>
  );
}
