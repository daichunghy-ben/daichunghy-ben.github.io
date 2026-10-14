"""Export source-bound research figures from the same data as the website."""
from pathlib import Path
import json
import textwrap
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.patches import Ellipse, FancyArrowPatch
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'portfolio/assets/figures'
OUT.mkdir(parents=True, exist_ok=True)
for filename in ('Calibri.ttf', 'Calibrib.ttf'):
    candidate = Path('/Users/macos/Library/Fonts') / filename
    if candidate.exists():
        font_manager.fontManager.addfont(candidate)
plt.rcParams.update({'font.family': 'Calibri', 'font.size': 12, 'svg.fonttype': 'none',
                     'axes.spines.top': False, 'axes.spines.right': False,
                     'axes.spines.left': False, 'axes.spines.bottom': False,
                     'text.color': '#24272c', 'axes.labelcolor': '#60646b',
                     'xtick.color': '#60646b', 'ytick.color': '#24272c'})
data = json.loads((ROOT / 'portfolio/assets/data/research-evidence.json').read_text())['entries']
cases = {c['id']: c for c in json.loads((ROOT / 'portfolio/assets/data/case-studies.json').read_text())['cases']}
PAPER, INK, MUTED, NEG = '#faf9f6', '#24272c', '#60646b', '#a65745'

def base(e):
    fig = plt.figure(figsize=(15, 9), facecolor=PAPER)
    fig.text(.055, .955, e['title'], fontsize=24, fontweight='bold', va='top')
    fig.text(.055, .9, textwrap.fill(e['caption'], 140), fontsize=12, color=MUTED, va='top')
    fig.text(.055, .055, textwrap.fill(e['source'], 145), fontsize=10, color=MUTED, va='bottom')
    return fig

def style(ax):
    ax.set_facecolor(PAPER)
    ax.grid(axis='x', color='#e5e5dd', linewidth=.7)
    ax.set_axisbelow(True)
    ax.tick_params(length=0, pad=9)

def image_at(path):
    return Image.open((ROOT / 'portfolio' / path).resolve()).convert('RGB')

def construct(fig, e, accent):
    ax = fig.add_axes([.04, .17, .92, .65]); ax.axis('off'); ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    positions = [.78, .5, .22] if len(e['inputs']) == 3 else [.7, .3]
    def node(x, y, label, detail, active=False):
        ax.add_patch(Ellipse((x, y), .25, .2, facecolor=accent if active else '#e9e7df', edgecolor='none'))
        ax.text(x, y+.035, '\n'.join(textwrap.wrap(label, 21)), ha='center', va='center', fontsize=14,
                fontweight='bold', color='white' if active else INK)
        ax.text(x, y-.055, detail, ha='center', va='center', fontsize=10, color='#f3f1e8' if active else MUTED)
    for i, (n, y) in enumerate(zip(e['inputs'], positions)):
        node(.17, y, n['label'], n.get('short', ''), i == 0)
        ax.add_patch(FancyArrowPatch((.3, y), (.435, .5), connectionstyle='arc3,rad=0', arrowstyle='->',
                                    mutation_scale=17, color=accent if i == 0 else '#a3aaa0', linewidth=1.8))
        if 'coefficient' in n:
            ax.text(.32, (y+.5)/2+.04, str(n['coefficient']), fontsize=14, color=accent)
    node(.565, .5, e['middle']['label'], e['middle']['metric'])
    node(.86, .5, e['end']['label'], e['end']['metric'] if 'coefficient' not in e['end'] else 'Outcome')
    ax.add_patch(FancyArrowPatch((.695, .5), (.73, .5), arrowstyle='->', mutation_scale=17, color=accent, linewidth=1.8))
    if 'coefficient' in e['end']:
        ax.text(.71, .57, str(e['end']['coefficient']), ha='center', color=accent, fontsize=14)
    if e.get('sample'):
        ax.text(.5, .025, 'EFA n = 200  ·  CFA / SEM n = 365', ha='center', color=MUTED, fontsize=12)
    else:
        ax.text(.5, .025, 'Conceptual relationships' if e['id'] == 'psych-ownership' else 'Reported paths; standardized status is unspecified', ha='center', color=MUTED, fontsize=11)

