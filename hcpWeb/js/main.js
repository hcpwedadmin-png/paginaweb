/* =========================================================
   HCP CONSULTORES - Scripts principales
   ========================================================= */

(function () {
    "use strict";

    /* =============================================
       1. Año dinámico en el footer
       ============================================= */
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* =============================================
       2. Menú hamburguesa (móvil)
       ============================================= */
    const navToggle = document.getElementById("navToggle");
    const navbarMenu = document.getElementById("navbarMenu");

    if (navToggle && navbarMenu) {
        navToggle.addEventListener("click", function () {
            navbarMenu.classList.toggle("open");
        });

        navbarMenu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                navbarMenu.classList.remove("open");
            });
        });
    }

    /* =============================================
       3. Animaciones de scroll (reutilizables)
       ============================================= */
    const elementosAnimados = document.querySelectorAll(".reveal");

    if (elementosAnimados.length && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: "0px 0px -60px 0px"
        });

        elementosAnimados.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        elementosAnimados.forEach(function (el) {
            el.classList.add("is-visible");
        });
    }

    /* =============================================
       4. Carrusel de sectores
       ============================================= */
    const sectoresTrack = document.getElementById("sectoresTrack");
    const sectoresDots = document.getElementById("sectoresDots");
    const sectoresCarousel = document.getElementById("sectoresCarousel");

    if (sectoresTrack && sectoresDots && sectoresCarousel) {

        const INTERVALO = 3500;
        const DURACION = 550;

        const slides = Array.from(sectoresTrack.children);
        const total = slides.length;
        let visibles = 9;
        let currentIndex = 0;
        let autoplayTimer = null;
        let enTransicion = false;

        function calcularVisibles() {
            const carouselStyles = getComputedStyle(sectoresCarousel);
            const valor = carouselStyles.getPropertyValue("--slides-visibles").trim();
            visibles = parseInt(valor, 10) || 9;
        }

        function clonarSlides() {
            for (let i = 0; i < visibles; i++) {
                const clon = slides[i].cloneNode(true);
                clon.dataset.clon = "true";
                sectoresTrack.appendChild(clon);
            }
        }

        function construirDots() {
            sectoresDots.innerHTML = "";
            for (let i = 0; i < total; i++) {
                const dot = document.createElement("button");
                dot.setAttribute("aria-label", "Ir al sector " + (i + 1));
                if (i === 0) dot.classList.add("active");
                dot.addEventListener("click", function () {
                    if (enTransicion) return;
                    currentIndex = i;
                    moverTrack(true);
                    reiniciarAutoplay();
                });
                sectoresDots.appendChild(dot);
            }
        }

        function moverTrack(animar) {
            const porcentaje = (100 / visibles) * currentIndex;

            if (animar) {
                sectoresTrack.style.transition = "transform " + DURACION + "ms ease";
                enTransicion = true;
                setTimeout(function () { enTransicion = false; }, DURACION);
            } else {
                sectoresTrack.style.transition = "none";
            }

            sectoresTrack.style.transform = "translateX(-" + porcentaje + "%)";
            actualizarDots();
        }

        function actualizarDots() {
            const dots = sectoresDots.querySelectorAll("button");
            const indiceReal = currentIndex % total;
            dots.forEach(function (d, i) {
                d.classList.toggle("active", i === indiceReal);
            });
        }

        function avanzar() {
            if (enTransicion) return;
            currentIndex++;
            moverTrack(true);

            if (currentIndex >= total) {
                setTimeout(function () {
                    currentIndex = 0;
                    moverTrack(false);
                }, DURACION + 30);
            }
        }

        function iniciarAutoplay() {
            detenerAutoplay();
            autoplayTimer = setInterval(avanzar, INTERVALO);
        }

        function detenerAutoplay() {
            if (autoplayTimer) clearInterval(autoplayTimer);
            autoplayTimer = null;
        }

        function reiniciarAutoplay() {
            detenerAutoplay();
            iniciarAutoplay();
        }

        let touchStartX = 0;
        let touchEndX = 0;
        const SWIPE_THRESHOLD = 40;

        sectoresCarousel.addEventListener("touchstart", function (e) {
            touchStartX = e.changedTouches[0].screenX;
            detenerAutoplay();
        }, { passive: true });

        sectoresCarousel.addEventListener("touchend", function (e) {
            touchEndX = e.changedTouches[0].screenX;
            const delta = touchEndX - touchStartX;

            if (Math.abs(delta) > SWIPE_THRESHOLD) {
                if (delta < 0) {
                    if (!enTransicion) {
                        currentIndex++;
                        moverTrack(true);
                        if (currentIndex >= total) {
                            setTimeout(function () {
                                currentIndex = 0;
                                moverTrack(false);
                            }, DURACION + 30);
                        }
                    }
                } else {
                    if (!enTransicion) {
                        if (currentIndex <= 0) {
                            currentIndex = total;
                            moverTrack(false);
                            setTimeout(function () {
                                currentIndex = total - 1;
                                moverTrack(true);
                            }, 20);
                        } else {
                            currentIndex--;
                            moverTrack(true);
                        }
                    }
                }
            }
            iniciarAutoplay();
        }, { passive: true });

        sectoresCarousel.addEventListener("mouseenter", detenerAutoplay);
        sectoresCarousel.addEventListener("mouseleave", iniciarAutoplay);

        function inicializar() {
            calcularVisibles();
            clonarSlides();
            construirDots();
            currentIndex = 0;
            moverTrack(false);
            iniciarAutoplay();
        }

        inicializar();

        let resizeTimer = null;
        window.addEventListener("resize", function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                const visiblesPrevios = visibles;
                calcularVisibles();
                if (visibles !== visiblesPrevios) {
                    detenerAutoplay();
                    sectoresTrack.querySelectorAll("[data-clon='true']").forEach(function (el) {
                        el.remove();
                    });
                    clonarSlides();
                    currentIndex = 0;
                    moverTrack(false);
                    iniciarAutoplay();
                }
            }, 200);
        });
    }

    /* =============================================
       5. Rotador de cajas del hero
       ============================================= */
    const heroSlider = document.getElementById("heroSlider");
    const heroPrev = document.getElementById("heroPrev");
    const heroNext = document.getElementById("heroNext");

    if (heroSlider && heroPrev && heroNext) {

        const slides = Array.from(heroSlider.children);
        const total = slides.length;
        const INTERVALO = 7000;
        let index = 0;
        let autoplayTimer = null;

        function mostrar(nuevoIndex) {
            if (nuevoIndex < 0) nuevoIndex = total - 1;
            if (nuevoIndex >= total) nuevoIndex = 0;

            slides[index].classList.remove("active");
            index = nuevoIndex;
            slides[index].classList.add("active");
        }

        function iniciarAutoplay() {
            detenerAutoplay();
            autoplayTimer = setInterval(function () {
                mostrar(index + 1);
            }, INTERVALO);
        }

        function detenerAutoplay() {
            if (autoplayTimer) clearInterval(autoplayTimer);
            autoplayTimer = null;
        }

        function reiniciarAutoplay() {
            detenerAutoplay();
            iniciarAutoplay();
        }

        heroPrev.addEventListener("click", function () {
            mostrar(index - 1);
            reiniciarAutoplay();
        });

        heroNext.addEventListener("click", function () {
            mostrar(index + 1);
            reiniciarAutoplay();
        });

        heroSlider.addEventListener("mouseenter", detenerAutoplay);
        heroSlider.addEventListener("mouseleave", iniciarAutoplay);

        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        const SWIPE_MIN = 45;

        heroSlider.addEventListener("touchstart", function (e) {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            detenerAutoplay();
        }, { passive: true });

        heroSlider.addEventListener("touchend", function (e) {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY) &&
                Math.abs(deltaX) > SWIPE_MIN) {
                if (deltaX < 0) {
                    mostrar(index + 1);
                } else {
                    mostrar(index - 1);
                }
            }
            iniciarAutoplay();
        }, { passive: true });

        document.addEventListener("keydown", function (e) {
            if (e.key === "ArrowRight") {
                mostrar(index + 1);
                reiniciarAutoplay();
            }
            if (e.key === "ArrowLeft") {
                mostrar(index - 1);
                reiniciarAutoplay();
            }
        });

        iniciarAutoplay();
    }

    /* =============================================
       6. Formulario de contacto (Web3Forms + AJAX)
       ============================================= */
    const formContacto = document.getElementById("formContacto");

    if (formContacto) {
        const btnEnviar = document.getElementById("btnEnviar");
        const msgExito  = document.getElementById("mensajeExito");
        const msgError  = document.getElementById("mensajeError");

        formContacto.addEventListener("submit", async function (e) {
            e.preventDefault();

            msgExito.style.display = "none";
            msgError.style.display = "none";

            const textoOriginal = btnEnviar.innerHTML;
            btnEnviar.disabled = true;
            btnEnviar.innerHTML = '<i class="bi bi-hourglass-split"></i><span>Enviando...</span>';

            const formData = new FormData(formContacto);
            const objData = Object.fromEntries(formData);

            try {
                const response = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(objData)
                });

                const result = await response.json();

                if (result.success) {
                    msgExito.style.display = "flex";
                    formContacto.reset();
                    btnEnviar.innerHTML = textoOriginal;
                    btnEnviar.disabled = false;

                    setTimeout(function () {
                        msgExito.style.display = "none";
                    }, 8000);
                } else {
                    msgError.style.display = "flex";
                    btnEnviar.innerHTML = textoOriginal;
                    btnEnviar.disabled = false;
                }
            } catch (error) {
                console.error("Error al enviar:", error);
                msgError.style.display = "flex";
                btnEnviar.innerHTML = textoOriginal;
                btnEnviar.disabled = false;
            }
        });
    }
    /* =============================================
       7. Lista rotativa de Consultoría Gerencial
       ============================================= */
    const consultoriaLista = document.getElementById("consultoriaLista");

    if (consultoriaLista) {
        const items = consultoriaLista.querySelectorAll(".servicio-lista-item");
        const DURACION = 4000;   // debe coincidir con la animación CSS
        let idx = 0;

        setInterval(function () {
            items[idx].classList.remove("active");
            idx = (idx + 1) % items.length;
            items[idx].classList.add("active");
        }, DURACION);
    }
})();