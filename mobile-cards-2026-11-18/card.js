/* SD 2026-10-26 — новый шаблон карточки товара: галерея, исполнение, лизинг, заявки. */
(function () {
	'use strict';

	var root = document.querySelector('.sdc');
	if (!root) return;
	var dataEl = root.querySelector('.sdc-data');
	var D = {};
	try { D = JSON.parse(dataEl.textContent); } catch (e) { return; }

	var $ = function (sel, ctx) { return (ctx || root).querySelector(sel); };
	var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); };
	var goal = function () {};
	var rub = function (n, dec) {
		return Number(n).toLocaleString('ru-RU', { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0 }) + ' ₽';
	};
	var esc = function (s) { var d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; };

	/* Формы Contact Form 7 в окнах: заполняем скрытые поля (товар, исполнение, расчёт). */
	function fillCf7(dlg, calc) {
		var box = dlg && dlg.querySelector('.sdc-cf7');
		if (!box) return;
		var set = function (name, val) {
			var el = box.querySelector('[name="' + name + '"]');
			if (el) el.value = val;
		};
		set('sd-product-id', D.productId);
		set('sd-ispolnenie', ispValue());
		if (calc) { set('sd-cost', calc.cost); set('sd-adv', calc.adv); set('sd-term', calc.term); }
	}
	document.addEventListener('wpcf7mailsent', function (e) {
		var box = e.target && e.target.closest && e.target.closest('.sdc-cf7');
		if (box) goal(box.dataset.type === 'lizing' ? 'sd_lizing_request' : 'sd_kp_request');
	});

	/* ---------- Окна ---------- */
	function openDlg(dlg) {
		if (!dlg) return;
		if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); }
		else dlg.setAttribute('open', '');
	}
	function closeDlg(dlg) {
		if (!dlg) return;
		if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
	}
	$$('[data-close]').forEach(function (b) { b.addEventListener('click', function () { closeDlg(b.closest('dialog')); }); });
	$$('dialog.sdc-dlg').forEach(function (d) {
		d.addEventListener('click', function (e) {
			if (e.target !== d) return;
			var r = d.getBoundingClientRect();
			if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDlg(d);
		});
	});

	/* ---------- Галерея ---------- */
	var slides = D.slides || [];
	var active = 0;
	var photoBtn = $('.sdc-photo');
	var photoImg = $('.sdc-photo-img');
	var counter = $('.sdc-counter');
	var imgDlg = $('.sdc-dlg-img');
	var large = $('.sdc-large');
	var largeCounter = $('.sdc-large-counter');
	var imageIdx = slides.map(function (s, i) { return s.type === 'image' ? i : -1; }).filter(function (i) { return i >= 0; });

	function stopVideos() {
		$$('.sdc-video').forEach(function (v) {
			var f = v.querySelector('iframe');
			if (f) { var src = f.src; f.src = 'about:blank'; f.src = src; }
			var vid = v.querySelector('video');
			if (vid) vid.pause();
		});
	}

	function select(i) {
		if (!slides.length) return;
		active = (i + slides.length) % slides.length;
		var s = slides[active];
		stopVideos();
		$$('.sdc-video').forEach(function (v) { v.hidden = Number(v.dataset.i) !== active; });
		if (s.type === 'image') {
			photoBtn.hidden = false;
			if (photoImg) {
				photoImg.src = s.src;
				if (s.srcset) photoImg.srcset = s.srcset; else photoImg.removeAttribute('srcset');
				photoImg.alt = s.alt;
			}
		} else {
			photoBtn.hidden = true;
		}
		if (counter) counter.textContent = (active + 1) + ' / ' + slides.length;
		$$('.sdc-thumb').forEach(function (t) {
			var on = Number(t.dataset.i) === active;
			t.setAttribute('aria-pressed', on ? 'true' : 'false');
			if (on && t.scrollIntoView) {
				var box = t.parentNode;
				var horiz = box.scrollWidth > box.clientWidth + 2;
				var vert = box.scrollHeight > box.clientHeight + 2;
				if (horiz) box.scrollLeft = t.offsetLeft - box.clientWidth / 2 + t.offsetWidth / 2;
				else if (vert) box.scrollTop = t.offsetTop - box.clientHeight / 2 + t.offsetHeight / 2;
			}
		});
	}

	$$('.sdc-thumb').forEach(function (t) {
		t.addEventListener('click', function () { select(Number(t.dataset.i)); });
		t.addEventListener('keydown', function (e) {
			var step = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
			if (!step) return;
			e.preventDefault();
			select(active + step);
			var n = $('.sdc-thumb[data-i="' + active + '"]');
			if (n) n.focus();
		});
	});

	var more = $('.sdc-more');
	var thumbs = $('.sdc-thumbs');
	if (more && thumbs) {
		var syncMore = function () {
			var atEnd = thumbs.scrollTop + thumbs.clientHeight >= thumbs.scrollHeight - 4;
			more.textContent = atEnd ? 'В начало ↑' : 'Ещё фото ↓';
			more.hidden = thumbs.scrollHeight <= thumbs.clientHeight + 4;
		};
		more.addEventListener('click', function () {
			var atEnd = thumbs.scrollTop + thumbs.clientHeight >= thumbs.scrollHeight - 4;
			thumbs.scrollTop = atEnd ? 0 : thumbs.scrollTop + thumbs.clientHeight;
		});
		thumbs.addEventListener('scroll', syncMore, { passive: true });
		window.addEventListener('resize', syncMore);
		syncMore();
	}

	/* Свайп по фото (телефон) */
	function swipe(el, onLeft, onRight, onTap) {
		var start = null, moved = false;
		el.addEventListener('pointerdown', function (e) { moved = false; if (e.pointerType === 'touch') start = { x: e.clientX, y: e.clientY }; });
		el.addEventListener('pointercancel', function () { start = null; });
		el.addEventListener('pointerup', function (e) {
			if (!start) return;
			var dx = e.clientX - start.x, dy = e.clientY - start.y;
			if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) { (dx < 0 ? onLeft : onRight)(); moved = true; }
			start = null;
		});
		if (onTap) el.addEventListener('click', function () { if (moved) { moved = false; return; } onTap(); });
	}

	/* Увеличение */
	function showLarge() {
		var s = slides[active];
		if (!s || s.type !== 'image' || !large) return;
		large.src = s.full || s.src;
		large.alt = s.alt;
		var pos = imageIdx.indexOf(active);
		if (largeCounter) largeCounter.textContent = imageIdx.length > 1 ? (pos + 1) + ' / ' + imageIdx.length : '';
	}
	function stepLarge(dir) {
		if (imageIdx.length < 2) return;
		var pos = imageIdx.indexOf(active);
		pos = (pos + dir + imageIdx.length) % imageIdx.length;
		select(imageIdx[pos]);
		showLarge();
	}
	if (photoBtn) {
		swipe(photoBtn, function () { select(active + 1); }, function () { select(active - 1); }, function () {
			showLarge(); openDlg(imgDlg);
		});
	}
	if (imgDlg) {
		var pv = $('.sdc-prev', imgDlg), nx = $('.sdc-next', imgDlg);
		if (pv) pv.addEventListener('click', function () { stepLarge(-1); });
		if (nx) nx.addEventListener('click', function () { stepLarge(1); });
		if (imageIdx.length < 2) { if (pv) pv.hidden = true; if (nx) nx.hidden = true; }
		if (large) swipe(large, function () { stepLarge(1); }, function () { stepLarge(-1); });
		imgDlg.addEventListener('keydown', function (e) {
			if (e.key === 'ArrowRight') stepLarge(1);
			if (e.key === 'ArrowLeft') stepLarge(-1);
		});
	}

	/* ---------- Исполнение ---------- */
	var isp = $('.sdc-isp-select');
	var ispLabel = $('.sdc-isp-label');
	function ispValue() { return isp ? isp.value : ''; }
	function syncIsp() { $$('.sdc-ispolnenie-field').forEach(function (f) { f.value = ispValue(); }); }
	if (isp) { isp.addEventListener('change', syncIsp); syncIsp(); }

	/* ---------- Лизинг ---------- */
	var L = D.lease || {};
	function monthly(cost, adv, term) {
		var advance = cost * adv / 100;
		var sum = cost - advance;
		return { advance: advance, monthly: sum / term + sum * L.rate / 100 / 12 * (1 + L.vat / 100) };
	}
	var teaser = $('.sdc-lease-teaser');
	function updateTeaser() {
		if (teaser && D.price) teaser.textContent = 'от ' + rub(Math.round(monthly(D.price, L.advDefault, L.termDefault).monthly));
	}
	updateTeaser();
	var setCalcPrice = null;

	var calcDlg = document.getElementById('sdcCalc');
	var lastCalc = null;
	if (calcDlg) {
		var cost = $('.sdc-cost', calcDlg), adv = $('.sdc-adv', calcDlg), term = $('.sdc-term', calcDlg);
		var startCost = Math.min(L.costMax, Math.max(L.costMin, Math.round(D.price)));
		cost.min = L.costMin; cost.max = L.costMax; cost.step = 1000; cost.value = startCost;
		adv.min = L.advMin; adv.max = L.advMax; adv.step = L.advStep || 5; adv.value = L.advDefault;
		term.min = L.termMin; term.max = L.termMax; term.step = 1; term.value = L.termDefault;
		$('.sdc-cost-min', calcDlg).textContent = 'от ' + rub(L.costMin);
		$('.sdc-cost-max', calcDlg).textContent = 'до ' + rub(L.costMax);
		$('.sdc-adv-min', calcDlg).textContent = L.advMin + '%';
		$('.sdc-adv-max', calcDlg).textContent = L.advMax + '%';
		$('.sdc-term-min', calcDlg).textContent = 'от ' + L.termMin + ' мес';
		$('.sdc-term-max', calcDlg).textContent = 'до ' + L.termMax + ' мес';
		var update = function () {
			var c = Number(cost.value), a = Number(adv.value), t = Number(term.value);
			/* ползунок цены идёт шагом 1000 — если стоит на старте, считаем по точной цене товара */
			if (Math.abs(c - startCost) < 1000) c = startCost;
			lastCalc = { cost: c, adv: a, term: t, r: monthly(c, a, t) };
			$('.sdc-cost-out', calcDlg).textContent = rub(c);
			$('.sdc-adv-out', calcDlg).textContent = a + '%';
			$('.sdc-term-out', calcDlg).textContent = t + ' мес';
			$('.sdc-monthly', calcDlg).textContent = rub(lastCalc.r.monthly, true);
		};
		[cost, adv, term].forEach(function (el) { el.addEventListener('input', update); });
		update();
		setCalcPrice = function (p) {
			startCost = Math.min(L.costMax, Math.max(L.costMin, Math.round(p)));
			cost.value = startCost;
			update();
		};

		var calcBtn = $('.sdc-calc-btn');
		if (calcBtn) calcBtn.addEventListener('click', function () { openDlg(calcDlg); goal('sd_lizing_calc_open'); });

		var leaseFormDlg = document.getElementById('sdcLeaseForm');
		$('.sdc-open-lease-form', calcDlg).addEventListener('click', function () {
			var sum = $('.sdc-sum', leaseFormDlg);
			sum.innerHTML = esc(D.product) + (ispValue() ? '<br>' + esc(ispLabel ? ispLabel.textContent : 'Исполнение') + ': ' + esc(ispValue()) : '') +
				'<br>Стоимость: ' + rub(lastCalc.cost) +
				'<br>Аванс: ' + lastCalc.adv + '% (' + rub(Math.round(lastCalc.r.advance)) + ')' +
				'<br>Срок: ' + lastCalc.term + ' мес' +
				'<br>Платёж: ' + rub(lastCalc.r.monthly, true) + ' в месяц';
			resetForm(leaseFormDlg);
			fillCf7(leaseFormDlg, lastCalc);
			openDlg(leaseFormDlg);
		});
	}

	/* ---------- Коммерческое предложение / запрос цены ---------- */
	var kpDlg = document.getElementById('sdcKp');
	$$('.sdc-open-kp').forEach(function (b) {
		b.addEventListener('click', function () {
			var kind = b.dataset.kind;
			$('#sdcKpTitle', kpDlg).textContent = kind === 'price' ? b.textContent.trim() : 'Коммерческое предложение';
			$('.sdc-dlg-copy', kpDlg).textContent = kind === 'price'
				? 'Оставьте контакты — менеджер сообщит цену и сроки поставки.'
				: 'Пришлём коммерческое предложение на этот товар. Оставьте контакты — менеджер свяжется с вами.';
			$('.sdc-sum', kpDlg).innerHTML = esc(D.product) + (ispValue() ? '<br>' + esc(ispLabel ? ispLabel.textContent : 'Исполнение') + ': ' + esc(ispValue()) : '');
			resetForm(kpDlg);
			fillCf7(kpDlg, null);
			openDlg(kpDlg);
			goal('sd_kp_open');
		});
	});

	function resetForm(dlg) {
		var f = $('.sdc-form', dlg);
		if (!f) return;
		var msg = $('.sdc-msg', f);
		msg.textContent = ''; msg.classList.remove('is-error');
		$$('.is-invalid', f).forEach(function (el) { el.classList.remove('is-invalid'); });
		var btn = $('button[type=submit]', f);
		btn.hidden = false;
	}


	/* Исполнение: цена, описание, лизинг. Цена/описание варианта не заданы — товарные. */
	var priceBox = $('.sdc-price');
	var descPanel = document.getElementById('tab-description');
	var descOrig = descPanel ? descPanel.innerHTML : null;
	function applyIsp() {
		syncIsp();
		if (!isp || !D.isp || !D.isp.length) return;
		var r = D.isp[isp.selectedIndex] || null;
		if (!r) return;
		var hasOwn = r.price !== null && r.price !== undefined;
		if (priceBox && D.basePriceHtml) priceBox.innerHTML = hasOwn && r.priceHtml ? r.priceHtml : D.basePriceHtml;
		if (descPanel) {
			var tpl = root.querySelector('template.sdc-isp-desc[data-i="' + isp.selectedIndex + '"]');
			var html = tpl ? tpl.innerHTML : descOrig;
			if (descPanel.innerHTML !== html) descPanel.innerHTML = html;
		}
		D.price = hasOwn ? r.price : D.basePrice;
		updateTeaser();
		if (setCalcPrice) setCalcPrice(D.price);
	}
	if (isp) { isp.addEventListener('change', applyIsp); applyIsp(); }
})();

/* ТЗ п.7: увеличение фото в блоке материалов */
(function () {
	var dlg = document.querySelector('.sdm-dlg');
	if (!dlg) return;
	var img = dlg.querySelector('img');
	function close() { if (dlg.open) dlg.close(); img.src = ''; }
	document.querySelectorAll('.sdm [data-sdm-zoom]').forEach(function (a) {
		a.addEventListener('click', function (e) {
			if (typeof dlg.showModal !== 'function') return;
			e.preventDefault();
			var i = a.querySelector('img');
			img.src = a.href; img.alt = i ? i.alt : '';
			dlg.showModal();
		});
	});
	dlg.querySelector('.sdm-x').addEventListener('click', close);
	dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
})();
