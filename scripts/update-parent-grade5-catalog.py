"""Copy grade 5 problem labels and point groups from the learning page syllabus."""
from pathlib import Path
import json
root = Path(__file__).resolve().parent.parent
path = root / 'parent-catalog.js'
data = json.JSONDecoder().raw_decode(path.read_text().split('=', 1)[1])[0]
for grade, level in [('5u', 'upper'), ('5l', 'lower')]:
    source = (root / f'study/grade5-{level}.js').read_text()
    topics = json.JSONDecoder().raw_decode(source.split('const syllabus=', 1)[1])[0]
    data['problems'] = {k:v for k,v in data['problems'].items() if not k.startswith(grade+'-')}
    for topic in topics:
        unit = f'{grade}-{topic["n"]}'
        groups = [{'name':name, 'problems':[]} for name in topic['groups']]
        for kind, assignments in topic['sections'].items():
            for i, group in enumerate(assignments):
                if not 1 <= group <= len(groups):
                    continue
                number = i + 1
                labels = topic.get('example_labels', [])
                label = (labels[i] if i < len(labels) else f'例題{number}・類題{number}') if kind == '例題・類題' else f'{kind}{number}'
                data['problems'][f'{unit}:{unit}:{kind}:{number}'] = label
                groups[group-1]['problems'].append(label)
        data['groups'][unit] = groups
path.write_text('window.PARENT_CATALOG='+json.dumps(data, ensure_ascii=False)+';\n')
