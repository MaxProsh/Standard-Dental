(() => {
    const root = document.querySelector('.sdc');
    const product = document.body.dataset.reviewProduct || document.body.dataset.pilotProduct;
    if (!root || !product) return;
    root.classList.add('sdc-unified');
    const grid = root.querySelector('.sdc-grid');
    function lineIcon(className, path, viewBox) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', className);
        svg.setAttribute('viewBox', viewBox);
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        const lines = document.createElementNS(svg.namespaceURI, 'path');
        lines.setAttribute('d', path);
        svg.append(lines);
        return svg;
    }
    const stock = grid.querySelector('.sdc-stock');
    if (stock) {
        const group = document.createElement('div');
        group.className = 'sd-pilot-stock-group';
        const distributor = document.createElement('span');
        distributor.className = 'sd-distributor';
        distributor.append(lineIcon('sd-distributor-icon',
            'M12 2.5 20 6v5.8c0 4.8-3.6 8-8 10-4.4-2-8-5.2-8-10V6Z M8.5 11.8l2.4 2.4 4.6-5', '0 0 24 24'),
            'Официальные дистрибьюторы');
        stock.before(group);
        group.append(stock, distributor);
    }
    const section = grid.querySelector('.sdc-advantages');
    const content = section?.querySelector('.sdc-advantages-text');
    // The microscope has a detailed table in its description. Keep its values editable there.
    let table = content?.querySelector('table');
    if (!table && content && product === 'zumax') {
        const overview = document.createElement('table');
        const fields = [
            ['Увеличение', 'Система увеличения'],
            ['Окуляры', 'Окуляры'],
            ['Вариообъектив', 'Объектив и рабочее расстояние'],
            ['Наклон бинокуляров', 'Наклон бинокулярного тубуса'],
            ['Настройки', 'Фокусировка и настройки оптики'],
            ['Освещение', 'Освещение'],
            ['Световое пятно и фильтры', 'Световое пятно и фильтры'],
            ['Видеосистема', 'Фото- и видеосистема'],
            ['Подвес', 'Система подвеса'],
            ['Цвет корпуса', 'Цвет корпуса'],
        ];
        const sourceRows = [...root.querySelectorAll('#tab-description table tr')];
        for (const [sourceLabel, tileLabel] of fields) {
            const row = sourceRows.find(r => r.cells[0]?.textContent.trim() === sourceLabel);
            const value = row?.cells[1]?.textContent.trim();
            if (!value) continue;
            const entry = overview.insertRow();
            entry.insertCell().textContent = tileLabel;
            entry.insertCell().textContent = value;
        }
        if (overview.rows.length) {
            content.prepend(overview);
            table = overview;
        }
    }
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
            const aside = document.createElement('div');
            aside.className = 'sd-pilot-aside';
            content.prepend(aside);
            aside.append(panel);
            if (product === 'elf') {
                const docs = grid.querySelector('.sdc-docs');
                if (docs) aside.append(docs);
            }
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
                note.querySelector('img').replaceWith(lineIcon('sd-residential-icon',
                    'M3.5 14 15 4.5 26.5 14 M6.5 13v14h10 M23.5 13v3 M11 27v-8h5v5 M20 24l3 3 6-7', '0 0 32 32'));
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
    const commerce = grid.querySelector('.sdc-commerce');
    function anchor(el) {
        const mark = document.createComment('Original position');
        el?.before(mark);
        return mark;
    }
    const buyAnchor = anchor(buy), optionAnchor = anchor(option);
    const badge = grid.querySelector('.sdc-badge');
    function arrange() {
        if (badge) badge.textContent = mobile.matches ? 'Индивидуальная скидка' : 'Скидка';
        if (mobile.matches) {
            if (buy) grid.querySelector('.sdc-main').after(buy);
            if (option && buy) buy.querySelector('.sdc-atc')?.before(option);
            if (product === 'elf' && section) commerce.before(section);
        } else {
            if (buy) buyAnchor.after(buy);
            if (option) optionAnchor.after(option);
            if (product === 'elf' && section) grid.append(section);
        }
    }
    mobile.addEventListener('change', arrange);
    arrange();
})();
