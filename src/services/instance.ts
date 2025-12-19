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

  public async post(url: string, body?: any): Promise<T> {
    return this.request(url, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      headers: { "Content-Type": "application/json" },
    });
  }

  public async put(url: string, body: any): Promise<T> {
    return this.request(url, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  public async patch(url: string, body: any): Promise<T> {
    return this.request(url, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  public async delete(url: string): Promise<T> {
    return this.request(url, { method: "DELETE" });
  }

  private async run(response: Response): Promise<T> {
    const body = await response.json();

    if (response.ok) {
      return this._schema.parse(body) as T;
    }

    const error = apiErrorResponseSchema.parse(body);
    throw new Error((error.message || error.error) ?? "unknown error");
  }
}
