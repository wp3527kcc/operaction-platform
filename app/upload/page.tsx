import OperatePart from "./OperatePart";
import { connection } from "next/server";
import { getUploadList } from "@/app/services/upload";

export default async function Upload() {
  const fileList = await getUploadList();
  await connection(); // 用于禁用缓存

  return (
    <div>
      <OperatePart initFileList={fileList} />
    </div>
  );
}
