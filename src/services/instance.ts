import { apiErrorResponseSchema } from "@/schemas/error";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getSession } from "next-auth/react";

const prefixUrl = process.env.NEXT_PUBLIC_API_BASE;

const getAuthHeaders = async () => {
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  const session =
    typeof window === "undefined"
      ? await getServerSession(authOptions)
      : await getSession();

  if (session) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  return headers;
};

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class ApiRequest<T> {
  private readonly _schema: z.ZodSchema;

  constructor(schema: z.ZodSchema) {
    this._schema = schema;
  }

  private async request(url: string, options?: RequestInit): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${prefixUrl}${url}`, {
      ...options,
      headers: { ...headers, ...(options?.headers || {}) },
      cache: typeof window === "undefined" ? "no-cache" : "default",
    });
    return this.run(response);
  }

  public async get(url: string): Promise<T> {
    return this.request(url, { method: "GET" });
  }

  public async post(url: string, body?: unknown): Promise<T> {
    return this.request(url, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      headers: { "Content-Type": "application/json" },
    });
  }

  public async put(url: string, body: unknown): Promise<T> {
    return this.request(url, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  public async patch(url: string, body: unknown): Promise<T> {
    return this.request(url, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  public async delete(url: string, body?: unknown): Promise<T> {
    return this.request(url, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
      headers: body ? { "Content-Type": "application/json" } : {},
    });
  }

  private async run(response: Response): Promise<T> {
    // Handle 204 No Content responses
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const body = await response.json();

    if (response.ok) {
      try {
        return this._schema.parse(body) as T;
      } catch (e) {
        console.error("Schema validation failed:", e);
        throw new Error("Invalid response format from API");
      }
    }

    const error = apiErrorResponseSchema.parse(body);
    const errorMessage = Array.isArray(error.message)
      ? error.message.join(", ")
      : error.message || error.error || "unknown error";
    
    throw new ApiError(errorMessage, response.status);
  }
}

