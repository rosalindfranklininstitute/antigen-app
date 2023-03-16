import pandas as pd


def parse_elisa_file(elisa):
    df = pd.read_excel(elisa)
    df = df.iloc[14:22, 1:13]

    df = df.astype(float)
    vals = df.values.ravel()

    assert len(vals) == 96

    return vals