for e in data:
    fig = base(e); accent = cases[e['id']]['accent']; kind = e['type']
    if kind == 'forest':
        ax = fig.add_axes([.25, .2, .65, .61]); style(ax)
        for j, g in enumerate(e['groups']):
            ys = [i+(j-.5)*.23 for i in range(len(e['labels']))]
            lower = [v-ci[0] for v, ci in zip(g['values'], g['intervals'])]
            upper = [ci[1]-v for v, ci in zip(g['values'], g['intervals'])]
            ax.errorbar(g['values'], ys, xerr=[lower, upper], fmt='o', color=g['color'], capsize=4,
                        linewidth=2, label=f"{g['label']} · {g['share']}%")
            for x, y in zip(g['values'], ys): ax.text(273, y, f'{x:g}', va='center', fontsize=11, color=g['color'])
        ax.set_yticks(range(4), e['labels']); ax.invert_yaxis(); ax.set_xlim(*e['range']); ax.set_xticks(e['ticks'])
        ax.axvline(0, color=MUTED, linewidth=1, linestyle=':'); ax.set_xlabel('Marginal WTP · VND million'); ax.legend(frameon=False, loc='lower center', bbox_to_anchor=(.5, 1.02), ncol=2)
        fig.text(.25, .12, 'Read interval width and the zero reference before comparing point estimates.', fontsize=11, color=MUTED)
    elif kind == 'butterfly':
        ax = fig.add_axes([.24, .18, .63, .64]); style(ax)
        for i, (p, r) in enumerate(zip(e['penalty'], e['reward'])):
            ax.plot([p, r], [i, i], color='#d3d7cd', linewidth=7, solid_capstyle='round')
            ax.scatter([p], [i], c=NEG, s=75, zorder=3); ax.scatter([r], [i], c=accent, s=75, zorder=3)
            ax.text(.86, i, f'{p:+.3f} / {r:+.3f}', va='center', fontsize=11)
        ax.set_yticks(range(8), [l+'  ·  '+k for l, k in zip(e['labels'], e['classes'])]); ax.invert_yaxis()
        ax.set_xlim(*e['range']); ax.set_xticks(e['ticks']); ax.axvline(0, color=MUTED, linewidth=1, linestyle=':')
        ax.set_xlabel('Regression coefficient'); ax.scatter([], [], c=NEG, label='Penalty'); ax.scatter([], [], c=accent, label='Reward'); ax.legend(frameon=False, loc='lower left')
    elif kind == 'segments':
        ax = fig.add_axes([.18, .18, .35, .65]); style(ax)
        ax.barh(range(10), e['values'], color=[accent]+['#b9c8c8']*9, height=.6)
        ax.set_yticks(range(10), e['labels']); ax.invert_yaxis(); ax.set_xlim(0, 50); ax.set_xlabel('Share of the review sample · %')
        for i, v in enumerate(e['values']): ax.text(v+.8, i, f'{v:g}%', va='center', fontsize=11)
        heat = fig.add_axes([.57, .25, .38, .51]); heat.imshow(image_at(e['images'][0]['image'])); heat.axis('off')
        fig.text(.57, .78, 'Original attribute-sentiment map', fontsize=15, fontweight='bold')
        fig.text(.57, .19, 'Numeric cluster IDs are preserved.\nNo name-to-ID crosswalk is inferred.', fontsize=11, color=MUTED)
    elif kind == 'factorial':
        for i, item in enumerate(e['items']):
            x, y = .09+(i%2)*.45, .46-(i//2)*.32
            ax = fig.add_axes([x, y, .37, .3]); ax.imshow(image_at(item['image'])); ax.axis('off')
            ax.set_title(item['label'], fontsize=12, fontweight='bold', pad=8)
        fig.text(.5, .11, 'Speciesism is a measured moderator, separate from the 2 × 2 assignment.', ha='center', fontsize=11, color=MUTED)
    elif kind == 'nutrition':
        ax = fig.add_axes([.2, .25, .34, .52]); style(ax)
        vals = [d['correct'] for d in e['domains']]
        ax.barh(range(3), vals, color=accent, height=.55); ax.barh(range(3), [100-v for v in vals], left=vals, color='#e7e5dc', height=.55)
        ax.set_yticks(range(3), [d['label'] for d in e['domains']]); ax.invert_yaxis(); ax.set_xlim(0, 100); ax.set_xlabel('Correct answers · %')
        for i, v in enumerate(vals): ax.text(v+1.4, i, f'{v:g}%', va='center', fontsize=11)
        ax = fig.add_axes([.6, .23, .35, .54]); ax.axis('off')
        ax.text(0, 1, 'Adjusted diet-quality model', fontsize=18, fontweight='bold')
        ax.text(0, .88, 'R² = 0.538  ·  n = 280', fontsize=13, color=accent)
        for i, r in enumerate(e['regression']):
            y = .71-i*.18; ax.text(0, y, r['label'], fontweight='bold'); ax.text(.53, y, f"{r['estimate']:g}", fontsize=13)
            ax.text(0, y-.065, r['unit'], fontsize=10, color=MUTED); ax.text(.53, y-.065, f"CI {r['ci'][0]} to {r['ci'][1]}", fontsize=10, color=MUTED)
        fig.text(.6, .13, 'Different coefficient units; do not rank their raw sizes.\nThe activity interval is rounded in the printed paper.', fontsize=10, color=MUTED)
    elif kind == 'policy':
        ax = fig.add_axes([.32, .15, .57, .68]); style(ax)
        for i, v in enumerate(e['values']):
            ax.plot([0, v/1000], [i, i], color=NEG if v < 0 else accent, linewidth=3)
            ax.scatter([v/1000], [i], color=NEG if v < 0 else accent, s=35, zorder=3)
            ax.text(210, i, f'{v/1000:,.2f}', va='center', fontsize=10)
        ax.set_yticks(range(14), e['labels']); ax.invert_yaxis(); ax.set_xlim(-150, 200); ax.set_xticks([-100, 0, 100, 200]); ax.axvline(0, color=MUTED, linestyle=':', linewidth=1); ax.set_xlabel('VND thousand / month')
    elif kind == 'paired':
        ax = fig.add_axes([.12, .3, .41, .47]); style(ax)
        for i, s in enumerate(e['studies']):
            ax.plot([s['after'], s['before']], [i, i], color='#c7ccbe', linewidth=9)
            ax.scatter([s['before']], [i], c='#919986', s=75, zorder=3); ax.scatter([s['after']], [i], c=accent, s=75, zorder=3)
            ax.text(s['after'], i+.17, str(s['after']), ha='center', color=accent, fontsize=12)
            ax.text(s['before'], i-.18, str(s['before']), ha='center', fontsize=12)
        ax.set_yticks(range(2), [s['label']+' · n = '+str(s['n']) for s in e['studies']]); ax.invert_yaxis(); ax.set_xlim(0, 1800); ax.set_ylim(1.5, -.5); ax.set_xlabel('Mean intended intake · kcal')
        ax.set_title('Intended intake', fontsize=18, fontweight='bold', pad=18)
        ax = fig.add_axes([.65, .3, .25, .47]); style(ax); ax.bar([0, 1], [e['premium']['before'], e['premium']['after']], color=['#919986', accent], width=.5)
        ax.set_ylim(0, 60); ax.set_xticks([0, 1], ['Comparison', 'Healthier first']); ax.set_ylabel('Premium choice share · %'); ax.set_title('Study 2 tier choice', fontsize=18, fontweight='bold', pad=18)
        for i, v in enumerate([e['premium']['before'], e['premium']['after']]): ax.text(i, v+2, f'{v:g}%', ha='center', fontsize=12)
        fig.text(.12, .13, 'Comparison → healthier first: −146 kcal and −223 kcal.\nPremium share: −28.6 percentage points; separate ordinal model OR = 0.52.', fontsize=11, color=MUTED)
    elif kind == 'constructs':
        construct(fig, e, accent)
    elif kind == 'profiles':
        for i, p in enumerate(e['profiles']):
            x = .055+i*.315; ax = fig.add_axes([x, .44, .285, .36]); ax.imshow(image_at(p['image'])); ax.axis('off')
            fig.text(x, .39, p['label'], fontsize=17, fontweight='bold')
            fig.text(x, .34, textwrap.fill(p['theme'], 34), fontsize=12, color=MUTED, va='top')
            fig.text(x, .255, textwrap.fill(p['response'], 37), fontsize=12, va='top')
            fig.text(x, .16, 'Conceptual service profile', fontsize=10, color=MUTED)
    else:
        raise ValueError(kind)
    fig.savefig(OUT / (e['id']+'.svg'), facecolor=PAPER)
    fig.savefig(OUT / (e['id']+'.png'), dpi=180, facecolor=PAPER)
    plt.close(fig)
print(f'Exported {len(data)} research figures as SVG and PNG.')
