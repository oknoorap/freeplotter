import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { fetcher, mutator } from "../utils/fetcher";
import { useLicenseKey } from "./useLicenseKey";

type UseGetQuestionMutation = {
  sentences: string;
  paragraph?: string;
};

export const useGetQuestion = () => {
  const controller = new AbortController();
  const query = useMutation<
    { question: string },
    Error,
    UseGetQuestionMutation
  >({
    mutationKey: ["question"],
    mutationFn: async ({ sentences, paragraph }) => {
      const response = await mutator<UseGetQuestionMutation>(
        "/story/question",
        { sentences, paragraph },
        controller.signal,
      );
      return response;
    },
  });

  useEffect(() => {
    return () => controller.abort();
  }, []);

  return query;
};

type UseGetShowingMutation = {
  paragraph: string;
  prevParagraph?: string;
};

export const useGetShowing = () => {
  const controller = new AbortController();
  const mutation = useMutation<{ story: string }, Error, UseGetShowingMutation>(
    {
      mutationKey: ["showing"],
      mutationFn: async ({ paragraph, prevParagraph }) => {
        const response = await mutator<UseGetShowingMutation>(
          "/story/showing",
          { paragraph, prevParagraph },
          controller.signal,
        );
        return response;
      },
    },
  );

  useEffect(() => {
    return () => controller.abort();
  }, []);

  return mutation;
};

export const useCheckLicense = ({ onInvalid }: { onInvalid?: () => void }) => {
  const { setLicenseKey } = useLicenseKey();
  const [key, setKey] = useState("");

  const checkLicenseKey = async (key: string) => setKey(key);

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
    return () => controller.abort();
  }, []);

  return {
    ...query,
    checkLicenseKey,
    clearEnteredLicenseKey,
  };
};
