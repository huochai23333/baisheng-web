import type { SupabaseClient } from "@supabase/supabase-js";

import {
  optionalString,
  requiredString,
  splitList,
} from "./wholesale-action-utils";

export async function addWholesaleCustomerOtherNames(
  supabase: SupabaseClient,
  formData: FormData,
) {
  const customerId = requiredString(formData.get("customer_id"));
  const nextNames = splitList(formData.get("other_names"));

  if (nextNames.length === 0) {
    throw new Error("wholesale_customer_other_name_required");
  }

  const { data, error } = await supabase
    .from("wholesale_customers")
    .select("other_names")
    .eq("id", customerId)
    .single<{ other_names: unknown }>();

  if (error) throw error;

  const otherNames = mergeOtherNames(readOtherNames(data?.other_names), nextNames);
  const { error: updateError } = await supabase
    .from("wholesale_customers")
    .update({ other_names: otherNames })
    .eq("id", customerId);

  if (updateError) throw updateError;
}

export async function updateWholesaleCustomer(
  supabase: SupabaseClient,
  formData: FormData,
) {
  const { error } = await supabase.rpc("update_wholesale_customer", {
    p_assigned_sales_user_id: optionalString(
      formData.get("assigned_sales_user_id"),
    ),
    p_contact_details: optionalString(formData.get("contact_details")),
    p_customer_id: requiredString(formData.get("customer_id")),
    p_notes: optionalString(formData.get("notes")),
    p_other_names: splitList(formData.get("other_names")),
    p_source: optionalString(formData.get("source")),
    p_unique_name: requiredString(formData.get("unique_name")),
  });

  if (error) throw error;
}

export async function deleteWholesaleCustomer(
  supabase: SupabaseClient,
  customerId: string,
) {
  const { error } = await supabase.rpc("delete_wholesale_customer", {
    p_customer_id: customerId,
  });

  if (error) throw error;
}

function readOtherNames(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function mergeOtherNames(currentNames: string[], nextNames: string[]) {
  const seenNames = new Set<string>();
  const mergedNames: string[] = [];

  for (const name of [...currentNames, ...nextNames]) {
    const normalizedName = name.trim();
    const compareKey = normalizedName.toLocaleLowerCase("zh-CN");

    if (!normalizedName || seenNames.has(compareKey)) {
      continue;
    }

    seenNames.add(compareKey);
    mergedNames.push(normalizedName);
  }

  return mergedNames;
}
