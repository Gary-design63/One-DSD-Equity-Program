// Supabase Edge Function: blob-storage
// Server-side Azure Blob Storage operations
// Handles upload, download, delete, and list operations
// Requires authenticated user via Supabase auth

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const AZURE_STORAGE_ACCOUNT = Deno.env.get("AZURE_STORAGE_ACCOUNT") || "";
const AZURE_STORAGE_KEY = Deno.env.get("AZURE_STORAGE_KEY") || "";
const AZURE_STORAGE_CONTAINER = Deno.env.get("AZURE_STORAGE_CONTAINER") || "one-dsd-files";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// If Azure Blob Storage is not configured, fall back to Supabase Storage
const USE_SUPABASE_STORAGE = !AZURE_STORAGE_ACCOUNT || !AZURE_STORAGE_KEY;

const SUPABASE_STORAGE_BUCKET = "one-dsd-files";

// Max file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_TYPES = [
  "application/pdf",
  "application/json",
  "text/csv",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function errorResponse(status: number, message: string) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function authenticateRequest(req: Request): Promise<{ userId: string; email: string } | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) return null;
  return { userId: user.id, email: user.email || "" };
}

// --- Azure Blob Storage operations ---

async function azureRequest(
  method: string,
  path: string,
  body?: Uint8Array | null,
  contentType?: string
): Promise<Response> {
  const now = new Date().toUTCString();
  const url = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_STORAGE_CONTAINER}/${path}`;

  // Simplified SAS-based auth for Azure Blob Storage
  // In production, use Azure.Identity or generate SAS tokens server-side
  const headers: Record<string, string> = {
    "x-ms-date": now,
    "x-ms-version": "2023-11-03",
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  if (body) {
    headers["Content-Length"] = String(body.length);
  }

  return fetch(url, {
    method,
    headers,
    body: body || undefined,
  });
}

// --- Supabase Storage fallback operations ---

function getSupabaseAdmin() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

async function uploadToSupabase(
  filePath: string,
  fileData: Uint8Array,
  contentType: string,
  userId: string
): Promise<{ url: string }> {
  const supabase = getSupabaseAdmin();

  const storagePath = `${userId}/${filePath}`;
  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(storagePath, fileData, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return { url: urlData.publicUrl };
}

async function downloadFromSupabase(filePath: string, userId: string): Promise<{ data: Uint8Array; contentType: string }> {
  const supabase = getSupabaseAdmin();
  const storagePath = `${userId}/${filePath}`;

  const { data, error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .download(storagePath);

  if (error || !data) throw new Error(`Download failed: ${error?.message || "File not found"}`);

  const arrayBuffer = await data.arrayBuffer();
  return {
    data: new Uint8Array(arrayBuffer),
    contentType: data.type || "application/octet-stream",
  };
}

async function deleteFromSupabase(filePath: string, userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const storagePath = `${userId}/${filePath}`;

  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .remove([storagePath]);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}

async function listFromSupabase(prefix: string, userId: string): Promise<Array<{ name: string; size: number; createdAt: string }>> {
  const supabase = getSupabaseAdmin();
  const storagePath = prefix ? `${userId}/${prefix}` : userId;

  const { data, error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .list(storagePath);

  if (error) throw new Error(`List failed: ${error.message}`);

  return (data || []).map(f => ({
    name: f.name,
    size: f.metadata?.size || 0,
    createdAt: f.created_at || "",
  }));
}

// --- Request handler ---

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Authenticate
  const authUser = await authenticateRequest(req);
  if (!authUser) {
    return errorResponse(401, "Authentication required");
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    switch (action) {
      case "upload": {
        if (req.method !== "POST") return errorResponse(405, "POST required for upload");

        const contentType = req.headers.get("content-type") || "";
        const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
        const filePath = url.searchParams.get("path");

        if (!filePath) return errorResponse(400, "File path is required");
        if (contentLength > MAX_FILE_SIZE) return errorResponse(413, "File too large (max 50MB)");

        // Validate MIME type from the actual content type or the query param
        const mimeType = url.searchParams.get("type") || contentType.split(";")[0];
        if (mimeType && !ALLOWED_TYPES.includes(mimeType)) {
          return errorResponse(415, `File type not allowed: ${mimeType}`);
        }

        const body = new Uint8Array(await req.arrayBuffer());

        if (USE_SUPABASE_STORAGE) {
          const result = await uploadToSupabase(filePath, body, mimeType, authUser.userId);
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Azure Blob Storage upload
        const azureResp = await azureRequest("PUT", filePath, body, mimeType);
        if (!azureResp.ok) {
          return errorResponse(500, `Azure upload failed: ${azureResp.status}`);
        }

        return new Response(
          JSON.stringify({
            url: `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_STORAGE_CONTAINER}/${filePath}`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "download": {
        const filePath = url.searchParams.get("path");
        if (!filePath) return errorResponse(400, "File path is required");

        if (USE_SUPABASE_STORAGE) {
          const { data, contentType } = await downloadFromSupabase(filePath, authUser.userId);
          return new Response(data, {
            headers: {
              ...corsHeaders,
              "Content-Type": contentType,
              "Content-Disposition": `attachment; filename="${filePath.split("/").pop()}"`,
            },
          });
        }

        // Azure Blob Storage download
        const azureResp = await azureRequest("GET", filePath);
        if (!azureResp.ok) {
          return errorResponse(404, "File not found");
        }

        const blobData = new Uint8Array(await azureResp.arrayBuffer());
        return new Response(blobData, {
          headers: {
            ...corsHeaders,
            "Content-Type": azureResp.headers.get("content-type") || "application/octet-stream",
            "Content-Disposition": `attachment; filename="${filePath.split("/").pop()}"`,
          },
        });
      }

      case "delete": {
        if (req.method !== "DELETE") return errorResponse(405, "DELETE method required");

        const filePath = url.searchParams.get("path");
        if (!filePath) return errorResponse(400, "File path is required");

        if (USE_SUPABASE_STORAGE) {
          await deleteFromSupabase(filePath, authUser.userId);
          return new Response(JSON.stringify({ deleted: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const azureResp = await azureRequest("DELETE", filePath);
        if (!azureResp.ok && azureResp.status !== 404) {
          return errorResponse(500, `Azure delete failed: ${azureResp.status}`);
        }

        return new Response(JSON.stringify({ deleted: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "list": {
        const prefix = url.searchParams.get("prefix") || "";

        if (USE_SUPABASE_STORAGE) {
          const files = await listFromSupabase(prefix, authUser.userId);
          return new Response(JSON.stringify({ files }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // For Azure, list is more complex (requires XML parsing of container response)
        // Simplified: return a message indicating Azure list requires additional setup
        return new Response(
          JSON.stringify({ files: [], message: "Azure Blob list not yet implemented — use Supabase Storage" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return errorResponse(400, "Invalid action. Use: upload, download, delete, list");
    }
  } catch (err) {
    console.error("Blob storage error:", err);
    return errorResponse(500, err instanceof Error ? err.message : "Internal server error");
  }
});
