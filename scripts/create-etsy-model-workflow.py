from pathlib import Path
import json

root = Path(__file__).resolve().parent.parent
workflow = json.loads((root / 'docs/workflows/ETSY-FOLDER-INPUT.json').read_text(encoding='utf-8'))
workflow['name'] = 'ETSY - Folder quần áo + Người mẫu riêng'
workflow['description'] = 'Mỗi sản phẩm trong folder được mặc lên người mẫu trưởng thành từ ảnh MODEL riêng. Pose catalog trung tính, studio kem/beige và ánh sáng mềm; có quy tắc riêng cho đồ ngủ. Không dùng cho bảng size.'
nodes = {node['id']: node for node in workflow['nodes']}
nodes['image']['data']['contentFallback'] = 'mannequin'
nodes['product']['data']['groupMode'] = 'product-images'
nodes['product']['label'] = '01 - Folder quần áo: thiết kế sản phẩm'
nodes['brief']['position'] = {'x': 0, 'y': 1080}
nodes['brief']['data']['prompt'] = '''Create ONE photorealistic Etsy fashion listing photograph of an adult female model WEARING the actual clothing from the GARMENT references. This is an explicit request to replace the original product presentation (flat lay, hanger, mannequin or original wearer) with the supplied adult MODEL reference, and to give her a natural fashion pose.

REFERENCE PRIORITIES
GARMENT references are the sole source of the item being sold: its exact color, neckline, straps or sleeves, silhouette, length, construction, fabric appearance, seams, ruffles, lace, ties and all visible details. Do not copy clothing from the MODEL reference. MODEL references define the same person's facial features, hair and appearance across products; do not replace her with a generic blonde model. Identify her from the actual supplied image, not from chat history. If the adult model identity cannot be determined, report needs_review.

MODEL AND POSE
Show that adult model naturally wearing the product with realistic fit, anatomy, skin and fabric drape. Use a relaxed front or gentle three-quarter fashion pose: shoulders relaxed, slight weight shift, arms naturally at the sides or one hand lightly resting at the waist without hiding garment details. Keep the hem, neckline and defining features clearly visible. Select a view supported by the actual garment images. Never invent an unseen back construction. Do not copy mannequin posture or force a flat-lay composition. If a separately labelled POSE reference is supplied, follow its pose, orientation and framing instead, without copying its person's identity or clothing.

VISUAL STYLE
Plain ivory, cream or beige professional studio backdrop with soft even neutral lighting, realistic shadows, natural skin and accurate garment color. Product-focused fashion catalog photography. No bed, boudoir setting or intimate situation. The style example is aesthetic guidance only: NEVER copy its satin slip dress, white/lilac colors, model identity or six-panel collage onto unrelated products.

COMPOSITION
One continuous photograph, one model, one product; no grid, collage, contact sheet or multiple panels. Prefer front/three-quarter framing with the full garment and hem visible, including enough face to identify the supplied model when framing permits. Adapt camera distance to the actual garment length without changing that length. Keep garment texture and construction sharp; background remains secondary.

RESTRICTIONS
Preserve the product over aesthetics. No redesign, added layers, decorative details, extra accessories, logo, watermark or text. Do not add shorts, pants, leggings, bodysuit, underwear or any extra garment unless explicitly shown in the product reference. If the clothing cannot be shown as a coherent outfit without inventing another garment, crop to the supplied item and visible model area; if still ambiguous, report needs_review instead of inventing an outfit. If the product input is a size chart or unrelated image, report needs_review and request the appropriate workflow rather than dressing the model in a chart.

For sleepwear or lingerie, section 26 of the master takes precedence over pose and framing suggestions above. Use a clearly adult model, an upright neutral catalog stance, arms relaxed at her sides, calm expression and eye-level balanced framing. Do not reproduce a suggestive pose reference. Keep the actual garment design; do not add lining, increase opacity, or invent extra clothing to conceal a problem. Do not increase transparency or exposure. If a non-explicit on-model presentation is not possible while preserving the actual product, report needs_review for the user to choose a product-only alternative. Never disguise content or instruct a service to bypass moderation.

Return the ETSY FLOW v1 object for one prompt. Each product is independent. The Generate Image Count controls variants of this same prompt, not distinct front/back/detail prompts.'''
nodes['ai']['label'] = '04 - Prompt: sản phẩm + model + pose'
nodes['ai']['data']['prompt'] = 'Áp dụng master và yêu cầu chung cho ảnh quần áo hiện tại. Yêu cầu đã cho phép thay cách trình bày thành người mẫu mặc sản phẩm và pose tự nhiên. Phải có GARMENT và MODEL riêng; không lấy quần áo từ ảnh MODEL. Nếu thiếu ảnh mẫu hoặc dữ liệu quan trọng, báo needs_review. Xuất đúng Etsy Flow v1.'
model_node = {'id': 'model-reference', 'type': 'upload-image', 'label': '02 - Ảnh người mẫu riêng (dùng chung)', 'position': {'x': 0, 'y': 660}, 'data': {'referenceRole': 'model', 'localPaths': [], 'localPath': ''}, 'version': 1}
workflow['nodes'].insert(1, model_node)
for target in ['ai', 'image']:
    workflow['edges'].append({'id': f'model-to-{target}', 'source': 'model-reference', 'target': target, 'sourceHandle': 'image-out', 'targetHandle': 'image-in'})
dest = root / 'docs/workflows/ETSY-FOLDER-MODEL.json'
dest.write_text(json.dumps(workflow, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(dest)
