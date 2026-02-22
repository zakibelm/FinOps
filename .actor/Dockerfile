FROM apify/actor-node:20

# Install TypeScript globally (needed for workspace builds)
RUN npm install -g typescript

# Create workspace directories
RUN mkdir -p frontend gateway workers shared ai-optimizer

# Copy all package.json files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY gateway/package*.json ./gateway/
COPY workers/package*.json ./workers/
COPY shared/package*.json ./shared/
COPY ai-optimizer/package*.json ./ai-optimizer/

# Install dependencies
RUN npm install --workspaces

# Copy source code
COPY . ./

# Build TypeScript using npx
RUN npm run build --workspaces

# Run the actor
CMD ["node", "dist/main.js"]
