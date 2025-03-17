import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { fetcher, mutator } from "../utils/fetcher";
import { useLicenseKey } from "./useLicenseKey";

type GetQuestionMutation = {
  Request: {
    sentences: string;
    paragraph?: string;
  };
  Response: {
    question: string;
  };
};

export const useGetQuestion = () => {
  const controller = new AbortController();
  const query = useMutation<
    GetQuestionMutation["Response"],
    Error,
    GetQuestionMutation["Request"]
  >({
    mutationKey: ["question"],
    mutationFn: async ({ sentences, paragraph }) => {
      const response = await mutator<GetQuestionMutation["Request"]>(
        "/story/question",
        { sentences, paragraph },
        controller.signal,
      );
      if (response?.error) {
        throw Error(response?.message + ": " + response?.cause);
      }
      return response;
    },
  });

  useEffect(() => {
    return () => controller.abort();
  }, []);

  return query;
};

type GetShowingMutation = {
  Request: {
    paragraph: string;
    prevParagraph?: string;
  };
  Response: {
    story: string;
  };
};

export const useGetShowing = () => {
  const controller = new AbortController();
  const mutation = useMutation<
    GetShowingMutation["Response"],
    Error,
    GetShowingMutation["Request"]
  >({
    mutationKey: ["showing"],
    mutationFn: async ({ paragraph, prevParagraph }) => {
      const response = await mutator<GetShowingMutation["Request"]>(
        "/story/showing",
        { paragraph, prevParagraph },
        controller.signal,
      );
      if (response?.error) {
        throw Error(response?.message + ": " + response?.cause);
      }
      return response;
    },
  });

  useEffect(() => {
    return () => controller.abort();
  }, []);

  return mutation;
};

type GenerateOutlineMutation = {
  Request: {
    title: string;
    summary?: string;
    genre: string;
    numChapters: number;
    plots: string[];
  };
  Response: {
    premise: string;
    outline: Array<{
      title: string;
      content: string;
    }>;
  };
};

export const useGenerateOutline = () => {
  const [isLoading, setIsLoading] = useState(false);
  const controller = new AbortController();
  const mutation = useMutation<
    GenerateOutlineMutation["Response"],
    Error,
    GenerateOutlineMutation["Request"]
  >({
    mutationKey: ["outline"],
    mutationFn: async (payload) => {
      try {
        setIsLoading(true);
        const response = await mutator<GenerateOutlineMutation["Request"]>(
          "/outline/generate",
          payload,
          controller.signal,
        );
        if (response?.error) {
          throw Error(response?.message + ": " + response?.cause);
        }
        return response;
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    return () => controller.abort();
  }, []);

  return {
    isLoading,
    ...mutation,
  };
};

interface TypedFormData<T extends Record<string, string | File>>
  extends FormData {
  get<K extends keyof T>(key: Extract<K, string>): T[K];
}
export type NewOrderMutation = {
  Request: TypedFormData<{
    name: string;
    email: string;
    phone?: string;
    license_type: string;
    price: string;
    start_date: string;
    end_date: string;
    tximg: File;
  }>;
  Response: {
    license_key: string;
    start_date: string;
    end_date: string;
  };
};

export const useNewOrder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const controller = new AbortController();
  const mutation = useMutation<
    NewOrderMutation["Response"],
    Error,
    NewOrderMutation["Request"]
  >({
    mutationKey: ["order"],
    mutationFn: async (payload) => {
      try {
        setIsLoading(true);
        const response = await mutator<NewOrderMutation["Request"]>(
          "/order",
          payload,
          controller.signal,
          true,
        );
        if (response?.error) {
          throw Error(response?.message + ": " + response?.cause);
        }
        return response;
      } catch (error) {
        throw Error((error as Error)?.message);
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    return () => controller.abort();
  }, []);

  return {
    isLoading,
    ...mutation,
  };
};

export const useCheckLicense = ({ onInvalid }: { onInvalid?: () => void }) => {
  const { setLicenseKey } = useLicenseKey();
  const [key, setKey] = useState("");

  const checkLicenseKey = async (key: string) => {
    setKey(key);
  };

  const clearEnteredLicenseKey = () => {
    setKey("");
    setLicenseKey("");
  };

  const controller = new AbortController();
  const query = useQuery({
    enabled: !!key,
    queryKey: ["license-key"],
    refetchOnWindowFocus: false,

    queryFn: async () => {
      const response = await fetcher(
        "/license-key",
        { key },
        controller.signal,
      );

      if (response?.error) {
        throw Error(response?.message + ": " + response?.cause);
      }

      if (response?.isValid) {
        setLicenseKey(key);
      } else {
        clearEnteredLicenseKey();
        onInvalid?.();
      }

      return response;
    },
  });

  useEffect(() => {
    const hasKey = !!key?.length;
    if (hasKey) query.refetch();
  }, [key]);

  useEffect(() => {
    return () => controller.abort();
  }, []);

  return {
    ...query,
    checkLicenseKey,
    clearEnteredLicenseKey,
  };
};
