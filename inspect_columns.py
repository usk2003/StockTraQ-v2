import pandas as pd
df = pd.read_csv('data/IPO_MasterDB.csv')
with open('columns.txt', 'w') as f:
    f.write("\n".join(df.columns.tolist()))
