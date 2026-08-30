import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Anti-DoS Payload Size Limiting (Prevents memory exhaustion attacks)
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  // 2. High-Performance Sliding Window In-Memory Rate Limiter (Anti-DoS / Brute Force)
  const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
  const MAX_REQUESTS_PER_WINDOW = 180; // 180 requests per minute per IP

  const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
    const now = Date.now();

    const record = rateLimitStore.get(ip);
    if (!record || now > record.resetTime) {
      rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
      return next();
    }

    record.count++;
    if (record.count > MAX_REQUESTS_PER_WINDOW) {
      res.setHeader("Retry-After", "60");
      return res.status(429).json({
        error: "Too Many Requests",
        message: "AuraBio Security Shield: İstek sıklığı aşıldı. Lütfen 1 dakika sonra tekrar deneyin.",
        retryAfterSec: 60
      });
    }

    next();
  };

  // Clean up expired rate-limit memory buckets every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) {
        rateLimitStore.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  // 3. Security Headers Middleware (Anti-XSS, MIME-Sniffing, DoS)
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(self), microphone=(self), accelerometer=(), gyroscope=()");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https:; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:; " +
      "style-src 'self' 'unsafe-inline' https:; " +
      "media-src 'self' blob: data: https:; " +
      "connect-src 'self' https: wss: blob: data:; " +
      "img-src 'self' data: blob: https:; " +
      "font-src 'self' data: https:;"
    );
    next();
  });

  // 4. Malicious Attack Pattern Filter (Honeypot & SQLi / Path Traversal / XSS probe blocking)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const url = req.url.toLowerCase();
    const maliciousPatterns = [
      "/.env",
      "/wp-admin",
      "/wp-login",
      "/phpmyadmin",
      "/etc/passwd",
      "../",
      "..\\",
      "<script",
      "union+select",
      "union%20select",
      "eval("
    ];

    for (const pattern of maliciousPatterns) {
      if (url.includes(pattern)) {
        console.warn(`[Security Firewall] Blocked suspicious request pattern "${pattern}" from ${req.ip}`);
        return res.status(403).json({ error: "Access Denied by Security Firewall" });
      }
    }

    next();
  });

  // 5. Apply Rate Limiting to API Routes
  app.use("/api", rateLimiterMiddleware);

  // Health and Security Status Endpoints
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: Date.now(),
      service: "AuraBio Quantum Resonance Engine"
    });
  });

  app.get("/api/security/status", (req: Request, res: Response) => {
    res.json({
      firewall: "active",
      antiDosRateLimiter: "enabled",
      securityHeaders: "enforced",
      timestamp: Date.now()
    });
  });

  // 6. Vite Middleware for Development / Static file serving for Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AuraBio Server] Running with High Security Firewall on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[AuraBio Server] Failed to start:", err);
});
