FROM apify/actor-node:18

# Copy all package.json files from workspaces first
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY gateway/package*.json ./gateway/
COPY workers/package*.json ./workers/
COPY shared/package*.json ./shared/
COPY ai-optimizer/package*.json ./ai-optimizer/

# Install all dependencies (including devDependencies needed for build)
RUN npm install

# Copy source code
COPY . ./

# Build TypeScript
RUN npm run build

# Run the actor
CMD ["node", "dist/main.js"]
