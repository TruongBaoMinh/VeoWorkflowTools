from pathlib import Path
import json

root = Path(__file__).resolve().parent.parent
path = root / 'docs/workflows/ETSY-MASTER-PROMPT.md'
master = path.read_text(encoding='utf-8')
heading = '## 27. SEPARATE MODEL AND GARMENT REFERENCES'
addition = '''

## 27. SEPARATE MODEL AND GARMENT REFERENCES

These rules clarify all previous instructions about model identity and reference sufficiency.
- MODEL supplies visible adult appearance only. GARMENT supplies the target product. Ignore clothing in MODEL references.
- Different outfits or people between MODEL and GARMENT references are expected. A photo of the model already wearing the target garment is NOT required; creating that combination is the image generation task.
- Do not identify a person or verify that people across references are the same individual. Request visual consistency with the supplied MODEL reference without guaranteeing an exact match.
- A face or upper-body MODEL reference is valid. Do not infer exact unseen body measurements or claim exact body matching. For requested full-body compositions, instruct natural adult proportions, not purportedly observed measurements.
- Do not return needs_review solely for a cropped MODEL reference, different outfit/person, missing full-body proportions, or absence of a photo showing the model already wearing the product.
- Still require review for truly missing requested references, ambiguous adult status where relevant, conflicting GARMENT evidence, unseen required garment construction, or unreadable size data. Never suppress an actual safety refusal.
'''
if heading not in master:
    master = master.rstrip() + addition
    path.write_text(master, encoding='utf-8')
for name in ['ETSY-FOLDER-INPUT.json', 'ETSY-FOLDER-MODEL.json', 'ETSY-FOLDER-CHATGPT.json']:
    target = root / 'docs/workflows' / name
    workflow = json.loads(target.read_text(encoding='utf-8-sig'))
    for node in workflow['nodes']:
        if node['type'] in ('ai-prompt', 'chatgpt'):
            current = node['data'].get('systemMessage', '')
            if heading not in current:
                node['data']['systemMessage'] = current.rstrip() + addition
    target.write_text(json.dumps(workflow, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Updated master and three Etsy workflow templates.')
