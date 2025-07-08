import { NacosConfigClient } from 'nacos';
import yaml from 'js-yaml';

// Nacos 配置
const nacosConfig = {
  serverAddr: process.env.NACOS_ENDPOINT, // Nacos 服务地址
  namespace: process.env.NACOS_NAMESPACE, // 命名空间 ID
  username: process.env.NACOS_USERNAME,
  password: process.env.NACOS_PASSWORD,
  group: process.env.NACOS_GROUP,
  requestTimeout: 10000, // 设置请求超时时间为 10000 毫秒
};

const serverName = process.env.APP_NAME
// 配置文件信息
const dataId = `${serverName}.yaml`;

let parsedConfig = null;
export async function getNacosConfig() {
  try {
    // 初始化 Nacos 配置客户端
    const configClient = new NacosConfigClient(nacosConfig);
    if(!parsedConfig) {
      // 从 Nacos 获取配置
      const configYaml = await configClient.getConfig(dataId, nacosConfig.group);
  
      // 解析配置
      parsedConfig = yaml.load(configYaml);
    }
    return parsedConfig || {};
  } catch (err) {
    console.error('Error fetching database config from Nacos:', err);
  }
}
