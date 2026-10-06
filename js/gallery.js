const workShowcase = document.querySelector("[data-work-showcase]");

if (workShowcase) {
  const feature = workShowcase.querySelector("[data-work-feature]");
  const featureImage = workShowcase.querySelector("[data-work-image]");
  const previousButton = workShowcase.querySelector("[data-work-previous]");
  const nextButton = workShowcase.querySelector("[data-work-next]");
  const thumbs = [...workShowcase.querySelectorAll("[data-work-thumb]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const touchQuery = window.matchMedia("(max-width: 980px), (hover: none), (pointer: coarse)");
  const scrollBehavior = () => (reducedMotion.matches ? "auto" : "smooth");
  const pad = (value) => String(value).padStart(2, "0");
  const photos = thumbs.map((thumb) => {
    const thumbImage = thumb.querySelector("img");
    return {
      src: thumb.dataset.src || "",
      srcset: thumb.dataset.srcset || "",
      alt: thumb.dataset.alt || "",
      ratio: `${thumbImage?.getAttribute("width") || 4} / ${thumbImage?.getAttribute("height") || 3}`,
    };
  });
  const total = photos.length;
  let activeIndex = 0;
  let autoTimer;
  let switchTimer;

  const isTouchLayout = () => touchQuery.matches;

  /* Desktop: feature image + filmstrip */

  const showExample = (index, scrollThumb = true) => {
    const nextIndex = (index + total) % total;
    const thumb = thumbs[nextIndex];
    if (!thumb || !feature || !featureImage) return;

    activeIndex = nextIndex;
    feature.classList.add("is-switching");
    clearTimeout(switchTimer);

    switchTimer = window.setTimeout(() => {
      const photo = photos[activeIndex];

      featureImage.srcset = photo.srcset;
      featureImage.src = photo.src;
      featureImage.alt = photo.alt;

      thumbs.forEach((item, itemIndex) => {
        const active = itemIndex === activeIndex;
        item.classList.toggle("is-active", active);
        if (active) item.setAttribute("aria-current", "true");
        else item.removeAttribute("aria-current");
      });

      feature.classList.remove("is-switching");
      if (scrollThumb) thumb.scrollIntoView({ behavior: scrollBehavior(), block: "nearest", inline: "center" });
    }, reducedMotion.matches ? 0 : 180);
  };

  const startAutoPlay = () => {
    clearInterval(autoTimer);
    if (isTouchLayout() || reducedMotion.matches || workShowcase.dataset.motionActive !== "true" || workShowcase.matches(":hover, :focus-within")) return;
    autoTimer = window.setInterval(() => showExample(activeIndex + 1, false), 5500);
  };

  if (!isTouchLayout()) {
    photos.forEach((photo) => {
      const preload = document.createElement("link");
      preload.rel = "preload";
      preload.as = "image";
      preload.href = photo.src;
      preload.imageSrcset = photo.srcset;
      preload.imageSizes = featureImage.sizes;
      preload.fetchPriority = "low";
      document.head.append(preload);
    });
  }

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
      showExample(index, false);
      startAutoPlay();
    });
  });

  nextButton?.addEventListener("click", () => {
    showExample(activeIndex + 1);
    startAutoPlay();
  });

  previousButton?.addEventListener("click", () => {
    showExample(activeIndex - 1);
    startAutoPlay();
  });

  workShowcase.addEventListener("keydown", (event) => {
    if (isTouchLayout() || event.target.closest("[data-work-carousel]")) return;
    if (event.key === "ArrowRight") showExample(activeIndex + 1);
    if (event.key === "ArrowLeft") showExample(activeIndex - 1);
  });

  workShowcase.addEventListener("pointerenter", () => clearInterval(autoTimer));
  workShowcase.addEventListener("pointerleave", startAutoPlay);
  workShowcase.addEventListener("focusin", () => clearInterval(autoTimer));
  workShowcase.addEventListener("focusout", () => window.setTimeout(startAutoPlay, 0));
  workShowcase.addEventListener("motionvisibilitychange", startAutoPlay);

  /* Phones and tablets: swipeable carousel */

  const arrowIcon = (path) => `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="${path}"/></svg>`;
  const previousIcon = arrowIcon("m15 18-6-6 6-6M9 12h11");
  const nextIcon = arrowIcon("m9 18 6-6-6-6M15 12H4");

  const carousel = document.createElement("div");
  carousel.className = "work-carousel";
  carousel.dataset.workCarousel = "";
  carousel.setAttribute("role", "region");
  carousel.setAttribute("aria-roledescription", "carousel");
  carousel.setAttribute("aria-label", "Examples of our work");
  carousel.innerHTML = `
    <div class="work-carousel__track" data-carousel-track></div>
    <div class="shell work-carousel__bar">
      <div class="work-carousel__status">
        <p class="work-carousel__count" aria-hidden="true"><strong data-carousel-count>01</strong> / ${pad(total)}</p>
        <div class="work-carousel__progress" aria-hidden="true"><span data-carousel-progress></span></div>
        <div class="work-browser__controls">
          <button type="button" data-carousel-previous aria-label="Show previous photo">${previousIcon}</button>
          <button type="button" data-carousel-next aria-label="Show next photo">${nextIcon}</button>
        </div>
      </div>
    </div>`;

  const track = carousel.querySelector("[data-carousel-track]");
  const carouselCount = carousel.querySelector("[data-carousel-count]");
  const carouselProgress = carousel.querySelector("[data-carousel-progress]");
  const carouselPrevious = carousel.querySelector("[data-carousel-previous]");
  const carouselNext = carousel.querySelector("[data-carousel-next]");

  const slides = photos.map((photo, index) => {
    const slide = document.createElement("button");
    slide.type = "button";
    slide.className = "work-slide";
    slide.style.aspectRatio = photo.ratio;
    slide.setAttribute("aria-label", `Open photo ${index + 1} of ${total}: ${photo.alt}`);
    slide.innerHTML = `
      <img src="${photo.src}" srcset="${photo.srcset}" sizes="(max-width: 680px) 86vw, 640px" alt="" loading="${index < 2 ? "eager" : "lazy"}" decoding="async">
      <span class="work-slide__open" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg></span>`;
    slide.addEventListener("click", () => openLightbox(index));
    track.append(slide);
    return slide;
  });

  // Lets the final photo snap to the start edge, so every slide can become the current one.
  const endSpacer = document.createElement("span");
  endSpacer.className = "work-carousel__end";
  endSpacer.setAttribute("aria-hidden", "true");
  track.append(endSpacer);

  workShowcase.querySelector(".work-browser")?.after(carousel);

  // The first slide sits at the track's inline padding, which matches its scroll-padding.
  const trackInset = () => slides[0].offsetLeft;
  const slideOffset = (slide) => slide.offsetLeft - trackInset();

  const sizeEndSpacer = () => {
    const last = slides[total - 1];
    endSpacer.style.flexBasis = `${Math.max(0, track.clientWidth - last.offsetWidth - trackInset() * 2)}px`;
  };

  const setCarouselIndex = (index) => {
    activeIndex = index;
    carouselCount.textContent = pad(index + 1);
    carouselProgress.style.transform = `scaleX(${(index + 1) / total})`;
    carouselPrevious.disabled = index === 0;
    carouselNext.disabled = index === total - 1;
    slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === index));
  };

  const scrollToSlide = (index, behavior = scrollBehavior()) => {
    const target = Math.max(0, Math.min(total - 1, index));
    track.scrollTo({ left: slideOffset(slides[target]), behavior });
  };

  const syncFromScroll = () => {
    let closest = 0;
    slides.forEach((slide, index) => {
      if (Math.abs(slideOffset(slide) - track.scrollLeft) < Math.abs(slideOffset(slides[closest]) - track.scrollLeft)) closest = index;
    });
    if (closest !== activeIndex || !slides[closest].classList.contains("is-active")) setCarouselIndex(closest);
  };

  let scrollFrame;
  track.addEventListener("scroll", () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(syncFromScroll);
  }, { passive: true });

  carouselPrevious.addEventListener("click", () => scrollToSlide(activeIndex - 1));
  carouselNext.addEventListener("click", () => scrollToSlide(activeIndex + 1));

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") scrollToSlide(activeIndex + 1);
    if (event.key === "ArrowLeft") scrollToSlide(activeIndex - 1);
  });

  new ResizeObserver(() => {
    if (!isTouchLayout()) return;
    sizeEndSpacer();
    scrollToSlide(activeIndex, "auto");
  }).observe(track);

  /* Full-screen viewer, shared by both layouts */

  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxTrack = lightbox?.querySelector("[data-lightbox-track]");
  const lightboxCount = lightbox?.querySelector("[data-lightbox-count]");
  const lightboxPrevious = lightbox?.querySelector("[data-lightbox-previous]");
  const lightboxNext = lightbox?.querySelector("[data-lightbox-next]");
  let lightboxIndex = 0;

  const lightboxSlides = photos.map((photo) => {
    const slide = document.createElement("figure");
    slide.className = "lightbox__slide";
    slide.innerHTML = `<img src="${photo.src}" srcset="${photo.srcset}" sizes="(max-width: 1100px) 100vw, 1100px" alt="${photo.alt}" loading="lazy" decoding="async">`;
    lightboxTrack?.append(slide);
    return slide;
  });

  const setLightboxIndex = (index) => {
    lightboxIndex = index;
    lightboxCount.textContent = `${pad(index + 1)} / ${pad(total)}`;
    lightboxPrevious.disabled = index === 0;
    lightboxNext.disabled = index === total - 1;
  };

  const scrollLightboxTo = (index, behavior = scrollBehavior()) => {
    const target = Math.max(0, Math.min(total - 1, index));
    lightboxTrack.scrollTo({ left: target * lightboxTrack.clientWidth, behavior });
  };

  const openLightbox = (index) => {
    if (!lightbox || !lightboxTrack) return;
    clearInterval(autoTimer);
    lightboxSlides[index].querySelector("img").loading = "eager";
    lightbox.showModal();
    document.documentElement.classList.add("is-lightbox-open");
    scrollLightboxTo(index, "auto");
    setLightboxIndex(index);
  };

  let lightboxFrame;
  lightboxTrack?.addEventListener("scroll", () => {
    cancelAnimationFrame(lightboxFrame);
    lightboxFrame = requestAnimationFrame(() => {
      const index = Math.round(lightboxTrack.scrollLeft / lightboxTrack.clientWidth);
      if (index !== lightboxIndex) setLightboxIndex(Math.max(0, Math.min(total - 1, index)));
    });
  }, { passive: true });

  lightboxPrevious?.addEventListener("click", () => scrollLightboxTo(lightboxIndex - 1));
  lightboxNext?.addEventListener("click", () => scrollLightboxTo(lightboxIndex + 1));
  lightbox?.querySelector("[data-lightbox-close]")?.addEventListener("click", () => lightbox.close());

  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target.classList.contains("lightbox__slide")) lightbox.close();
  });

  lightbox?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") scrollLightboxTo(lightboxIndex + 1);
    if (event.key === "ArrowLeft") scrollLightboxTo(lightboxIndex - 1);
  });

  lightbox?.addEventListener("close", () => {
    document.documentElement.classList.remove("is-lightbox-open");
    if (isTouchLayout()) scrollToSlide(lightboxIndex, "auto");
    else {
      showExample(lightboxIndex);
      startAutoPlay();
    }
  });

  feature?.addEventListener("click", () => openLightbox(activeIndex));

  /* Layout switching */

  const updateLayout = () => {
    const touch = isTouchLayout();
    const wasTouch = workShowcase.classList.contains("is-touch");
    workShowcase.classList.toggle("is-touch", touch);
    if (touch) {
      clearInterval(autoTimer);
      sizeEndSpacer();
      scrollToSlide(activeIndex, "auto");
      setCarouselIndex(activeIndex);
    } else {
      if (wasTouch) showExample(activeIndex, false);
      startAutoPlay();
    }
  };

  touchQuery.addEventListener("change", updateLayout);
  updateLayout();
}
