FROM apify/actor-node:18

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install

# Copy source code
COPY . ./

# Build TypeScript
RUN npm run build

# Run the actor
CMD ["node", "dist/main.js"]