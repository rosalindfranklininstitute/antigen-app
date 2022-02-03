export type Antigen = {
    uuid: string
    sequence: string
    molecular_mass: number
    name: string
    uniprot_accession_number: string
    antigen_elisa_wells: Array<string>
    creation_time: Date
};
