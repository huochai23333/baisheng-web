"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { LoaderCircle, LogIn, RefreshCw, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AppRole } from "@/lib/auth-routing";
import { cn } from "@/lib/utils";

import type { DashboardMyCopy } from "./dashboard-shared-my-copy";
import {
  DashboardAccountSwitcherConfirmDialog,
  type AccountSwitcherConfirmAction,
} from "./dashboard-account-switcher-confirm-dialog";
import type { DashboardSharedMyState } from "./use-dashboard-shared-my-state";

type DashboardAccountSwitcherSectionProps = {
  copy: DashboardMyCopy;
  state: DashboardSharedMyState["accountSwitcher"];
  ui: DashboardSharedMyState["ui"];
};

export function DashboardAccountSwitcherSection({
  copy,
  state,
  ui,
}: DashboardAccountSwitcherSectionProps) {
  const busyKey = ui.busyKey;
  const alternateAccount = state.alternateAccount;
  const [confirmAction, setConfirmAction] =
    useState<AccountSwitcherConfirmAction | null>(null);

  return (
    <>
      <section
        className="scroll-mt-28 rounded-[28px] border border-white/85 bg-white/68 p-6 shadow-[0_18px_45px_rgba(96,113,128,0.06)] xl:p-8"
        id="common-account"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e6edf2] text-[#486782]">
              <UserRound className="size-5" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-[#486782]">
                {copy.accountSwitcherTitle}
              </h3>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6e7780]">
                {copy.accountSwitcherDescription}
              </p>
            </div>
          </div>

          {!alternateAccount ? (
            <Button
              className="h-11 shrink-0 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79]"
              disabled={busyKey !== null}
              onClick={() => void state.actions.addAlternateAccount()}
            >
              {busyKey === "account-switcher-add" ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              {copy.accountSwitcherAdd}
            </Button>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {state.currentAccount ? (
            <AccountCard
              account={{
                displayName: state.currentAccount.displayName,
                email: state.currentAccount.email,
                role: state.currentAccount.role ?? null,
              }}
              copy={copy}
              label={copy.accountSwitcherCurrent}
            />
          ) : null}

          {alternateAccount ? (
            <AccountCard
              account={alternateAccount}
              action={
                <div className="flex flex-wrap gap-2">
                  {state.alternateNeedsReauthentication ? (
                    <Button
                      className="h-10 rounded-full bg-[#486782] px-4 text-white hover:bg-[#3e5f79]"
                      disabled={busyKey !== null}
                      onClick={() => void state.actions.reauthenticateAlternateAccount()}
                    >
                      {busyKey === "account-switcher-reauthenticate" ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <RefreshCw className="size-4" />
                      )}
                      {copy.accountSwitcherReauthenticate}
                    </Button>
                  ) : (
                    <Button
                      className="h-10 rounded-full bg-[#486782] px-4 text-white hover:bg-[#3e5f79]"
                      disabled={busyKey !== null}
                      onClick={() => void state.actions.switchToAlternateAccount()}
                    >
                      {busyKey === "account-switcher-switch" ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <RefreshCw className="size-4" />
                      )}
                      {copy.accountSwitcherSwitch}
                    </Button>
                  )}
                  <Button
                    className="h-10 rounded-full border-[#d4d8dc] bg-white px-4 text-[#486782] hover:bg-[#f2f4f6]"
                    disabled={busyKey !== null}
                    onClick={() => setConfirmAction("remove")}
                    variant="outline"
                  >
                    <Trash2 className="size-4" />
                    {copy.accountSwitcherRemove}
                  </Button>
                </div>
              }
              label={
                state.alternateNeedsReauthentication
                  ? copy.accountSwitcherNeedsLogin
                  : copy.accountSwitcherReady
              }
              copy={copy}
              muted={state.alternateNeedsReauthentication}
            />
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#d7dce0] bg-[#f7f8f8] p-5 text-sm leading-6 text-[#6e7780]">
              {state.hasSavedCurrentAccount
                ? copy.accountSwitcherCurrentOnlySaved
                : copy.accountSwitcherEmpty}
            </div>
          )}
        </div>

        {state.hasSavedAccountOnDevice ? (
          <div className="mt-5 flex justify-end">
            <Button
              className="h-10 rounded-full border-[#d4d8dc] bg-white px-4 text-[#6e7780] hover:bg-[#f2f4f6]"
              disabled={busyKey !== null}
              onClick={() => setConfirmAction("clear")}
              variant="outline"
            >
              {copy.accountSwitcherClear}
            </Button>
          </div>
        ) : null}
      </section>

      <DashboardAccountSwitcherConfirmDialog
        action={confirmAction}
        copy={copy}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          const action = confirmAction;

          setConfirmAction(null);

          if (action === "remove") {
            state.actions.removeAlternateAccount();
            return;
          }

          if (action === "clear") {
            state.actions.clearSavedAccounts();
          }
        }}
        open={confirmAction !== null}
      />
    </>
  );
}

function AccountCard({
  account,
  action,
  copy,
  label,
  muted = false,
}: {
  account: {
    displayName: string;
    email: string;
    role: AppRole | null;
  };
  action?: ReactNode;
  copy: DashboardMyCopy;
  label: string;
  muted?: boolean;
}) {
  const roleLabel = account.role ? getAccountSwitcherRoleLabel(copy, account.role) : null;

  return (
    <article
      className={cn(
        "rounded-[24px] border p-5",
        muted
          ? "border-[#ead7c6] bg-[#fff8f1]"
          : "border-[#e4e8eb] bg-[#f9faf9]",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
              muted ? "bg-[#f1dfcf] text-[#8a6243]" : "bg-[#dff0e4] text-[#487155]",
            )}
          >
            {label}
          </span>
          <p className="mt-3 break-words text-lg font-bold text-[#24313a]">
            {account.displayName}
          </p>
          <p className="mt-1 break-all text-sm text-[#6e7780]">{account.email}</p>
          {roleLabel ? (
            <p className="mt-2 text-xs font-semibold text-[#7d8890]">
              {roleLabel}
            </p>
          ) : null}
        </div>
        {action}
      </div>
    </article>
  );
}

function getAccountSwitcherRoleLabel(copy: DashboardMyCopy, role: AppRole) {
  const roleLabels: Record<AppRole, string> = {
    administrator: copy.accountSwitcherRoleAdministrator,
    client: copy.accountSwitcherRoleClient,
    finance: copy.accountSwitcherRoleFinance,
    manager: copy.accountSwitcherRoleManager,
    operator: copy.accountSwitcherRoleOperator,
    recruiter: copy.accountSwitcherRoleRecruiter,
    salesman: copy.accountSwitcherRoleSalesman,
  };

  return roleLabels[role];
}
