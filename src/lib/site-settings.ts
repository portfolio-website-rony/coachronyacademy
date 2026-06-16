import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ContactSettings = {
  whatsapp: string;
  messenger: string;
  facebook: string;
  email: string;
  youtube?: string;
  instagram?: string;
};

const DEFAULTS: ContactSettings = {
  whatsapp: "8801960254383",
  messenger: "https://m.me/coachronyacademy",
  facebook: "https://facebook.com/coachrony",
  email: "hello@coachrony.com",
};

let cache: ContactSettings | null = null;

export function useContactSettings(): ContactSettings {
  const [s, setS] = useState<ContactSettings>(cache ?? DEFAULTS);
  useEffect(() => {
    let mounted = true;
    void supabase
      .from("cms_site_settings")
      .select("value")
      .eq("key", "contact")
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted || !data) return;
        const merged = { ...DEFAULTS, ...(data.value as Partial<ContactSettings>) };
        cache = merged;
        setS(merged);
      });
    return () => {
      mounted = false;
    };
  }, []);
  return s;
}

export type WorkExperienceItem = { name: string; logo_url: string; role?: string };

let weCache: WorkExperienceItem[] | null = null;

export function useWorkExperience(): WorkExperienceItem[] {
  const [items, setItems] = useState<WorkExperienceItem[]>(weCache ?? []);
  useEffect(() => {
    let mounted = true;
    void supabase
      .from("cms_site_settings")
      .select("value")
      .eq("key", "work_experience")
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted || !data) return;
        const v = data.value as { items?: WorkExperienceItem[] } | null;
        const list = Array.isArray(v?.items) ? v!.items : [];
        weCache = list;
        setItems(list);
      });
    return () => {
      mounted = false;
    };
  }, []);
  return items;
}
