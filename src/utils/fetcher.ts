const API_URL = import.meta.env.VITE_API_URL;

export const fetcher = async <T>(
  pathname: string,
  params?: T,
  signal?: AbortSignal | null,
) => {
  const licenseKey = localStorage.getItem("licenseKey") ?? "";
  const url = new URL(pathname, API_URL);
  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, `${value}`);
  }

  const [result] = await Promise.allSettled([
    fetch(url.toString(), {
      headers: {
        "X-License-Key": licenseKey,
      },
      signal,
    }).then((res) => res.json()),
  ]);

  if (result.status === "fulfilled") return result.value;
  throw new Error(result.reason);
};

export const mutator = async <T>(
  pathname: string,
  payload: T,
  signal?: AbortSignal | null,
) => {
  const licenseKey = localStorage.getItem("licenseKey") ?? "";
  const url = new URL(pathname, API_URL);
  const [result] = await Promise.allSettled([
    fetch(url.toString(), {
      signal,
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "X-License-Key": JSON.parse(licenseKey),
      },
    }).then((res) => res.json()),
  ]);

  if (result.status === "fulfilled") return result.value;
  throw new Error(result.reason);
};
