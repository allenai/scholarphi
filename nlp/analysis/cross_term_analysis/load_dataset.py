import os


def read_arxiv_ids_from_acl_2020(filename):
    """
        The papers are originally extracted from here:
        https://github.com/roomylee/ACL-2020-Papers/blob/master/papers_with_arxiv_link.md
    """
    out_filename = 'arxiv_ids_acl_2020.txt'
    arxiv_ids = []
    if not os.path.isfile(out_filename):
        with open(filename) as f:
            for line in f:
                if 'arxiv.org' in line:
                    arxiv_id = re.findall(PATTERN_ARXIV, line)[0].split('/')[-1]
                    arxiv_ids.append(arxiv_id)

        # save to file
        with open(out_filename ,'w') as fout:
            for arxiv_id in arxiv_ids:
                fout.write('{}\n'.format(arxiv_id))
        print('file written')
    else:
        with open(out_filename) as f:
            for line in f:
                arxiv_ids.append(line.strip())
    return arxiv_ids

