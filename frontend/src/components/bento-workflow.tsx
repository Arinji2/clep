// frontend/src/components/bento-workflow.tsx
export function BentoWorkflow() {
  const steps = [
    { icon: "content_copy", label: "Copy Text" },
    { icon: "pin", label: "Choose Code" },
    { icon: "send", label: "Share", highlight: true },
    { icon: "devices", label: "Open Device" },
    { icon: "download", label: "Get Text" },
  ];

  return (
    <div className="mt-8 mb-8 w-full overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest px-2 py-6 shadow-sm transition-colors md:mb-12">
      <div className="hide-scrollbar flex snap-x snap-mandatory flex-row items-center gap-2 overflow-x-auto px-4 md:justify-between md:gap-4">
        {steps.map((step, idx) => (
          <div
            key={step.label}
            className="flex shrink-0 snap-center items-center gap-2 md:gap-4"
          >
            <div className="group flex flex-col items-center gap-2">
              <div
                className={`flex h-14 w-14 items-center justify-center transition-all duration-200 md:h-16 md:w-16 ${
                  step.highlight
                    ? "scale-105 rounded-2xl bg-primary text-on-primary shadow-md md:scale-110"
                    : "rounded-full bg-surface-container text-on-surface shadow-xs group-hover:bg-primary-container group-hover:text-on-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[24px] md:text-[28px]">
                  {step.icon}
                </span>
              </div>
              <span
                className={`w-20 text-center text-[10px] md:w-24 md:text-xs ${
                  step.highlight
                    ? "mt-1 font-bold text-primary"
                    : "font-semibold text-on-surface-variant"
                }`}
              >
                {step.label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div className="relative h-0.5 w-6 bg-outline-variant/60 md:w-8">
                <span className="-translate-y-1/2 material-symbols-outlined absolute top-1/2 right-0 translate-x-1/2 text-[14px] text-outline md:text-[16px]">
                  chevron_right
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
