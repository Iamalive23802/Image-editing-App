const LANGUAGE_TO_ITC: Record<string, string> = {
  marathi: 'mr-t-i0-und',
  hindi: 'hi-t-i0-und',
};

type SupportedLanguage = keyof typeof LANGUAGE_TO_ITC;

export async function transliterateText(
  text: string,
  language: SupportedLanguage
): Promise<string | null> {
  const normalized = text.trim();
  if (!normalized) {
    return '';
  }

  const itc = LANGUAGE_TO_ITC[language];
  if (!itc) {
    return null;
  }

  const params = new URLSearchParams({
    itc,
    text: normalized,
    num: '1',
    cp: '0',
    cs: '1',
    ie: 'utf-8',
    oe: 'utf-8',
    app: 'nimesh-profile-setup',
  });

  try {
    const response = await fetch(
      `https://inputtools.google.com/request?${params.toString()}`
    );

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    if (Array.isArray(payload) && payload[0] === 'SUCCESS') {
      const candidates = payload?.[1]?.[0]?.[1];
      if (Array.isArray(candidates) && candidates.length > 0) {
        return String(candidates[0]);
      }
    }

    return null;
  } catch (error) {
    console.error('Transliteration request failed:', error);
    return null;
  }
}
