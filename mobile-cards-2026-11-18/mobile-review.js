(() => {
    const root = document.querySelector('.sdc');
    const product = document.body.dataset.reviewProduct || document.body.dataset.pilotProduct;
    if (!root || !product) return;
    root.classList.add('sdc-unified');
    const grid = root.querySelector('.sdc-grid');
    const section = grid.querySelector('.sdc-advantages');
    const content = section?.querySelector('.sdc-advantages-text');
    const table = content?.querySelector('table');
    const source = content?.querySelector('.complectright p, .complectright') || content?.querySelector(':scope > p');
    const originalList = source?.querySelector('p') || source;
    if (content && originalList) {
        const rows = originalList.innerHTML.split(/<br\s*\/?\s*>/i).map(line => {
            const tmp = document.createElement('template');
            tmp.innerHTML = line;
            return tmp.content.textContent.trim().replace(/^(?:\d+\.\s*|[—–]\s*)/, '');
        }).filter(Boolean);
        if (rows.length) {
            const panel = document.createElement('section');
            panel.className = 'sd-review-features';
            const title = document.createElement('h2');
            title.className = 'sdc-h';
            title.textContent = 'Преимущества';
            const list = document.createElement('ol');
            rows.forEach(text => {
                const li = document.createElement('li');
                li.textContent = text;
                list.append(li);
            });
            panel.append(title, list);
            content.prepend(panel);
            source.remove();
            section.querySelector(':scope > .sdc-h')?.remove();
            title.id = 'sdcAdvTitle';
            if (table) {
                const specs = document.createElement('section');
                specs.className = 'sd-pilot-specs';
                const heading = document.createElement('h2');
                heading.className = 'sdc-h';
                heading.id = 'sdSpecsTitle';
                heading.textContent = 'Технические характеристики';
                table.before(specs);
                specs.append(heading, table);
                table.setAttribute('aria-labelledby', heading.id);
                for (const row of table.rows) {
                    const cell = row.cells[0];
                    if (!cell || cell.tagName === 'TH') continue;
                    const label = document.createElement('th');
                    label.scope = 'row';
                    label.append(...cell.childNodes);
                    cell.replaceWith(label);
                }
            }
            const note = content.querySelector('img.checkmy')?.closest('p');
            if (note) {
                note.classList.add('sd-residential');
                note.querySelector('img').alt = '';
                panel.insertBefore(note, list);
            }
            grid.append(section);
        }
    }
    const delivery = [...grid.querySelectorAll('.sdc-service a span')].find(el => el.textContent.trim() === 'Доставка ТК');
    if (delivery) delivery.textContent = 'Доставка в подарок';
    const mobile = matchMedia('(max-width: 820px)');
    const buy = grid.querySelector('.sdc-buy');
    const option = grid.querySelector('.sdc-config .sdc-isp');
    const docs = grid.querySelector('.sdc-docs');
    function anchor(el) {
        const mark = document.createComment('Original position');
        el?.before(mark);
        return mark;
    }
    const buyAnchor = anchor(buy), optionAnchor = anchor(option), docsAnchor = anchor(docs);
    const badge = grid.querySelector('.sdc-badge');
    function arrange() {
        if (badge) badge.textContent = mobile.matches ? 'Индивидуальная скидка' : 'Скидка';
        if (mobile.matches) {
            if (buy) grid.querySelector('.sdc-main').after(buy);
            if (option && buy) buy.querySelector('.sdc-atc')?.before(option);
            if (docs && section) section.after(docs);
        } else {
            if (buy) buyAnchor.after(buy);
            if (option) optionAnchor.after(option);
            if (docs) docsAnchor.after(docs);
        }
    }
    mobile.addEventListener('change', arrange);
    arrange();
})();
