import { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';

const MAX_CHARS = 500;
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;
const API_URL = 'https://router.huggingface.co/nscale/v1/images/generations';

const INSPIRATIONS = [
  { text: 'A cyberpunk cityscape at sunset', icon: '🌆' },
  { text: 'Astronaut riding a horse on Mars', icon: '🚀' },
  { text: 'Oil painting of a serene lake', icon: '🎨' },
  { text: 'Crystal dragon in a neon forest', icon: '🐉' },
  { text: 'Steampunk coffee shop interior', icon: '☕' },
  { text: 'Northern lights over a glass igloo', icon: '🌌' },
];

/**
 * Send prompt to Hugging Face via fetch.
 * Converts the b64_json response into a displayable blob URL.
 */
async function query(prompt) {
  const startTime = performance.now();

  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      response_format: 'b64_json',
      prompt,
      model: 'stabilityai/stable-diffusion-xl-base-1.0',
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid or missing API token. Add your Hugging Face token to .env as VITE_HF_TOKEN.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    if (response.status === 503) {
      throw new Error('Model is loading. Please try again in a few seconds.');
    }
    throw new Error(`API error (${response.status}): ${errorBody || response.statusText}`);
  }

  const data = await response.json();
  const base64 = data?.data?.[0]?.b64_json;
  if (!base64) {
    throw new Error('No image returned from the API. Try a different prompt.');
  }

  const byteCharacters = atob(base64);
  const byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const blob = new Blob([byteNumbers], { type: 'image/png' });
  const imageUrl = URL.createObjectURL(blob);
  const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);

  return {
    url: imageUrl,
    generationTime: elapsed,
    model: 'SDXL 1.0',
    resolution: '1024 × 1024',
  };
}

/* ── SVG Icon Components ── */
const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ZapIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const CpuIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

const MaximizeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const LoaderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

