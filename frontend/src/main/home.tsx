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

/**
 *
 * A MUI Card with the header Projects and buttons which link to the aggregate
 * project view and the add project view, these buttons are styled as text with
 * the list icon and contained with the add icon respectively
 *
 * @returns A card containing the header Projects and buttons which link to the
 * aggregate and add project views
 */
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

/**
 *
 * A MUI Card with header Antigens and buttons which link to the aggregate
 * antigen view and a dropdown of buttons which link to the add from uniprot
 * antigen and add local antigen views, these buttons are styled as text with
 * the list icon and contained with the add icon respectively, with dropdown
 * buttons styled as text with the add link icon and create icon respectively
 *
 * @returns A card containing the header Projects and buttons which link the
 * aggregate and add local and add from uniprot views
 */
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

/**
 * A MUI Card with header Nanobodies and buttons which link to the aggregate
 * nanobody view and the add nanobody view, these buttons are styled as text
 * with the list icon and contained with the add icon respectively
 *
 * @returns A card containing the header Nanobodies and buttons which link to
 * the aggregate and add nanobody views
 */
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

/**
 *
 * A MUI Card with the header Elisa Plates and buttons which link to the
 * aggregate elisa plate view and the add elisa plate view, these buttons are
 * styled as text with the list icon and contained with the add icon
 * respectively
 *
 * @returns A card containing the header Elisa Plates and buttons which link to
 * the aggregate and add elisa plate views
 */
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
          data-testid="elisa_plate_link"
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

/**
 *
 * A MUI Card with the header Elisa Wells and a button which link to the
 * aggregate elisa well view styled as text with the list icon
 *
 * @returns A card containing the header Projects and buttons which link to the
 * aggregate elisa well view
 */
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

/**
 *
 * A MUI grid containing the project, antigen, nanobody, elisa plate
 * and elisa well cards
 *
 * @returns A MUI grid containing the project, antigen, nanobody, elisa plate
 * and elisa well cards
 */
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
