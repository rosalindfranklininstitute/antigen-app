import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddLinkIcon from "@mui/icons-material/AddLink";
import CreateIcon from "@mui/icons-material/Create";
import ListIcon from "@mui/icons-material/List";
import { useState, MouseEvent } from "react";
import { Link as RouterLink } from "react-router-dom";

function ProjectCard() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">Projects</Typography>
      </CardContent>
      <CardActions>
        <Button startIcon={<ListIcon />} component={RouterLink} to="/project/">
          View All
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/project/add/"
        >
          Add New
        </Button>
      </CardActions>
    </Card>
  );
}

function AntigenCard() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const add_open = Boolean(anchorEl);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">Antigens</Typography>
      </CardContent>
      <CardActions>
        <Button startIcon={<ListIcon />} component={RouterLink} to="/antigen/">
          View All
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          aria-controls={add_open ? "add-enu" : undefined}
          aria-haspopup="true"
          aria-expanded={add_open ? "true" : undefined}
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            setAnchorEl(event.currentTarget);
          }}
        >
          Add New
        </Button>
        <Menu
          id="add-menu"
          anchorEl={anchorEl}
          open={add_open}
          onClose={() => {
            setAnchorEl(null);
          }}
          MenuListProps={{ "aria-labelledby": "add-button" }}
        >
          <MenuItem component={RouterLink} to="/antigen/uniprot/add/">
            <ListItemIcon>
              <AddLinkIcon />
            </ListItemIcon>
            <ListItemText>From UniProt</ListItemText>
          </MenuItem>
          <MenuItem component={RouterLink} to="/antigen/local/add/">
            <ListItemIcon>
              <CreateIcon />
            </ListItemIcon>
            <ListItemText>Manual Entry</ListItemText>
          </MenuItem>
        </Menu>
      </CardActions>
    </Card>
  );
}

function NanobodyCard() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">Nanobodies</Typography>
      </CardContent>
      <CardActions>
        <Button startIcon={<ListIcon />} component={RouterLink} to="/nanobody/">
          View All
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/nanobody/add/"
        >
          Add New
        </Button>
      </CardActions>
    </Card>
  );
}

function ElisaPlateCard() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">Elisa Plates</Typography>
      </CardContent>
      <CardActions>
        <Button
          startIcon={<ListIcon />}
          component={RouterLink}
          to="/elisa_plate/"
        >
          View All
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/elisa_plate/add/"
        >
          Add New
        </Button>
      </CardActions>
    </Card>
  );
}

function ElisaWellCard() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">Elisa Wells</Typography>
      </CardContent>
      <CardActions>
        <Button
          startIcon={<ListIcon />}
          component={RouterLink}
          to="/elisa_well/"
        >
          View All
        </Button>
      </CardActions>
    </Card>
  );
}

function HomeView() {
  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item>
        <ProjectCard />
      </Grid>
      <Grid item>
        <AntigenCard />
      </Grid>
      <Grid item>
        <NanobodyCard />
      </Grid>
      <Grid item>
        <ElisaPlateCard />
      </Grid>
      <Grid item>
        <ElisaWellCard />
      </Grid>
    </Grid>
  );
}

export { HomeView };
