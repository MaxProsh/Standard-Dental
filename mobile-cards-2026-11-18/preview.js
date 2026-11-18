(() => {
    const root = document.querySelector('.sdc');
    const mark = (element, message) => {
        let status = element.querySelector('.preview-status');
        if (!status) {
            status = document.createElement('p');
            status.className = 'preview-status';
            status.setAttribute('role', 'status');
            element.append(status);
        }
        status.textContent = message;
    };

    document.addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.target;
        if (form.matches('#search-modal .form-search')) {
            const term = form.elements.s.value.trim();
            if (term) {
                const url = new URL('https://standartdental.ru/');
                url.searchParams.set('s', term);
                url.searchParams.set('post_type', 'product');
                const category = form.elements.product_cat?.value;
                if (category && category !== '0') url.searchParams.set('product_cat', category);
                window.location.assign(url);
            }
            return;
        }
        const message = form.matches('.cart') ? 'Тестовое добавление в корзину.' : 'Демонстрационный режим. Данные формы остались в браузере.';
        mark(form, message);
    }, true);

    const tabs = [...root.querySelectorAll('.wc-tabs li')];
    tabs.forEach((item) => {
        const link = item.querySelector('a');
        link.addEventListener('click', (event) => {
            event.preventDefault();
            for (const tab of tabs) {
                const active = tab === item;
                const a = tab.querySelector('a');
                const panel = document.getElementById(a.hash.slice(1));
                tab.classList.toggle('active', active);
                tab.setAttribute('aria-selected', String(active));
                a.setAttribute('aria-selected', String(active));
                if (panel) panel.style.display = active ? 'block' : 'none';
            }
        });
    });
    tabs[0]?.querySelector('a').click();

    const faqQuestions = [...root.querySelectorAll('.my-product-faq-question')];
    faqQuestions.forEach((button) => {
        button.addEventListener('click', () => {
            const open = button.getAttribute('aria-expanded') !== 'true';
            for (const question of faqQuestions) {
                const expanded = question === button && open;
                question.setAttribute('aria-expanded', String(expanded));
                question.closest('.my-product-faq-item')?.classList.toggle('is-open', expanded);
            }
        });
    });

    const related = root.querySelector('.related.products');
    const slider = related?.querySelector('.linked-products-carousel');
    if (slider && window.Swiper) {
        const [prev, next] = related.querySelectorAll('.sd-related-arrow');
        const swipe = new Swiper(slider, {
            slidesPerView: 2,
            slidesPerGroup: 1,
            spaceBetween: 15,
            scrollbar: { el: slider.querySelector('.swiper-scrollbar'), draggable: true, hide: false },
            breakpoints: { 480: { slidesPerView: 3 }, 768: { slidesPerView: 3, spaceBetween: 30 }, 1200: { slidesPerView: 4 } }
        });
        function update() {
            prev.disabled = swipe.isBeginning;
            next.disabled = swipe.isEnd;
        }
        prev.onclick = () => swipe.slidePrev(0);
        next.onclick = () => swipe.slideNext(0);
        swipe.on('slideChange resize reachEnd reachBeginning fromEdge', update);
        update();
    }

    const body = document.body;
    const bar = document.getElementById('site-header');
    const spacer = document.getElementById('site-header-minimized');
    const compactBar = document.getElementById('merchant-header-minimized');
    const supportedPanels = ['mobile-menu-modal', 'search-modal'];
    supportedPanels.forEach((id) => {
        const panel = document.getElementById(id);
        if (!panel) return;
        panel.classList.add('sd-preview-panel');
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.inert = true;
        const label = id === 'search-modal' ? 'Поиск' : 'Меню';
        panel.setAttribute('aria-label', label);
        document.querySelectorAll(`[data-target="${id}"]`).forEach((link) => {
            link.setAttribute('aria-label', label);
            link.setAttribute('aria-controls', id);
            link.setAttribute('aria-expanded', 'false');
        });
        panel.querySelector('.button-close')?.setAttribute('aria-label', 'Закрыть ' + label.toLowerCase());
    });

    const headerMenu = document.getElementById('mobile-menu-modal');
    const chevron = '<span class="toggle-menu-children"><span class="merchant-svg-icon"><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span></span>';
    const menuLinks = [...(headerMenu?.querySelectorAll('.menu-item-has-children > a') || [])];
    function setSubmenu(link, open) {
        const item = link.parentElement;
        const list = item.querySelector(':scope > :is(.sub-menu, .dropdown-submenu)');
        if (!list) return;
        item.classList.toggle('active', open);
        link.setAttribute('aria-expanded', String(open));
        list.style.display = open ? 'block' : 'none';
    }
    menuLinks.forEach((link) => {
        if (!link.querySelector('.toggle-menu-children')) link.insertAdjacentHTML('afterbegin', chevron);
        setSubmenu(link, false);
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const open = link.getAttribute('aria-expanded') !== 'true';
            const level = link.parentElement.parentElement;
            menuLinks.filter((other) => other !== link && other.parentElement.parentElement === level)
                .forEach((other) => setSubmenu(other, false));
            setSubmenu(link, open);
        });
    });

    const searchPanel = document.getElementById('search-modal');
    const searchForm = searchPanel?.querySelector('.form-search');
    const searchField = searchForm?.querySelector('.search-field');
    const searchResults = searchPanel?.querySelector('.search-results');
    const searchCategory = searchForm?.querySelector('.product-cat-dd');
    const previewProducts = [
        {
            name: 'Aoralscan Elf — проводной интраоральный сканер | Shining 3D (Китай)',
            slug: 'aoralscan-elf-provodnoj-intraoralnyj-skaner-shining-3d-kitaj',
            image: 'f46b22aeac7741.webp',
            categories: ['3d-ckanery-dlya-stomatologii']
        },
        {
            name: 'Хирургический операционный микроскоп ZUMAX OMS 2050 BLACK + стул с подлокотниками',
            slug: 'hirurgicheskij-operaczionnyj-mikroskop-zumax-oms-2050-black-stul-s-podlokotnikami',
            image: '62fce6acdf48d4.webp',
            categories: ['mikroskopy']
        },
        {
            name: 'Castellini X-Radius Trio Plus, FOV 16 × 18 см, томограф с цефалостатом',
            slug: 'castellini-x-radius-trio-plus-fov-16x18-sm-tomograf-s-tsefalostatom',
            image: '4107ae4a9cdc03.jpeg',
            categories: ['rentgenodiagnostika', 'tomografy', 'tomografy-castellini']
        }
    ];

    function updateSearchResults() {
        const term = searchField.value.trim().toLocaleLowerCase('ru');
        const category = searchCategory?.value;
        const terms = term.split(/\s+/);
        const concise = term.length < 2;
        searchForm.classList.toggle('searched', !concise);
        searchForm.classList.toggle('actived', !concise);
        searchResults.replaceChildren();
        if (concise) return;

        const matches = previewProducts.filter((item) =>
            (!category || ['0', 'stomatologicheskoe-oborudovanie'].includes(category) || item.categories.includes(category)) &&
            terms.every((word) => `${item.name} ${item.slug}`.toLocaleLowerCase('ru').includes(word))
        );
        const list = document.createElement('div');
        list.className = `search-list merchant-scrollbar ${matches.length ? 'result-list-found' : 'result-list-not-found'}`;
        for (const product of matches) {
            const url = `https://standartdental.ru/product/${product.slug}/`;
            const item = document.createElement('div');
            item.className = 'list-item';
            const imageLink = document.createElement('a');
            imageLink.className = 'image-item';
            imageLink.href = url;
            const image = document.createElement('img');
            image.src = `assets/${product.image}`;
            image.alt = product.name;
            imageLink.append(image);
            const title = document.createElement('a');
            title.className = 'title-item';
            title.href = url;
            title.textContent = product.name;
            item.append(imageLink, title);
            list.append(item);
        }
        const more = document.createElement('div');
        more.className = 'list-item view-more';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'button-normal';
        button.textContent = 'Все результаты';
        button.addEventListener('click', () => searchForm.requestSubmit());
        more.append(button);
        list.append(more);
        searchResults.append(list);
    }

    if (searchField && searchResults) {
        searchResults.setAttribute('aria-live', 'polite');
        searchField.addEventListener('input', updateSearchResults);
        searchPanel.querySelector('.close-search-results')?.addEventListener('click', (event) => {
            event.preventDefault();
            searchField.value = '';
            updateSearchResults();
            searchField.focus();
        });
    }
    searchCategory?.addEventListener('change', () => {
        const label = searchCategory.closest('.product-cat')?.querySelector('.product-cat-label .label');
        if (label) label.textContent = searchCategory.selectedOptions[0].textContent.trim();
        if (searchField && searchResults) updateSearchResults();
    });

    let activePanel = null;
    let opener = null;
    function closePanel(restoreFocus = true) {
        if (!activePanel) return;
        activePanel.classList.remove('open');
        activePanel.inert = true;
        body.classList.remove('modal-opened', `${activePanel.id}-opened`);
        opener?.setAttribute('aria-expanded', 'false');
        if (restoreFocus) opener?.focus({ preventScroll: true });
        activePanel = opener = null;
    }
    function openPanel(panel, trigger) {
        if (activePanel === panel) return closePanel();
        closePanel(false);
        activePanel = panel;
        opener = trigger;
        panel.inert = false;
        panel.classList.add('open');
        body.classList.add('modal-opened', `${panel.id}-opened`);
        trigger.setAttribute('aria-expanded', 'true');
        const focusTarget = panel.querySelector('.search-field') || panel;
        focusTarget.focus({ preventScroll: true });
        requestAnimationFrame(() => {
            if (activePanel === panel && document.activeElement === trigger) focusTarget.focus({ preventScroll: true });
        });
    }

    document.addEventListener('click', (event) => {
        const demoCart = event.target.closest('a[href="#preview-cart"], a[href$="/cart/"]');
        if (demoCart) {
            event.preventDefault();
            const region = demoCart.closest('li.product') || root.querySelector('.sdc-price');
            if (region) mark(region, 'Корзина в режиме предпросмотра.');
        }
        const toggle = event.target.closest('[data-toggle="modal"][data-target]');
        if (toggle && supportedPanels.includes(toggle.dataset.target)) {
            event.preventDefault();
            const modal = document.getElementById(toggle.dataset.target);
            if (modal) openPanel(modal, toggle);
        }
        if (activePanel && event.target.closest('.button-close, .off-modal-layer, [data-dismiss="modal"]')?.closest('.wplb-modal') === activePanel) {
            event.preventDefault();
            closePanel();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closePanel();
    });

    const syncScroll = () => {
        if (!bar || !spacer || !body.classList.contains('header-sticky')) return;
        const height = bar.getBoundingClientRect().height;
        const fixed = window.scrollY > height && body.offsetHeight > height + window.innerHeight;
        spacer.style.height = fixed ? `${height}px` : '';
        bar.classList.toggle('minimized', fixed);
        compactBar?.classList.toggle('minimized', fixed);
        body.classList.toggle('sticky-minimized', fixed);
    };
    window.addEventListener('scroll', syncScroll, { passive: true });
    window.addEventListener('resize', syncScroll, { passive: true });
    syncScroll();
})();
