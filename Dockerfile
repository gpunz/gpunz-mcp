FROM node:22-alpine
LABEL io.modelcontextprotocol.server.name="nz.gpu/gpu-cloud"
LABEL org.opencontainers.image.source="https://github.com/gpunz/gpunz-mcp"
LABEL org.opencontainers.image.description="gpu.nz MCP server: rent and manage cloud GPUs from AI agents"
LABEL org.opencontainers.image.licenses="MIT"
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY index.js ./
USER node
ENTRYPOINT ["node", "index.js"]
