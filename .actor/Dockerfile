FROM apify/actor-node:20

# Install TypeScript globally
RUN npm install -g typescript tsx

# Copy workspace package files
COPY package*.json ./
COPY workers/package*.json ./workers/
COPY shared/package*.json ./shared/

# Create workspace dirs
RUN mkdir -p frontend gateway ai-optimizer

# Copy stub package.json for unused workspaces to satisfy npm workspaces
COPY gateway/package*.json ./gateway/
COPY ai-optimizer/package*.json ./ai-optimizer/

# Install only workers and shared deps
RUN npm install --workspace=workers --workspace=shared --ignore-scripts 2>/dev/null || npm install --workspaces --ignore-scripts

# Copy source code
COPY workers/ ./workers/
COPY shared/ ./shared/

# Build shared then workers
RUN cd shared && npx tsc --skipLibCheck 2>/dev/null || true
RUN cd workers && npx tsc --skipLibCheck 2>/dev/null || true

# Start the workers
CMD ["node", "workers/dist/index.js"]