function App() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const progressRef = useRef(null);

  // Clean up blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (result?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result]);

  // Animate progress bar during loading
  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }

    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) {
          clearInterval(progressRef.current);
          return prev;
        }
        return prev + Math.random() * 7;
      });
    }, 350);

    return () => clearInterval(progressRef.current);
  }, [isLoading]);

  const handleGenerate = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading) return;

    if (!HF_TOKEN || HF_TOKEN === 'your_huggingface_token_here') {
      setError('Please add your Hugging Face API token to .env as VITE_HF_TOKEN, then restart the dev server.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await query(trimmed);
      setProgress(100);
      await new Promise((r) => setTimeout(r, 400));
      setResult({ ...data, prompt: trimmed });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleGenerate();
      }
    },
    [handleGenerate]
  );

  const handleChipClick = useCallback((text) => {
    setPrompt(text);
    textareaRef.current?.focus();
  }, []);

  const handleDownload = useCallback(async () => {
    if (!result?.url) return;
    try {
      const res = await fetch(result.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imaginate-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail
    }
  }, [result]);

  const charCount = prompt.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canGenerate = prompt.trim().length > 0 && !isLoading && !isOverLimit;

  return (
    <div className="app">
      {/* Background Orbs */}
      <div className="bg-orbs" aria-hidden="true">
        <div className="bg-orb bg-orb--1" />
        <div className="bg-orb bg-orb--2" />
        <div className="bg-orb bg-orb--3" />
      </div>

      <main className="main">
        {/* Header */}
        <header className="header" id="header">
          <div className="header__badge">
            <span className="header__badge-dot" />
            AI-Powered
          </div>
          <h1 className="header__title">
            <span className="header__title-gradient">Imaginate</span>
          </h1>
          <p className="header__subtitle">
            Transform your words into stunning visuals with AI. Describe anything — watch it come to life.
          </p>
        </header>

        {/* Prompt Card */}
        <section className="prompt-card" id="prompt-section">
          <label className="prompt-card__label" htmlFor="prompt-input">
            <SparkleIcon /> Describe your vision
          </label>
          <div className="prompt-card__input-wrapper">
            <textarea
              ref={textareaRef}
              id="prompt-input"
              className="prompt-card__textarea"
              placeholder="A serene Japanese garden with cherry blossoms, soft morning light filtering through ancient maple trees, koi fish swimming in a crystal-clear pond..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={MAX_CHARS + 50}
              aria-label="Image description prompt"
            />
            <span
              className={`prompt-card__char-count ${isOverLimit ? 'prompt-card__char-count--warn' : ''}`}
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>
          <div className="prompt-card__actions">
            <span className="prompt-card__hint">
              <span className="prompt-card__hint-icon">⌘</span>
              Enter to generate
            </span>
            <button
              className="btn-generate"
              id="generate-button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              aria-label="Generate image"
            >
              <span className="btn-generate__icon">
                {isLoading ? <LoaderIcon /> : <SparkleIcon />}
              </span>
              <span className="btn-generate__text">
                {isLoading ? 'Generating…' : 'Generate'}
              </span>
            </button>
          </div>
        </section>

        {/* Inspiration Chips */}
        {!isLoading && !result && (
          <section className="inspiration" id="inspiration-section">
            <p className="inspiration__title">Try a prompt</p>
            <div className="inspiration__chips">
              {INSPIRATIONS.map((item) => (
                <button
                  key={item.text}
                  className="chip"
                  onClick={() => handleChipClick(item.text)}
                  aria-label={`Use prompt: ${item.text}`}
                >
                  {item.icon} {item.text}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Loading State */}
        {isLoading && (
          <section className="loader" id="loading-section" aria-live="polite">
            <div className="loader__card">
              <div className="loader__spinner-container">
                <div className="loader__spinner" />
                <div className="loader__spinner-glow" />
              </div>
              <div className="loader__text">
                <p className="loader__title">Creating your masterpiece</p>
                <p className="loader__subtitle">This usually takes 10–30 seconds…</p>
              </div>
              <div className="loader__progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin="0" aria-valuemax="100">
                <div
                  className="loader__progress-bar"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Error State */}
        {error && (
          <section className="error" id="error-section" aria-live="assertive">
            <div className="error__card">
              <span className="error__icon"><AlertIcon /></span>
              <div className="error__content">
                <p className="error__title">Generation failed</p>
                <p className="error__message">{error}</p>
              </div>
            </div>
          </section>
        )}

        {/* Result */}
        {result && !isLoading && (
          <section className="result" id="result-section">
            <div className="result__card">
              <div className="result__image-container">
                <img
                  className="result__image"
                  src={result.url}
                  alt={`AI generated image: ${result.prompt}`}
                  loading="eager"
                />
                <div className="result__overlay">
                  <div className="result__overlay-actions">
                    <button className="result__overlay-btn" onClick={handleDownload}>
                      <DownloadIcon /> Download
                    </button>
                    <button
                      className="result__overlay-btn"
                      onClick={() => {
                        setResult(null);
                        textareaRef.current?.focus();
                      }}
                    >
                      <PlusIcon /> New Image
                    </button>
                  </div>
                </div>
              </div>
              <div className="result__info">
                <p className="result__prompt-label">Prompt</p>
                <p className="result__prompt-text">{result.prompt}</p>
              </div>
              <div className="result__meta">
                <span className="result__meta-item">
                  <span className="result__meta-icon"><ZapIcon /></span>
                  {result.generationTime}s
                </span>
                <span className="result__meta-item">
                  <span className="result__meta-icon"><CpuIcon /></span>
                  {result.model}
                </span>
                <span className="result__meta-item">
                  <span className="result__meta-icon"><MaximizeIcon /></span>
                  {result.resolution}
                </span>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p className="footer__text">
          Built with <SparkleIcon /> <a href="#">Imaginate</a> — AI-powered image generation
        </p>
      </footer>
    </div>
  );
}

export default App;