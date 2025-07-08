FROM registry-tc-cn-beijing.cr.volces.com/library/node:18 as builder
ARG CDN_DOMAIN
ARG SERVER_NAME
ARG BUILD_ENV
ENV CDN_DOMAIN=${CDN_DOMAIN}
ENV SERVER_NAME=${SERVER_NAME}
ENV NODE_ENV=${BUILD_ENV}
ENV TIME_ZONE Asia/Shanghai

WORKDIR /app

# 修改时区
RUN ln -snf /usr/share/zoneinfo/$TIME_ZONE /etc/localtime && echo $TIME_ZONE > /etc/timezone
# 安装 pnpm
RUN npm install -g pnpm
RUN pnpm -v

COPY . .

# 编译、清理devDependencies类型依赖，并上传静态文件
RUN pnpm install tc-health-check-node --registry=https://nexus.tucdev.com/repository/tc-npm-group/
RUN pnpm install
# 运行构建命令
RUN pnpm run build

CMD ["pnpm", "run", "start"]