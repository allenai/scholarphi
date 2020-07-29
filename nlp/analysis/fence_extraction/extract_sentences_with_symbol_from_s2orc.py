import os
import sys
import re
import pandas as pd
from os.path import expanduser

# condition
condition='_limit=100'

# files
HOME = expanduser("~")
INFILE_S2ORC = 's2orc_fence_with_latex{}.txt'.format(condition)
INFILE_SYMBOL_LIST = 'unique_symbol_in_tex_filtered.txt'

# load latex symbols
symbols = open(INFILE_SYMBOL_LIST,'r').readlines()
symbols = [s.strip() for s in symbols]
print('Total number of symbols', len(symbols))


# extract sentences that include the latex symbols and save them in an individual file
excel_writer = pd.ExcelWriter('output/all_sentences_with_symbols{}.xlsx'.format(condition), engine='xlsxwriter')
stats_list = []
for sid, symbol in enumerate(symbols):
    OUTFILE_SYMBOL = 'output/{}.txt'.format(symbol)

    # fout = open(OUTFILE_SYMBOL,'w')

    lines = []
    with open(os.path.join(HOME, 'data', 'gorc', INFILE_S2ORC)) as f:
        for line in f:
            line = line.strip()
            lines.append(line)

    cnt = 0
    context_window = 1
    data = []
    for lid, line in enumerate(lines):
        # if symbol has multiple notations (e.g., (\ |\ )) check notations individually
        tks = line.split('\t')
        if len(tks) != 2:
            continue
        is_symbol_included = bool(tks[0])
        line = tks[1]
        symbol_tokens = symbol.split(' ')
        symbol_exist_in_line = [True if stoken in line else False for stoken in symbol_tokens]
        if all(symbol_exist_in_line) and is_symbol_included:
            context = lines[lid-context_window:lid+context_window+1]
            context = [' '.join(c.split('\t')[1:]) for c in context]
            d = {}
            d['id'] = cnt
            d['sentence_id'] = lid
            d['symbol'] = symbol
            d['context'] = '\n'.join(context)
            d['sentence'] = line
            data.append(d)

            cnt += 1

    # if nothing, then skip the symbol
    if len(data) == 0:
        continue

    # write to file
    df = pd.DataFrame(data)
    df = df.applymap(lambda x: x.encode('unicode_escape').
                 decode('utf-8') if isinstance(x, str) else x)

    # excel doesn't allow sheet name with 'p[:*?/\'
    symbol_clean = re.sub('[\[\]\:\^\*\?\\\/]+', '', symbol)
    # excel doesn't allow >=31 length of sheet name
    symbol_clean = symbol_clean[:31]
    # excel doens't allow case sensitive sheet name (delta == Delta). In such cases, add '_' at the end
    try:
        df.to_excel(excel_writer, sheet_name = symbol_clean, index=False)
    except Exception as e:
        print(e)
        symbol_clean = symbol_clean + '_'
        df.to_excel(excel_writer, sheet_name = symbol_clean, index=False)

    print('Saved total {} lines in {}'.format(cnt, OUTFILE_SYMBOL))
    s = {}
    s['symbol'] = symbol
    s['symbol_cleaned'] = symbol_clean
    s['count'] = cnt
    stats_list.append(s)
print('Saved excel file')
excel_writer.save()
excel_writer.close()


df = pd.DataFrame(stats_list)
df = df.applymap(lambda x: x.encode('unicode_escape').
             decode('utf-8') if isinstance(x, str) else x)
excel_stats_writer = pd.ExcelWriter('output/stats{}.xlsx'.format(condition), engine='xlsxwriter')
df.to_excel(excel_stats_writer,index=False)
excel_stats_writer.save()
excel_stats_writer.close()

