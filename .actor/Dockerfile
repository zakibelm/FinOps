FROM apify/actor-node:18

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy source code
COPY . ./

# Build TypeScript
RUN npm run build

# Run the actor
CMD ["node", "dist/main.js"]