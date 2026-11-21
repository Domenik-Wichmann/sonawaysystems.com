"""Build the public question index from real pages and owner-approved additions."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SECTIONS = {
    "knowledge-capture": {"capture-your-day": "Recording work", "delivery": "Delivery and existing platforms", "pricing": "Illustrative knowledge capture budgets"},
    "approach": {"ownership-deliverables": "Ownership and handoff", "ownership-options": "Maintenance options", "ownership-delivery": "Discovery and implementation", "care-responsibilities": "Ongoing responsibilities"},
    "about": {"about-approach": "Working with Sonaway", "about-principles": "How we handle operational knowledge"},
    "contact": {"contact-context": "Preparing for discovery"},
}
VOID = set("area base br col embed hr img input link meta param source track wbr".split())


class Extract(HTMLParser):
    def __init__(self):
        super().__init__()
        self.root = [None, {}, []]
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = [tag, dict(attrs), []]
        self.stack[-1][2].append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for n in range(len(self.stack)-1, 0, -1):
            if self.stack[n][0] == tag:
                del self.stack[n:]
                break

    def handle_data(self, data):
        self.stack[-1][2].append(data)


def nodes(node):
    yield node
    for child in node[2]:
        if isinstance(child, list):
            yield from nodes(child)


def words(node, skip=()):
    if node[0] in (*skip, 'svg', 'script', 'style', 'form', 'button', 'nav'):
        return ''
    return ' '.join(' '.join(child if isinstance(child, str) else words(child, skip)
                             for child in node[2]).split())


def page(name):
    parser = Extract()
    parser.feed((ROOT / (name + '.html')).read_text())
    return list(nodes(parser.root))


def build():
    records = []
    for node in page('index'):
        if node[0] == 'details' and node[1].get('name') == 'owner-faq':
            question = words(next(n for n in nodes(node) if n[0] == 'summary'))
            answer = words(next(n for n in nodes(node) if n[0] == 'p'), ('a',))
            records.append(dict(id=node[1]['data-faq-id'], question=question, answer=answer,
                                url='/#common-questions'))
    if not records:
        raise ValueError("No homepage FAQs found")
    records += json.loads((ROOT / 'ask/approved.json').read_text())
    for name, sections in SECTIONS.items():
        by_id = {n[1].get('id'): n for n in page(name)}
        for section, title in sections.items():
            node = by_id[section]
            # Group by paragraph or heading so pricing qualifications stay with their figures.
            text = words(node)
            records.append(dict(id=name+'-'+section, title=title, answer=text,
                                url='/'+name+'.html#'+section))
    ids = set()
    for r in records:
        if r['id'] in ids or not r['answer'].strip() or not re.fullmatch(r'/[\w./-]*(#[\w-]+)?', r['url']) or r['url'].startswith('//'):
            raise ValueError(r['id'])
        ids.add(r['id'])
    return json.dumps(records, ensure_ascii=False, indent=2)+'\n'


if __name__ == '__main__':
    (ROOT/'ask/index-data.json').write_text(build())
