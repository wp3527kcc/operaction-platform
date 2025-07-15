import type { NextConfig } from "next";
// import { getNacosConfig } from "./nacos.conf.mjs"
// import { PHASE_PRODUCTION_SERVER } from 'next/constants'

const nextConfig: NextConfig = async (phase: string, { defaultConfig }: { defaultConfig: NextConfig }) => {
  // let nacosConfig = null
  // if (phase === PHASE_PRODUCTION_SERVER) {
  //   nacosConfig = await getNacosConfig()
  // }
  // if (nacosConfig) {
  //   const { mysql, tos } = nacosConfig
  //   if (mysql) {
  //     process.env.DATABASE_HOST = mysql.host
  //     process.env.DATABASE_NAME = mysql.dbname
  //     process.env.DATABASE_USER = mysql.username
  //     process.env.DATABASE_PASSWORD = mysql.password
  //   }
  //   if (tos) {
  //     process.env.TOS_ACCESS_KEY_ID = tos.ak;
  //     process.env.TOS_ACCESS_KEY_SECRET = tos.sk;
  //     process.env.TOS_ENDPOINT = tos.endpoint;
  //     process.env.TOS_BUCKET = tos.bucket;
  //     process.env.TOS_REGION = tos.region;
  //     process.env.CDNBASEURL = tos.cdn
  //   }
  // }
  return {
    async headers() {
      return [
        {
          source: '/api/(.*)',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: '*' },
          ],
        },
        // 如果你的自定义 API 路由不是在 pages/api 或 app/api，或者你想统一管理
        // source: '/your-custom-api/(.*)',
        // headers: [...]
      ];
    },
    ...defaultConfig,
  }
};

export default nextConfig;
