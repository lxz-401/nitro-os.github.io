import { createSignal, onMount, onCleanup, For, Show } from "solid-js";
import { TABS } from "../../data/showcase";

type TabId = (typeof TABS)[number]["id"];

export default function ShowcaseTabs() {
  const [activeTab, setActiveTab] = createSignal<TabId>("desktop");
  const [scrollProgress, setScrollProgress] = createSignal<number>(0);
  const [isReplaying, setIsReplaying] = createSignal<boolean>(false);
  let sectionRef: HTMLDivElement | undefined;

  const [activeSubtabs, setActiveSubtabs] = createSignal<Record<TabId, string>>({
    desktop: "wallpaper",
    launcher: "launcher",
    dev: "nitrovim-code",
    npk: "fastfetch",
    settings: "feel",
  });

  const updateScroll = () => {
    if (!sectionRef || isReplaying()) return;
    const rect = sectionRef.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Start opening when the showcase section approaches the viewport
    const startY = windowHeight * 1.05;
    // Fully open when the showcase section is in view
    const endY = windowHeight * 0.10;

    const raw = (startY - rect.top) / (startY - endY);
    const clamped = Math.max(0, Math.min(1, raw));
    setScrollProgress(clamped);
  };

  onMount(() => {
    // Initial check (starts closed at scrollY = 0)
    updateScroll();

    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          updateScroll();
          rafId = null;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    onCleanup(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    });
  });

  const replayOpen = () => {
    if (isReplaying()) return;
    setIsReplaying(true);
    setScrollProgress(0);
    setTimeout(() => {
      setScrollProgress(1);
      setTimeout(() => {
        setIsReplaying(false);
        updateScroll();
      }, 1300);
    }, 350);
  };

  const currentTabObj = () => TABS.find((t) => t.id === activeTab());

  const currentSubtabObj = () => {
    const tabObj = currentTabObj();
    if (!tabObj) return null;
    const subId = activeSubtabs()[tabObj.id];
    return tabObj.subtabs.find((s) => s.id === subId) || tabObj.subtabs[0];
  };

  const setSubtab = (tabId: TabId, subtabId: string) => {
    setActiveSubtabs((prev) => ({
      ...prev,
      [tabId]: subtabId,
    }));
  };

  // Interpolated angle from -82deg (closed) to 0deg (fully open)
  const currentAngle = () => {
    const p = scrollProgress();
    return (-82 * (1 - p)).toFixed(2);
  };

  // Screen brightness from 0.35 to 1.0
  const currentBrightness = () => {
    const p = scrollProgress();
    return (0.35 + 0.65 * p).toFixed(3);
  };

  // Glow opacity from 0 to 1.0
  const currentGlow = () => {
    return scrollProgress().toFixed(3);
  };

  return (
    <div ref={sectionRef} class="w-full flex flex-col items-center">
      {/* Tab controls bar & replay button */}
      <div class="flex flex-col sm:flex-row items-center justify-between w-full gap-4 mb-8">
        <div
          role="tablist"
          aria-label="Nitro OS surfaces"
          class="flex flex-wrap w-full gap-1.5 bg-surface-2/60 p-1.5 rounded-2xl border border-border/80 backdrop-blur-md sm:flex-row sm:w-fit sm:rounded-full sm:p-1 sm:gap-1"
        >
          <For each={TABS}>
            {(tab) => (
              <button
                role="tab"
                aria-selected={activeTab() === tab.id}
                onClick={() => setActiveTab(tab.id)}
                class={`w-full sm:w-auto rounded-xl sm:rounded-full px-5 py-2.5 sm:py-2 text-[13.5px] font-medium tracking-tight text-left sm:text-center transition-all duration-200 cursor-pointer ${
                  activeTab() === tab.id
                    ? "bg-accent text-white font-semibold shadow-sm"
                    : "text-text-muted hover:text-text hover:bg-surface-2/40 sm:hover:bg-transparent"
                }`}
              >
                {tab.label}
              </button>
            )}
          </For>
        </div>

        {/* Subtabs and Replay button */}
        <div class="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <Show when={currentTabObj() && currentTabObj()!.subtabs.length > 1}>
            <div class="flex gap-1 bg-surface-2/80 p-0.5 rounded-full border border-border">
              <For each={currentTabObj()!.subtabs}>
                {(sub) => (
                  <button
                    onClick={() => setSubtab(activeTab(), sub.id)}
                    class={`px-3 py-1 rounded-full text-[11.5px] font-medium transition-all duration-200 cursor-pointer ${
                      currentSubtabObj()?.id === sub.id
                        ? "bg-accent text-white font-semibold"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    {sub.label}
                  </button>
                )}
              </For>
            </div>
          </Show>

          {/* Replay animation button */}
          <button
            onClick={replayOpen}
            title="Replay laptop opening animation"
            disabled={isReplaying()}
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-text-muted hover:text-accent border border-border/80 bg-surface-2/40 hover:bg-surface-2/80 transition-all duration-200 cursor-pointer disabled:opacity-50 ml-auto sm:ml-0"
          >
            <svg
              class={`w-3.5 h-3.5 transition-transform duration-500 ${isReplaying() ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span class="hidden xs:inline">Replay</span>
          </button>
        </div>
      </div>

      {/* 3D Laptop Mockup Stage */}
      <div class="w-full max-w-5xl relative laptop-stage pt-4 pb-12 flex flex-col items-center overflow-visible">
        {/* Ambient glow underneath laptop */}
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-64 bg-accent/15 blur-3xl rounded-full pointer-events-none transition-opacity duration-300"
          style={{ opacity: currentGlow() }}
        />

        {/* Laptop Container */}
        <div class="relative w-full laptop-preserve-3d flex flex-col items-center">
          {/* Laptop Lid (Screen) */}
          <div
            class="relative w-full aspect-[16/10] laptop-lid z-30 shadow-2xl"
            style={{
              transform: `rotateX(${currentAngle()}deg)`,
              transition: isReplaying()
                ? "transform 1.25s cubic-bezier(0.16, 1, 0.3, 1)"
                : "transform 0.12s cubic-bezier(0.2, 0.8, 0.4, 1)",
            }}
          >
            {/* Screen Bezel & Display */}
            <div
              class="absolute inset-0 bg-[#0c0f0d] border-[3px] sm:border-4 border-[#252f28] rounded-t-2xl sm:rounded-t-3xl overflow-hidden flex flex-col shadow-2xl p-2 sm:p-3 pb-2.5"
              style={{
                filter: `brightness(${currentBrightness()})`,
                transition: isReplaying() ? "filter 0.8s ease" : "filter 0.12s ease-out",
              }}
            >
              {/* Bezel header with webcam & LED */}
              <div class="relative w-full flex items-center justify-center py-1 sm:py-1.5 shrink-0">
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#050706] border border-white/20 shadow-inner" />
                  <div
                    class="w-1 h-1 rounded-full bg-accent shadow-[0_0_5px_#299C45]"
                    style={{
                      opacity: scrollProgress() > 0.5 ? "1" : "0.2",
                      transition: "opacity 0.3s ease",
                    }}
                  />
                </div>
              </div>

              {/* Display Area */}
              <div class="relative flex-1 w-full bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-inner flex flex-col">


                {/* Screenshot Display */}
                <div class="relative flex-1 w-full bg-bg overflow-hidden">
                  <Show when={currentSubtabObj()}>
                    {(sub) => (
                      <div class="h-full w-full relative">
                        <img
                          src={sub().src}
                          alt={sub().label}
                          class="h-full w-full object-cover select-none"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}
                  </Show>

                  {/* Glass Glare / Sheen effect */}
                  <div
                    class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none"
                    style={{
                      opacity: scrollProgress().toFixed(2),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hinge bar at pivot line */}
          <div class="relative w-3/4 h-2 sm:h-2.5 -mt-1 bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 rounded-full border border-neutral-800 z-20 shadow-md" />

          {/* LAPTOP BASE (Keyboard Deck, Trackpad & Notch) */}
          <div
            class="relative w-[101%] -mt-1 h-44 sm:h-64 md:h-80 laptop-base bg-gradient-to-b from-[#1b211d] via-[#141815] to-[#0c0f0d] border-2 border-[#2b352e] border-t-[3px] border-t-[#171d19] rounded-b-2xl sm:rounded-b-3xl shadow-[0_35px_70px_rgba(0,0,0,0.9),0_0_60px_rgba(41,156,69,0.18)] flex flex-col items-center px-4 sm:px-8 pt-3 sm:pt-5 z-10"
          >
            {/* Keyboard Deck Well */}
            <div class="w-[92%] h-[56%] bg-[#080b09] rounded-lg border border-[#1e2520] p-1.5 sm:p-2.5 flex flex-col justify-between shadow-inner">
              {/* Function row */}
              <div class="flex gap-1 h-[14%] w-full">
                <div class="flex-1 bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-1 bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-1 bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-1 bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-1 bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-1 bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-1 bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-1 bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-1 bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-1 bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-1 bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-1 bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-1 bg-[#141916] rounded-xs border-b border-[#0a0d0b] relative flex items-center justify-center">
                  {/* Power indicator dot */}
                  <span class="w-1 h-1 rounded-full bg-accent shadow-[0_0_3px_#299C45]"></span>
                </div>
              </div>

              {/* Number Row */}
              <div class="flex gap-1 h-[17%] w-full">
                <div class="flex-[1.5] bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-[1.8] bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
              </div>

              {/* QWERTY Row */}
              <div class="flex gap-1 h-[17%] w-full">
                <div class="flex-[1.6] bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-[1.5] bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
              </div>

              {/* ASDF Row */}
              <div class="flex gap-1 h-[17%] w-full">
                <div class="flex-[1.9] bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-1 bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
                <div class="flex-[2.1] bg-[#161c18] rounded-xs border-b border-[#0c0f0d]" />
              </div>

              {/* Bottom Modifiers & Spacebar */}
              <div class="flex gap-1 h-[18%] w-full">
                <div class="flex-[1.3] bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-1 bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-[1.2] bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-[6] bg-[#171e19] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-[1.2] bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-1 bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
                <div class="flex-[1.5] bg-[#141916] rounded-xs border-b border-[#0a0d0b]" />
              </div>
            </div>

            {/* Glass Trackpad */}
            <div class="w-28 sm:w-44 md:w-56 h-10 sm:h-16 md:h-20 mt-2 sm:mt-3 bg-white/[0.015] border border-white/[0.06] rounded-lg sm:rounded-xl shadow-inner" />

            {/* Front Notch */}
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-1.5 sm:h-2 bg-[#0a0d0b] rounded-t-md border-t border-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
