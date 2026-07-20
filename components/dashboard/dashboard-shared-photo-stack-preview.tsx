import type { UserMediaAssetWithPreview } from "@/lib/user-self-service";
import { cn } from "@/lib/utils";
import { LazyDashboardImagePreview } from "./dashboard-media-preview";

type PhotoStackPreviewProps = {
  assets: UserMediaAssetWithPreview[];
  footerLabel: string;
};

const fallbackFrames = [
  "bg-[linear-gradient(135deg,var(--chart-1)_0%,var(--chart-1)_100%)]",
  "bg-[linear-gradient(135deg,var(--chart-1)_0%,var(--chart-1)_100%)]",
  "bg-[linear-gradient(135deg,var(--chart-1)_0%,var(--chart-1)_100%)]",
];

const frameClasses = [
  "left-5 top-7 h-[58%] w-[42%] rotate-[-9deg]",
  "left-[34%] top-5 z-10 h-[62%] w-[44%] rotate-[6deg]",
  "left-[20%] top-[24%] z-20 h-[60%] w-[48%] rotate-[-2deg]",
];

export function PhotoStackPreview({
  assets,
  footerLabel,
}: PhotoStackPreviewProps) {
  const visibleFrames = frameClasses.map((frameClass, index) => ({
    frameClass,
    thumbnail: assets[index],
    fallbackClass: fallbackFrames[index],
  }));

  return (
    <div className="absolute inset-0 p-4">
      {visibleFrames.map(({ frameClass, thumbnail, fallbackClass }, index) => (
        <div
          key={thumbnail?.id ?? `fallback-${index}`}
          className={cn(
            "absolute overflow-hidden rounded-control-default border border-surface-panel-border shadow-surface-interactive",
            frameClass,
            thumbnail ? "bg-surface-inset" : fallbackClass,
          )}
        >
          {thumbnail ? (
            <LazyDashboardImagePreview
              alt={thumbnail.original_name}
              asset={thumbnail}
              className="h-full w-full"
              imageClassName="h-full w-full object-cover"
              loadingFallback={
                <div className="h-full w-full bg-surface-inset" />
              }
            />
          ) : null}
        </div>
      ))}

      <div className="absolute inset-x-4 bottom-4 z-30 flex justify-end rounded-control-compact bg-surface-panel px-4 py-3 backdrop-blur-sm">
        <span className="text-xs font-medium text-content-muted">
          {footerLabel}
        </span>
      </div>
    </div>
  );
}
