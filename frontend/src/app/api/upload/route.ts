import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const BUCKET_NAME = process.env.DIGITAL_OCEAN_SPACES_BUCKET_NAME!;
const ENDPOINT = process.env.DIGITAL_OCEAN_SPACES_ENDPOINT!;

const endpointUrl = ENDPOINT.startsWith("https://")
  ? ENDPOINT
  : `https://${ENDPOINT}`;

const spacesClient = new S3Client({
  endpoint: endpointUrl,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.DIGITAL_OCEAN_SPACES_KEY!,
    secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 100MB" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/quicktime",
      "audio/mp3",
      "audio/wav",
      "audio/m4a",
      "audio/mpeg",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const fileName = `${Date.now()}-${file.name.replace(
      /[^a-zA-Z0-9.-]/g,
      "_"
    )}`;
    const bucketName = BUCKET_NAME;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ACL: "public-read" as const,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(uploadParams);
    await spacesClient.send(command);

    // Return the public URL
    const publicUrl = `${endpointUrl}/${bucketName}/${fileName}`;

    return NextResponse.json({
      url: publicUrl,
      filename: fileName,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
