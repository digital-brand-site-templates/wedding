/*
Template Name: Weddcall
File Name: main.js
Author Name: ThemeVault
Author URI: https://www.themevault.net/
Version: 2.0

Dependency-free. Bootstrap's own bundle drives the navbar and the dropdown;
everything below replaces what jQuery, Owl Carousel, The Final Countdown,
Magnific Popup, fullPage.js and custom.js used to do.
*/
(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Back to top — fades in past 100px, returns to the top */
    var toTop = document.getElementById("back-to-top");
    if (toTop) {
        var toggleToTop = function () { toTop.classList.toggle("is-visible", window.scrollY > 100); };
        toggleToTop();
        window.addEventListener("scroll", toggleToTop, { passive: true });
        toTop.addEventListener("click", function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        });
    }

    /* The navbar sits under the hero. Once the page has scrolled past the
       hero it takes `.affix` and the template fixes it to the top —
       custom.js measured `.tv-banner-image` on every scroll; same test. */
    var nav = document.getElementById("primary-navbar");
    var banner = document.querySelector(".tv-banner-image");
    if (nav && banner) {
        var toggleAffix = function () { nav.classList.toggle("affix", window.scrollY > banner.offsetHeight); };
        toggleAffix();
        window.addEventListener("scroll", toggleAffix, { passive: true });
    }

    /* Tapping a link in the collapsed menu closes it (not the dropdown
       toggle, which would retract the menu before the submenu opens). */
    var collapse = document.querySelector(".navbar-collapse");
    if (collapse) {
        collapse.addEventListener("click", function (e) {
            var link = e.target.closest("a.nav-link, a.dropdown-item");
            if (!link || link.classList.contains("dropdown-toggle") || link.getAttribute("data-bs-toggle")) return;
            if (!collapse.classList.contains("show")) return;
            var inst = window.bootstrap && bootstrap.Collapse.getInstance(collapse);
            if (inst) inst.hide();
        });
    }

    /* Lightbox — replaces magnific-popup on `[data-image-popup]`, gallery
       mode: arrows and the keyboard step through the set; focus is trapped
       and restored. */
    var popupLinks = Array.prototype.slice.call(document.querySelectorAll("[data-image-popup]"));
    if (popupLinks.length) {
        var box = document.createElement("div");
        box.className = "tv-lightbox";
        box.setAttribute("role", "dialog");
        box.setAttribute("aria-modal", "true");
        box.setAttribute("aria-label", "Image viewer");
        box.innerHTML =
            '<button type="button" class="tv-lb-close" aria-label="Close">&times;</button>' +
            '<button type="button" class="tv-lb-prev" aria-label="Previous image">&#10094;</button>' +
            '<img alt="">' +
            '<button type="button" class="tv-lb-next" aria-label="Next image">&#10095;</button>';
        document.body.appendChild(box);
        var lbImg = box.querySelector("img"), current = 0, lastFocus = null;
        var show = function (i) {
            current = (i + popupLinks.length) % popupLinks.length;
            var link = popupLinks[current];
            lbImg.src = link.getAttribute("href");
            var inner = link.querySelector("img");
            lbImg.alt = (inner && inner.getAttribute("alt")) || "Gallery image";
        };
        var open = function (i) {
            lastFocus = document.activeElement; show(i);
            box.classList.add("is-open"); document.body.style.overflow = "hidden";
            box.querySelector(".tv-lb-close").focus();
        };
        var close = function () {
            box.classList.remove("is-open"); document.body.style.overflow = "";
            lbImg.removeAttribute("src"); if (lastFocus) lastFocus.focus();
        };
        popupLinks.forEach(function (link, i) { link.addEventListener("click", function (e) { e.preventDefault(); open(i); }); });
        box.querySelector(".tv-lb-close").addEventListener("click", close);
        box.querySelector(".tv-lb-prev").addEventListener("click", function () { show(current - 1); });
        box.querySelector(".tv-lb-next").addEventListener("click", function () { show(current + 1); });
        box.addEventListener("click", function (e) { if (e.target === box) close(); });
        document.addEventListener("keydown", function (e) {
            if (!box.classList.contains("is-open")) return;
            if (e.key === "Escape") close();
            if (e.key === "ArrowLeft") show(current - 1);
            if (e.key === "ArrowRight") show(current + 1);
        });
    }

    /* Countdown — replaces The Final Countdown. Reads `data-enddate` in the
       plugin's "YYYY/MM/DD HH:MM:SS" form and renders the same four boxes.

       v1's date was 2018/06/01: the clock has read 0 days, 0 hours since
       the summer of 2018, on the demo and in every download. A wedding
       template with a stopped clock sells nobody anything, so a date in the
       past ROLLS FORWARD a year at a time until it is ahead — the same day
       and time, next year — and the clock runs. Set your own date in the
       attribute and it counts to that. */
    document.querySelectorAll(".countdown[data-enddate]").forEach(function (el) {
        var m = el.getAttribute("data-enddate").match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
        if (!m) return;
        var end = new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
        while (end.getTime() < Date.now()) end.setFullYear(end.getFullYear() + 1);
        var pad = function (n) { return (n < 10 ? "0" : "") + n; };
        var render = function () {
            var left = Math.max(0, end.getTime() - Date.now());
            var d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24, mi = Math.floor(left / 6e4) % 60, s = Math.floor(left / 1e3) % 60;
            el.innerHTML = '<div class="counter-container">'
                + '<div class="counter-box first"><div class="number">' + d + '</div><span>Day' + (d === 1 ? "" : "s") + '</span></div>'
                + '<div class="counter-box"><div class="number">' + pad(h) + '</div><span>Hours</span></div>'
                + '<div class="counter-box"><div class="number">' + pad(mi) + '</div><span>Minutes</span></div>'
                + '<div class="counter-box last"><div class="number">' + pad(s) + '</div><span>Seconds</span></div>'
                + '</div>';
        };
        render();
        setInterval(render, 1000);
    });

    /* The full-screen gallery — replaces fullPage.js. The sections are laid
       out by CSS scroll-snap (see style.css); this builds fullPage's dot
       navigation with the same markup and tooltips, keeps the active dot in
       step with the section on screen, and answers the arrow keys. */
    var fullpage = document.getElementById("fullpage");
    if (fullpage) {
        var sections = Array.prototype.slice.call(fullpage.querySelectorAll(".section"));
        var tips = (fullpage.getAttribute("data-tooltips") || "").split("|");
        var fpnav = document.createElement("div");
        fpnav.id = "fp-nav";
        fpnav.className = "right";
        var ul = document.createElement("ul");
        sections.forEach(function (sec, i) {
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.href = "#" + (sec.id || ("section" + i));
            a.setAttribute("aria-label", tips[i] || ("Section " + (i + 1)));
            if (i === 0) a.className = "active";
            a.appendChild(document.createElement("span"));
            li.appendChild(a);
            if (tips[i]) {
                var tip = document.createElement("div");
                tip.className = "fp-tooltip right";
                tip.textContent = tips[i];
                li.appendChild(tip);
            }
            a.addEventListener("click", function (e) {
                e.preventDefault();
                sec.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
            });
            ul.appendChild(li);
        });
        fpnav.appendChild(ul);
        document.body.appendChild(fpnav);
        /* fullPage centred the strip by setting margin-top to half its
           height inline; the stylesheet's -32px is only its placeholder */
        fpnav.style.marginTop = (-fpnav.offsetHeight / 2) + "px";
        var dots = ul.querySelectorAll("a");
        var setActive = function (i) { dots.forEach(function (d, j) { d.classList.toggle("active", i === j); }); };
        if ("IntersectionObserver" in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) { if (en.isIntersecting) setActive(sections.indexOf(en.target)); });
            }, { root: fullpage, threshold: 0.6 });
            sections.forEach(function (s) { io.observe(s); });
        }
        document.addEventListener("keydown", function (e) {
            if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "PageDown" && e.key !== "PageUp") return;
            var cur = Array.prototype.findIndex.call(dots, function (d) { return d.classList.contains("active"); });
            var next = Math.max(0, Math.min(sections.length - 1, cur + (e.key === "ArrowDown" || e.key === "PageDown" ? 1 : -1)));
            if (next !== cur) { e.preventDefault(); sections[next].scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); }
        });
    }

    /* A static template posts nowhere, so rather than pretend, validate and
       say so plainly. Applies to every form that carries a note element. */
    document.querySelectorAll("form").forEach(function (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!form.checkValidity()) { form.classList.add("was-validated"); return; }
            var note = form.querySelector(".tv-form-note");
            if (note) { note.hidden = false; note.focus(); }
            form.reset(); form.classList.remove("was-validated");
        });
    });

    /* ------------------------------------------------------------------
       Carousels — replaces Owl Carousel 2.2.1 (and jQuery with it).

       v1 configured its hero from an inline <script> block on every page. The plugin's STYLESHEET is ported verbatim because it is the
       slider's design, and the markup only ever carried the wrapper — Owl built
       `.owl-stage-outer > .owl-stage > .owl-item` at runtime. So this builds
       the same DOM, and those ported rules apply exactly as they did.

       Config travels on `data-owl`, lifted from v1's scripts by the porter:
         items / responsive   how many show at each MIN width
         nav, dots            arrows (Font Awesome angles, as v1's navText) / pager
         loop                 wrap around — with CLONES, as Owl does, so the
                              last slide slides forward into the first rather
                              than rewinding across every slide in between
         speed                transition in ms. Owl set this inline from
                              navSpeed (2000 on most of these) or its 250 default
         autoplay             interval in ms; Owl's default autoplayTimeout, 5000

       NOT fade. v1's scripts say `transitionStyle: "fade"`, which is an Owl
       1.x option Owl 2 ignores; measured, v1's hero and testimonials SLIDE
       (the stage carries a translate, every item is opaque). A fade would have
       looked smoother and been wrong.
       ------------------------------------------------------------------ */
    document.querySelectorAll("[data-owl]").forEach(function (root) {
        var cfg;
        try { cfg = JSON.parse(root.getAttribute("data-owl")); } catch (e) { return; }
        var slides = Array.prototype.filter.call(root.children, function (c) { return c.nodeType === 1; });
        if (!slides.length) return;
        var speed = reduceMotion ? 0 : (cfg.speed || 250);
        var loop = !!cfg.loop && slides.length > 1;

        var stage = document.createElement("div");
        stage.className = "owl-stage";
        var outer = document.createElement("div");
        outer.className = "owl-stage-outer";
        outer.appendChild(stage);

        var wrap = function (el, cloned) {
            var item = document.createElement("div");
            item.className = "owl-item" + (cloned ? " cloned" : "");
            if (cloned) item.setAttribute("aria-hidden", "true");
            item.appendChild(el);
            return item;
        };
        /* Owl clones the whole set on both sides for a loop; so does this, and
           the DOM ends up the shape v1's was (2 slides -> 6 items). */
        if (loop) slides.forEach(function (el) { stage.appendChild(wrap(el.cloneNode(true), true)); });
        slides.forEach(function (el) { stage.appendChild(wrap(el, false)); });
        if (loop) slides.forEach(function (el) { stage.appendChild(wrap(el.cloneNode(true), true)); });

        root.textContent = "";
        root.appendChild(outer);
        root.classList.add("owl-loaded", "owl-drag");

        var items = Array.prototype.slice.call(stage.children);
        var count = slides.length;
        var index = loop ? count : 0;   // position in `items`
        var timer = null, animating = false;

        /* owl renders the nav container even when nav:false — it just marks it
           disabled — and the template styles `.owl-nav.disabled` and
           `.owl-nav.disabled + .owl-dots`, so the element has to exist. */
        var nav = document.createElement("div");
        nav.className = "owl-nav" + (cfg.nav ? "" : " disabled");
        ["prev", "next"].forEach(function (dir) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "owl-" + dir;
            b.setAttribute("aria-label", dir === "prev" ? "Previous" : "Next");
            /* v1's navText: an image (the template's Icon1.png, flipped by
               CSS for prev) where the config names one, else angle icons */
            b.innerHTML = cfg.navImg
                ? '<img src="' + cfg.navImg + '" alt="">'
                : '<i class="fas fa-angle-' + (dir === "prev" ? "left" : "right") + '" aria-hidden="true"></i>';
            b.addEventListener("click", function () { go(dir === "next" ? 1 : -1); restartAutoplay(); });
            nav.appendChild(b);
        });
        root.appendChild(nav);

        var dots = document.createElement("div");
        dots.className = "owl-dots" + (cfg.dots ? "" : " disabled");
        root.appendChild(dots);

        var perView = function () {
            var w = window.innerWidth, n = cfg.items || 1;
            Object.keys(cfg.responsive || {})
                .map(Number).sort(function (a, b) { return a - b; })
                .forEach(function (bp) { if (w >= bp) n = cfg.responsive[bp]; });
            return Math.max(1, Math.min(n, count));
        };
        var itemWidth = function () {
            var n = perView(), gap = cfg.margin || 0;
            return (root.clientWidth - gap * (n - 1)) / n;
        };
        /* Non-loop sliders step a page at a time (Owl's default); a loop
           slider steps one item so the clones line up. */
        var step = function () { return loop ? 1 : perView(); };
        var lastIndex = function () { return loop ? items.length - 1 : Math.max(0, count - perView()); };

        var setTransform = function (withTransition) {
            var gap = cfg.margin || 0;
            stage.style.transition = withTransition && speed ? "transform " + speed + "ms ease" : "none";
            stage.style.transform = "translateX(" + (-index * (itemWidth() + gap)) + "px)";
            var real = loop ? ((index - count) % count + count) % count : index;
            Array.prototype.forEach.call(dots.children, function (d, i) {
                d.classList.toggle("active", i === Math.floor(real / step()));
            });
            items.forEach(function (it, i) { it.classList.toggle("active", i >= index && i < index + perView()); });
            /* Owl marks the arrow that has nowhere to go `.disabled` on a
               non-loop slider (the theme dims it); a loop never has one. */
            if (!loop) {
                var prevBtn = nav.querySelector(".owl-prev"), nextBtn = nav.querySelector(".owl-next");
                if (prevBtn) prevBtn.classList.toggle("disabled", index <= 0);
                if (nextBtn) nextBtn.classList.toggle("disabled", index >= lastIndex());
            }
        };

        var guard = null;
        var go = function (d) {
            if (animating) return;
            var target = index + d * step();
            if (!loop) target = Math.max(0, Math.min(lastIndex(), target));
            /* A no-op move — prev on the first slide of a non-loop slider —
               produces no transition and therefore no transitionend. The
               first version set the guard anyway and waited for an event
               that never came: one prev click on the services strip and it
               was dead to every click after. */
            if (target === index) return;
            index = target;
            animating = speed > 0;
            setTransform(true);
            if (!animating) { settleLoop(); return; }
            /* and a belt for the braces: if transitionend is lost (a tab
               hidden mid-slide, say) the guard still clears */
            clearTimeout(guard);
            guard = setTimeout(settleLoop, speed + 100);
        };
        /* After sliding onto a clone, jump silently to the real slide it
           copies — that is the whole trick of a cloned loop. */
        var settleLoop = function () {
            clearTimeout(guard);
            animating = false;
            if (!loop) return;
            if (index >= 2 * count) { index -= count; setTransform(false); }
            else if (index < count) { index += count; setTransform(false); }
        };
        stage.addEventListener("transitionend", function (e) { if (e.target === stage) settleLoop(); });

        var layout = function () {
            /* Laid out while hidden — inside an inactive tab pane, say — the
               width is 0 and every item would be 0 wide. Wait for a real
               size; the ResizeObserver below calls again when it arrives. */
            if (!root.clientWidth) return;
            var width = itemWidth(), gap = cfg.margin || 0;
            items.forEach(function (it) {
                it.style.width = width + "px";
                it.style.marginRight = gap + "px";
            });
            stage.style.width = (width + gap) * items.length + "px";
            if (!loop && index > lastIndex()) index = lastIndex();
            /* Dots are rebuilt on resize because the page count changes with
               how many items fit. The dot is a BUTTON WRAPPING A SPAN, because
               that is Owl's shape and the template styles `.owl-dot span`. */
            dots.textContent = "";
            var pages = Math.max(1, Math.ceil(count / step()));
            for (var i = 0; i < pages; i++) {
                (function (i) {
                    var d = document.createElement("button");
                    d.type = "button";
                    d.className = "owl-dot";
                    d.setAttribute("aria-label", "Go to slide " + (i + 1));
                    d.appendChild(document.createElement("span"));
                    d.addEventListener("click", function () { index = (loop ? count : 0) + i * step(); setTransform(true); restartAutoplay(); });
                    dots.appendChild(d);
                })(i);
            }
            setTransform(false);
        };

        /* Autoplay: paused while the pointer is over the slider, off entirely
           when the visitor asked for reduced motion. */
        var restartAutoplay = function () {
            if (!cfg.autoplay || reduceMotion) return;
            clearInterval(timer);
            timer = setInterval(function () { go(1); }, cfg.autoplay);
        };
        root.addEventListener("mouseenter", function () { clearInterval(timer); });
        root.addEventListener("mouseleave", restartAutoplay);
        restartAutoplay();

        /* Drag and swipe: owl-drag was in the class list, so the slider was
           expected to follow a finger. */
        var startX = null;
        var onDown = function (x) { startX = x; };
        var onUp = function (x) {
            if (startX === null) return;
            var dx = x - startX;
            startX = null;
            if (Math.abs(dx) < 40) return;
            go(dx < 0 ? 1 : -1);
            restartAutoplay();
        };
        root.addEventListener("touchstart", function (e) { onDown(e.touches[0].clientX); }, { passive: true });
        root.addEventListener("touchend", function (e) { onUp(e.changedTouches[0].clientX); }, { passive: true });
        root.addEventListener("mousedown", function (e) { onDown(e.clientX); });
        root.addEventListener("mouseup", function (e) { onUp(e.clientX); });

        layout();
        /* Re-lay out whenever the slider's own box changes size: the window
           resizing, and — the case that bit here — a tab pane being shown,
           which takes the slider from 0px wide to its real width. Owl handled
           the first with a resize handler and left the second to whoever
           called refresh; a ResizeObserver covers both without being told. */
        if ("ResizeObserver" in window) {
            var lastW = root.clientWidth;
            new ResizeObserver(function () {
                if (root.clientWidth === lastW) return;
                lastW = root.clientWidth;
                layout();
            }).observe(root);
        } else {
            var t;
            window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(layout, 150); }, { passive: true });
        }
    });

})();
