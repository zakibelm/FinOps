FROM apify/actor-node:20

# Copy all package.json files from workspaces first
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY gateway/package*.json ./gateway/
COPY workers/package*.json ./workers/
COPY shared/package*.json ./shared/
COPY ai-optimizer/package*.json ./ai-optimizer/

# Install all dependencies with workspaces enabled
RUN npm install --workspaces

# Copy source code
COPY . ./

# Build TypeScript
RUN npm run build --workspaces

# Run the actor
CMD ["node", "dist/main.js"]
