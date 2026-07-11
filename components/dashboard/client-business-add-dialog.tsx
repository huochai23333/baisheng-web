"use client";

import { useMemo, useState } from "react";

import { Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import type { ClientBusinessCandidate } from "@/lib/client-business-access";
import { normalizeSearchText } from "@/lib/value-normalizers";

import { Button } from "../ui/button";
import { DashboardDialog } from "./dashboard-dialog";
import {
  DashboardFilterField,
  dashboardFilterInputClassName,
} from "./dashboard-section-panel";
import { AuthFeedback } from "../auth/auth-feedback";

type ClientBusinessAddDialogProps = {
  business: "tourism" | "wholesale";
  candidates: ClientBusinessCandidate[];
  error: string | null;
  onAdd: (userId: string) => Promise<boolean>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingUserId: string | null;
};

export function ClientBusinessAddDialog({
  business,
  candidates,
  error,
  onAdd,
  onOpenChange,
  open,
  pendingUserId,
}: ClientBusinessAddDialogProps) {
  const t = useTranslations("ClientBusinessAccess");
  const [searchText, setSearchText] = useState("");
  const filteredCandidates = useMemo(() => {
    const searchValue = normalizeSearchText(searchText);

    if (!searchValue) {
      return candidates;
    }

    return candidates.filter((candidate) =>
      [candidate.name, candidate.email, candidate.phone].some((value) =>
        normalizeSearchText(value ?? "").includes(searchValue),
      ),
    );
  }, [candidates, searchText]);

  return (
    <DashboardDialog
      description={t("description", { business: t(`businesses.${business}`) })}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setSearchText("");
        }
        onOpenChange(nextOpen);
      }}
      open={open}
      title={t("title", { business: t(`businesses.${business}`) })}
    >
      <div className="min-w-0 space-y-5">
        {error ? <AuthFeedback tone="error">{error}</AuthFeedback> : null}

        <DashboardFilterField label={t("searchLabel")}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a949c]" />
            <input
              className={`${dashboardFilterInputClassName} pl-10`}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={t("searchPlaceholder")}
              type="search"
              value={searchText}
            />
          </div>
        </DashboardFilterField>

        <div className="max-h-[min(55vh,430px)] space-y-2 overflow-y-auto overscroll-contain pr-1">
          {filteredCandidates.length === 0 ? (
            <p className="rounded-[18px] border border-dashed border-[#dce2e6] px-4 py-8 text-center text-sm leading-6 text-[#78858f]">
              {t("empty")}
            </p>
          ) : (
            filteredCandidates.map((candidate) => {
              const pending = pendingUserId === candidate.userId;

              return (
                <div
                  className="flex min-w-0 flex-col gap-3 rounded-[18px] border border-[#e2e7ea] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  key={candidate.userId}
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#2c3d48]">
                      {candidate.name?.trim() ||
                        candidate.email ||
                        t("unnamed")}
                    </p>
                    <p className="mt-1 break-words text-sm leading-6 text-[#74818b]">
                      {[candidate.email, candidate.phone]
                        .filter(Boolean)
                        .join(" / ") || t("noContact")}
                    </p>
                  </div>
                  <Button
                    className="h-10 shrink-0 rounded-full bg-[#486782] px-4 text-white hover:bg-[#3e5f79]"
                    disabled={Boolean(pendingUserId)}
                    onClick={async () => {
                      const succeeded = await onAdd(candidate.userId);
                      if (succeeded) onOpenChange(false);
                    }}
                    type="button"
                  >
                    <Plus className="size-4" />
                    {pending ? t("adding") : t("add")}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardDialog>
  );
}
