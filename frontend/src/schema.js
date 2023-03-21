const projectSchema = {
  apiUrl: "/project",
  viewUrl: "/projects",
  objectName: "project",
  fields: [
    {
      label: "Short title",
      field: "short_title",
      type: "text",
      showInTable: true,
      tableColWidth: "w-1/5",
    },
    {
      label: "Title",
      field: "title",
      type: "text",
      showInTable: true,
      tableColWidth: "w-2/5",
    },
    {
      label: "Description",
      field: "description",
      type: "textarea",
      showInTable: true,
      tableColWidth: "w-2/5",
    },
    { label: "Added by", field: "added_by", hideOnForm: true },
    { label: "Added date", field: "added_date", hideOnForm: true },
  ],
};

const cohortSchema = {
  apiUrl: "/cohort",
  viewUrl: "/cohorts",
  objectName: "cohort",
  parentObjectName: "llama",
  fields: [
    {
      label: "Cohort no.",
      field: "cohort_num",
      type: "text",
      showInTable: true,
      tableColWidth: "w-1/5",
    },
    {
      label: "Llama",
      field: "llama",
      type: "foreignkey",
      apiUrl: "/llama",
      fkDisplayField: "name",
      showInTable: true,
      tableColWidth: "w-1/5",
    },
    {
      label: "Immunisation date",
      field: "immunisation_date",
      type: "date",
      showInTable: true,
      tableColWidth: "w-1/5",
    },
    {
      label: "Blood draw date",
      field: "blood_draw_date",
      type: "date",
      showInTable: true,
      tableColWidth: "w-1/5",
    },
    {
      label: "Antigens",
      field: "antigens",
      type: "selectmulti",
      apiUrl: "/antigen",
      fkDisplayField: "preferred_name",
      fkApiField: "antigen_details",
      showInTable: true,
      tableColWidth: "w-1/5",
    },
    { label: "Added by", field: "added_by", hideOnForm: true },
    { label: "Added date", field: "added_date", hideOnForm: true },
  ],
};

const librarySchema = {
  apiUrl: "/library",
  viewUrl: "/libraries",
  objectName: "library",
  parentObjectName: "project",
  fields: [
    {
      label: "Cohort no.",
      field: "cohort",
      type: "foreignkey",
      apiUrl: "/cohort",
      fkDisplayField: "cohort_num",
      showInTable: true,
      readOnlyOnEdit: true,
      tableColWidth: "w-1/5",
    },
    {
      label: "Project",
      field: "project",
      type: "foreignkey",
      apiUrl: "/project",
      fkDisplayField: "short_title",
      readOnlyOnEdit: true,
      tableColWidth: "w-4/5",
    },
    { label: "Added by", field: "added_by", hideOnForm: true },
    { label: "Added date", field: "added_date", hideOnForm: true },
  ],
};

const llamaSchema = {
  apiUrl: "/llama",
  viewUrl: "/llamas",
  objectName: "llama",
  fields: [
    {
      label: "Name",
      field: "name",
      type: "text",
      showInTable: true,
      tableColWidth: "w-1/5",
    },
    {
      label: "Notes",
      field: "notes",
      type: "textarea",
      showInTable: true,
      tableColWidth: "w-4/5",
    },
    { label: "Added by", field: "added_by", hideOnForm: true },
    { label: "Added date", field: "added_date", hideOnForm: true },
  ],
};

const antigenSchema = {
  apiUrl: "/antigen",
  viewUrl: "/antigens",
  objectName: "antigen",
  fields: [
    {
      label: "UniProt ID",
      field: "uniprot_id",
      type: "text",
      showInTable: true,
      tableColWidth: "w-1/5",
    },
    {
      label: "Preferred name",
      field: "preferred_name",
      type: "text",
      formHint: "Leave blank to populate from UniProt",
      showInTable: true,
      tableColWidth: "w-4/5",
    },
    {
      label: "Sequence",
      field: "sequence",
      type: "text",
      formHint: "Leave blank to populate from UniProt",
    },
    {
      label: "Molecular mass",
      field: "molecular_mass",
      type: "text",
      formHint: "Leave blank to populate from UniProt",
    },
    { label: "Description", field: "description", type: "textarea" },
    { label: "Epitope", field: "epitope", type: "textarea" },
    { label: "Added by", field: "added_by", hideOnForm: true },
    { label: "Added date", field: "added_date", hideOnForm: true },
  ],
};

const elisaSchema = {
  apiUrl: "/elisa_plate",
  viewUrl: "/elisas",
  objectName: "elisa",
  parentObjectName: "library",
  fields: [
    {
      label: "Library",
      field: "library",
      type: "foreignkey",
      apiUrl: "/library",
      fkDisplayField: "cohort_cohort_num",
      showInTable: true,
      tableColWidth: "w-1/6",
    },
    {
      label: "Antigen",
      field: "antigen",
      type: "foreignkey",
      apiUrl: "/antigen",
      fkDisplayField: "preferred_name",
      showInTable: false,
      showOnViewPage: false,
    },
    {
      label: "Plate file",
      field: "plate_file",
      type: "file",
      showInTable: true,
      tableColWidth: "w-3/6",
    },
    {
      label: "Plate OD Values",
      field: "elisawell_set",
      type: "elisaplate",
      hideOnForm: true,
    },
    {
      label: "Optical Density Threshold",
      field: "optical_density_threshold",
      type: "text",
    },
    { label: "Antibody", field: "antibody", type: "text" },
    { label: "Pan round", field: "pan_round", type: "text" },
    { label: "Added by", field: "added_by", hideOnForm: true },
    {
      label: "Added date",
      field: "added_date",
      hideOnForm: true,
      showInTable: true,
      tableColWidth: "w-2/6",
    },
  ],
};

const schemas = {
  project: projectSchema,
  cohort: cohortSchema,
  llama: llamaSchema,
  antigen: antigenSchema,
  elisa: elisaSchema,
  library: librarySchema,
};

export default schemas;
