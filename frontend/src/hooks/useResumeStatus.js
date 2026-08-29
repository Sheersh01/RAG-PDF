import { useEffect, useState } from "react";
import { documentApi } from "../services/api";

export const useResumeStatus = () => {
  const [resumeExists, setResumeExists] = useState(false);
  const [checkingResume, setCheckingResume] = useState(true);
  const [resumeDocument, setResumeDocument] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await documentApi.getResume();
        if (cancelled) return;

        if (data.success && data.document) {
          setResumeExists(true);
          setResumeDocument(data.document);
        } else {
          setResumeExists(false);
          setResumeDocument(null);
        }
      } catch {
        if (!cancelled) {
          setResumeExists(false);
          setResumeDocument(null);
        }
      } finally {
        if (!cancelled) {
          setCheckingResume(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { resumeExists, checkingResume, resumeDocument };
};
