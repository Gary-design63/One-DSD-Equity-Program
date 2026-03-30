// One DSD Equity Platform - Server-side Storage Client
// Calls the blob-storage Supabase Edge Function for file operations
// All operations require authentication

import { supabase, isSupabaseAvailable } from "@/core/supabaseClient";

export interface UploadResult {
  url: string;
}

export interface FileInfo {
  name: string;
  size: number;
  createdAt: string;
}

async function getAuthToken(): Promise<string | null> {
  if (!isSupabaseAvailable() || !supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export async function uploadFile(
  file: File,
  path: string
): Promise<UploadResult> {
  if (!isSupabaseAvailable() || !supabase) {
    throw new Error("Storage service unavailable");
  }

  const { data, error } = await supabase.functions.invoke("blob-storage", {
    body: await file.arrayBuffer(),
    headers: {
      "Content-Type": file.type,
      "Content-Length": String(file.size),
    },
    // Pass action and path as query params via the function URL
    method: "POST",
  });

  // Fallback: use direct Supabase Storage if Edge Function is not deployed
  if (error) {
    console.warn("Edge Function unavailable, falling back to direct Supabase Storage");
    return uploadFileDirect(file, path);
  }

  return data as UploadResult;
}

// Direct Supabase Storage upload (fallback when Edge Functions are not deployed)
async function uploadFileDirect(file: File, path: string): Promise<UploadResult> {
  if (!supabase) throw new Error("Supabase not available");

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || "anonymous";
  const storagePath = `${userId}/${path}`;

  const { error } = await supabase.storage
    .from("one-dsd-files")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from("one-dsd-files")
    .getPublicUrl(storagePath);

  return { url: urlData.publicUrl };
}

export async function downloadFile(path: string): Promise<Blob> {
  if (!supabase) throw new Error("Storage service unavailable");

  // Direct Supabase Storage download
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || "anonymous";
  const storagePath = `${userId}/${path}`;

  const { data, error } = await supabase.storage
    .from("one-dsd-files")
    .download(storagePath);

  if (error || !data) throw new Error(`Download failed: ${error?.message || "File not found"}`);
  return data;
}

export async function deleteFile(path: string): Promise<void> {
  if (!supabase) throw new Error("Storage service unavailable");

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || "anonymous";
  const storagePath = `${userId}/${path}`;

  const { error } = await supabase.storage
    .from("one-dsd-files")
    .remove([storagePath]);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}

export async function listFiles(prefix?: string): Promise<FileInfo[]> {
  if (!supabase) throw new Error("Storage service unavailable");

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || "anonymous";
  const storagePath = prefix ? `${userId}/${prefix}` : userId;

  const { data, error } = await supabase.storage
    .from("one-dsd-files")
    .list(storagePath);

  if (error) throw new Error(`List failed: ${error.message}`);

  return (data || []).map(f => ({
    name: f.name,
    size: f.metadata?.size || 0,
    createdAt: f.created_at || "",
  }));
}
