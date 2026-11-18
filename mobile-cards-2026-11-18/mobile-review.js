(() => {
    const product = document.body.dataset.reviewProduct;
    const root = document.querySelector('.sdc');
    if (!product || !root) return;
    root.classList.add('sdc-unified');

    const mobile = matchMedia('(max-width: 820px)');
    const badge = root.querySelector('.sdc-badge');
    const benefits = root.querySelector('.sdc-advantages-text');
    const docs = root.querySelector('.sdc-docs');
    const docsPosition = document.createComment('desktop document position');
    docs?.before(docsPosition);
    const buy = root.querySelector('.sdc-buy');
    const buyPosition = document.createComment('desktop purchase position');
    buy?.before(buyPosition);
    const galleryMain = root.querySelector('.sdc-main');
    const option = root.querySelector('.sdc-config .sdc-isp');
    const optionPosition = document.createComment('desktop configuration position');
    option?.before(optionPosition);

    const delivery = [...root.querySelectorAll('.sdc-service a span')]
        .find((label) => label.textContent.trim() === 'Доставка ТК');
    if (delivery) delivery.textContent = 'Доставка в подарок';

    const shortList = product === 'zumax' ? benefits?.querySelector(':scope > p') :
        product === 'castellini' ? benefits?.querySelector('.complectright > p') : null;
    const items = shortList?.innerHTML.split(/<br\s*\/?\s*>/i).map((line) => {
        const scratch = document.createElement('template');
        scratch.innerHTML = line;
        return scratch.content.textContent.trim().replace(/^(?:\d+\.\s*|[—–]\s*)/, '');
    }).filter(Boolean);

    const listBox = document.createElement('div');
    listBox.className = 'sd-review-features';
    if (items?.length) {
        if (product === 'castellini') {
            const heading = document.createElement('h2');
            heading.className = 'sdc-h';
            heading.textContent = 'Комплектация';
            listBox.append(heading);
        }
        const list = document.createElement(product === 'zumax' ? 'ol' : 'ul');
        for (const text of items) {
            const item = document.createElement('li');
            item.textContent = text;
            list.append(item);
        }
        listBox.append(list);
        shortList.id = 'sd-review-benefits-source';
        shortList.after(listBox);
    }

    function setMobileLayout() {
        const compact = mobile.matches;
        if (badge) badge.textContent = compact ? 'Индивидуальная скидка' : 'Скидка';
        if (buy && galleryMain) {
            if (compact) {
                galleryMain.after(buy);
                const cart = buy.querySelector('.sdc-atc');
                if (cart && option) cart.before(option);
            } else {
                buyPosition.after(buy);
                if (option) optionPosition.after(option);
            }
        }
        if (docs) {
            const advantages = root.querySelector('.sdc-advantages');
            if (compact && advantages) advantages.insertAdjacentElement('afterend', docs);
            else docsPosition.after(docs);
        }
        if (shortList) shortList.hidden = compact;
        listBox.hidden = !compact;
    }
    mobile.addEventListener('change', setMobileLayout);
    setMobileLayout();
})();
