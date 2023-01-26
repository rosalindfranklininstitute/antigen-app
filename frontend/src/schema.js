const projectSchema = {
    "apiUrl": "/project",
    "viewUrl": "/projects",
    "objectName": "project",
    "fields": [{"label": "Short title", "field": "short_title", "type": "text", "showInTable": true}, 
               {"label": "Title", "field": "title", "type": "text", "showInTable": true},
               {"label": "Description", "field": "description", "type": "textarea", "showInTable": true},
               {"label": "Added by", "field": "added_by", "hideOnForm": true},
               {"label": "Added date", "field": "added_date", "hideOnForm": true}
              ]
}

const librarySchema = {
    "apiUrl": "/library",
    "viewUrl": "/libraries",
    "objectName": "library",
    "parentObjectName": "project",
    "fields": [{"label": "Cohort no.", "field": "cohort_num", "type": "text", "showInTable": true}, 
               {"label": "Project", "field": "project", "type": "foreignkey", "apiUrl": "/project", "fkDisplayField": "short_title", "readOnlyOnEdit": true},
               {"label": "Llama", "field": "llama", "type": "foreignkey", "apiUrl": "/llama", "fkDisplayField": "name", "showInTable": true},
               {"label": "Immunisation date", "field": "immunisation_date", "type": "date"},
               {"label": "Blood draw date", "field": "blood_draw_date", "type": "date"},
               {"label": "Added by", "field": "added_by", "hideOnForm": true},
               {"label": "Added date", "field": "added_date", "hideOnForm": true}
              ]
}

const llamaSchema = {
    "apiUrl": "/llama",
    "viewUrl": "/llamas",
    "objectName": "llama",
    "fields": [{"label": "Name", "field": "name", "type": "text", "showInTable": true},
               {"label": "Notes", "field": "notes", "type": "textarea", "showInTable": true},
               {"label": "Added by", "field": "added_by", "hideOnForm": true},
               {"label": "Added date", "field": "added_date", "hideOnForm": true}               
              ]
}

const antigenSchema = {
    "apiUrl": "/antigen",
    "viewUrl": "/antigens",
    "objectName": "antigen",
    "fields": [{"label": "Uniprot ID", "field": "uniprot_id", "type": "text", "showInTable": true},
               {"label": "Preferred name", "field": "preferred_name", "type": "text", "showInTable": true},
               {"label": "Sequence", "field": "sequence", "type": "text"},
               {"label": "Molecular mass", "field": "molecular_mass", "type": "text"},
               {"label": "Description", "field": "description", "type": "textarea"},
               {"label": "Epitope", "field": "epitope", "type": "textarea"},
               {"label": "Added by", "field": "added_by", "hideOnForm": true},
               {"label": "Added date", "field": "added_date", "hideOnForm": true}
              ]
}

const elisaSchema = {
    "apiUrl": "/elisa_plate",
    "viewUrl": "/elisas",
    "objectName": "elisa",
    "fields": [{"label": "Added by", "field": "added_by", "hideOnForm": true, "showInTable": true},
               {"label": "OD values", "field": "elisawell_set", type: "elisaplate"},
               {"label": "Optical Density Threshold", "field": "optical_density_threshold", "type": "text"},
               {"label": "Added date", "field": "added_date", "hideOnForm": true}
              ]
}


const schemas = {
    "project": projectSchema,
    "library": librarySchema,
    "llama": llamaSchema,
    "antigen": antigenSchema,
    "elisa": elisaSchema
}

export default schemas;