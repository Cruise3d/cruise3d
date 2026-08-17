# syntax=docker/dockerfile:1.7
# ---------- Stage 1: base ----------
# Shared base with Node. later stages pick dev vs prod.
FROM node:22-alpine AS base
WORKDIR /app

# Copy only manifests first to leverage Docker layer cache.
COPY package.json package-lock.json* ./

# Build-time Vite env vars. Override at build time with:
#   docker build --build-arg VITE_API_BASE_URL=/api .
ARG VITE_API_BASE_URL=/api
ARG VITE_RAZORPAY_KEY_ID=rzp_test_TMSkzp2w2veJtm
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID

# ---------- Stage 2: deps ----------
# Install all dependencies (incl. dev) — used by both dev and build stages.
# Using `npm install` instead of `npm ci` because the committed
# package-lock.json is currently out of sync with package.json
# (npm ci is strict and fails on drift). Once a teammate runs `npm install`
# locally and commits the refreshed lockfile, switch this back to `npm ci`
# for faster, reproducible builds.
FROM base AS deps
RUN npm install

# ---------- Stage 3: dev ----------
# Runs `vite` with HMR. Mount your source as a bind mount for live reload.
FROM deps AS dev
ENV NODE_ENV=development
EXPOSE 5173
# `0.0.0.0` so Vite is reachable from outside the container; HMR needs --host.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---------- Stage 4: build ----------
# Compiles the production bundle into /app/dist.
FROM deps AS build
ENV NODE_ENV=production
COPY . .
RUN npm run build

# ---------- Stage 5: prod ----------
# Tiny static server (nginx) serving the built SPA. Multi-stage keeps the
# final image small and free of Node/build tooling.
FROM nginx:1.27-alpine AS prod

# Vite outputs to /app/dist; nginx default web root is /usr/share/nginx/html.
COPY --from=build /app/dist /usr/share/nginx/html

# SPA-friendly nginx config: try files, fall back to index.html for client routes.
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
