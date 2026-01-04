import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const S3_BUCKET = process.env.S3_BUCKET;
const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_REGION = process.env.S3_REGION ?? "auto";

if (!S3_BUCKET || !S3_ENDPOINT) {
  throw new Error("S3_BUCKET or S3_ENDPOINT is not set");
}

const s3Client = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? ""
  }
});

function normalizePublicBase(base: string) {
  const trimmed = base.replace(/\/$/, "");
  try {
    const baseUrl = new URL(trimmed);
    const endpointUrl = new URL(S3_ENDPOINT);
    const isSameHost = baseUrl.host === endpointUrl.host;
    const isRootPath = baseUrl.pathname === "" || baseUrl.pathname === "/";
    if (isSameHost && isRootPath) {
      return `${trimmed}/${S3_BUCKET}`;
    }
  } catch {
    // Fall through with trimmed base.
  }
  return trimmed;
}

function buildPublicUrl(key: string) {
  const base =
    process.env.S3_PUBLIC_BASE_URL ??
    `${S3_ENDPOINT.replace(/\/$/, "")}/${S3_BUCKET}`;
  const normalizedBase = normalizePublicBase(base);
  return `${normalizedBase.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}

export async function createPresignedUpload({
  userId,
  fileName,
  contentType
}: {
  userId: string;
  fileName: string;
  contentType: string;
}) {
  const extension = fileName.includes(".")
    ? fileName.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "")
    : "bin";
  const key = `${userId}/${randomUUID()}${extension ? `.${extension}` : ""}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });
  const publicUrl = buildPublicUrl(key);

  return { key, uploadUrl, publicUrl };
}
