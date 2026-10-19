#!/usr/bin/env python3
"""
MinerU Cloud API - PDF 解析脚本
使用 MinerU 云端 API 高精度解析 PDF，自动提取图片、表格、公式

支持两种模式:
1. URL 模式: 提交远程 PDF URL（如 arXiv 链接），使用 /api/v4/extract/task 接口
2. 文件上传模式: 上传本地 PDF 文件，使用 /api/v4/file-urls/batch 接口
"""

import os
import sys
import json
import time
import requests
import zipfile
from pathlib import Path
from typing import Optional, Dict


ENV_FILE = Path(
    os.environ.get(
        "FAVOUR_CONFIG_ENV",
        Path.home() / ".config" / "favour-config" / "env",
    )
)


def _read_env_file(path: Path) -> Dict[str, str]:
    """Read simple KEY=VALUE lines from a local, untracked env file."""
    if not path.is_file():
        return {}
    values: Dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        if not key:
            continue
        values[key] = value.strip().strip('"').strip("'")
    return values


def resolve_token(explicit: Optional[str] = None) -> str:
    """Resolve the MinerU token without ever storing it in the repository."""
    if explicit:
        return explicit.strip()
    token = os.environ.get("MINERU_TOKEN", "").strip()
    if token:
        return token
    return _read_env_file(ENV_FILE).get("MINERU_TOKEN", "").strip()


class MinerUAPI:
    BASE_URL = "https://mineru.net/api/v4"

    def __init__(self, token: str):
        self.token = token
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }

    # ─── URL 模式：单文件提交 ───

    def submit_url(self, pdf_url: str,
                   enable_formula: bool = True,
                   enable_table: bool = True,
                   is_ocr: bool = False,
                   language: str = "en",
                   model_version: str = "vlm") -> Optional[str]:
        """提交 URL 解析任务，返回 task_id"""
        url = f"{self.BASE_URL}/extract/task"
        data = {
            "url": pdf_url,
            "enable_formula": enable_formula,
            "enable_table": enable_table,
            "is_ocr": is_ocr,
            "language": language,
            "model_version": model_version,
        }

        print(f"正在提交 URL 解析任务...")
        try:
            response = requests.post(url, headers=self.headers, json=data, timeout=30)
            result = response.json()

            if result.get("code") == 0 and result.get("data"):
                task_id = result["data"].get("task_id")
                if task_id:
                    print(f"✓ 任务提交成功，task_id: {task_id}")
                    return task_id
                else:
                    print(f"✗ 响应中无 task_id: {result}")
                    return None
            else:
                print(f"✗ 任务提交失败: code={result.get('code')}, msg={result.get('msg')}")
                return None
        except Exception as e:
            print(f"✗ 请求异常: {e}")
            return None

    # ─── 文件上传模式：批量 ───

    def submit_file(self, pdf_path: Path,
                    enable_formula: bool = True,
                    enable_table: bool = True,
                    is_ocr: bool = False,
                    language: str = "en",
                    model_version: str = "vlm") -> Optional[str]:
        """上传本地文件，返回 batch_id"""
        url = f"{self.BASE_URL}/file-urls/batch"
        data = {
            "enable_formula": enable_formula,
            "enable_table": enable_table,
            "is_ocr": is_ocr,
            "language": language,
            "model_version": model_version,
            "files": [{"name": pdf_path.name}]
        }

        print(f"正在获取上传链接...")
        response = requests.post(url, headers=self.headers, json=data, timeout=30)
        result = response.json()

        if result.get("code") != 0:
            print(f"✗ 获取上传链接失败: code={result.get('code')}, msg={result.get('msg')}")
            return None

        batch_id = result["data"].get("batch_id")
        file_urls = result["data"].get("file_urls", [])

        if not file_urls:
            print("✗ 未获取到上传链接")
            return None

        upload_url = file_urls[0]
        print(f"✓ 获取上传链接成功，batch_id: {batch_id}")

        print(f"正在上传文件 ({pdf_path.stat().st_size / 1024 / 1024:.1f} MB)...")
        with open(pdf_path, "rb") as f:
            file_data = f.read()

        upload_response = requests.put(upload_url, data=file_data, timeout=300)

        if upload_response.status_code not in [200, 201]:
            print(f"✗ 文件上传失败: HTTP {upload_response.status_code}")
            return None

        print(f"✓ 文件上传成功!")
        return batch_id

    # ─── 查询结果 ───

    def get_task_result(self, task_id: str) -> Optional[Dict]:
        """查询单任务结果（URL 模式）"""
        url = f"{self.BASE_URL}/extract/task/{task_id}"
        try:
            response = requests.get(url, headers=self.headers, timeout=30)
            result = response.json()
            if result.get("code") == 0:
                return result.get("data")
            else:
                print(f"查询失败: code={result.get('code')}, msg={result.get('msg')}")
                return None
        except Exception as e:
            print(f"查询异常: {e}")
            return None

    def get_batch_result(self, batch_id: str) -> Optional[Dict]:
        """查询批量任务结果（文件上传模式）"""
        url = f"{self.BASE_URL}/extract-results/batch/{batch_id}"
        try:
            response = requests.get(url, headers=self.headers, timeout=30)
            result = response.json()
            if result.get("code") == 0:
                return result.get("data")
            else:
                print(f"查询失败: code={result.get('code')}, msg={result.get('msg')}")
                return None
        except Exception as e:
            print(f"查询异常: {e}")
            return None

    # ─── 等待完成 ───

    def wait_for_task(self, task_id: str,
                      max_wait: int = 300,
                      interval: int = 5) -> Optional[Dict]:
        """等待 URL 任务完成，返回 data 字段（含 full_zip_url）"""
        print(f"等待解析完成 (最长 {max_wait} 秒)...")
        start_time = time.time()

        while time.time() - start_time < max_wait:
            data = self.get_task_result(task_id)
            if data:
                state = data.get("state", "")
                if state == "done":
                    print("✓ 解析完成!")
                    return data
                elif state == "failed":
                    print(f"✗ 解析失败: {data.get('err_msg', '未知错误')}")
                    return None
                else:
                    elapsed = int(time.time() - start_time)
                    progress = data.get("extract_progress", {})
                    if progress:
                        print(f"  状态: {state} ({progress.get('extracted_pages', '?')}/{progress.get('total_pages', '?')} 页, {elapsed}s)")
                    else:
                        print(f"  状态: {state}... ({elapsed}s)")
            time.sleep(interval)

        print("✗ 等待超时")
        return None

    def wait_for_batch(self, batch_id: str,
                       max_wait: int = 300,
                       interval: int = 5) -> Optional[Dict]:
        """等待批量任务完成，返回 extract_result 列表中的第一项"""
        print(f"等待解析完成 (最长 {max_wait} 秒)...")
        start_time = time.time()

        while time.time() - start_time < max_wait:
            data = self.get_batch_result(batch_id)
            if data:
                files = data.get("extract_result", [])
                if files:
                    file_info = files[0]
                    state = file_info.get("state", "")
                    if state == "done":
                        print("✓ 解析完成!")
                        return file_info
                    elif state == "failed":
                        print(f"✗ 解析失败: {file_info.get('err_msg', '未知错误')}")
                        return None
                    else:
                        elapsed = int(time.time() - start_time)
                        progress = file_info.get("extract_progress", {})
                        if progress:
                            print(f"  状态: {state} ({progress.get('extracted_pages', '?')}/{progress.get('total_pages', '?')} 页, {elapsed}s)")
                        else:
                            print(f"  状态: {state}... ({elapsed}s)")
            time.sleep(interval)

        print("✗ 等待超时")
        return None

    # ─── 下载结果 ───

    def download_result(self, result_data: Dict, output_dir: Path) -> Dict:
        """下载并解压结果 zip 包"""
        output_dir.mkdir(parents=True, exist_ok=True)

        zip_url = result_data.get("full_zip_url")
        if not zip_url:
            print("✗ 未找到下载链接 (full_zip_url)")
            return {}

        print(f"下载结果...")
        zip_path = output_dir / "result.zip"
        try:
            response = requests.get(zip_url, timeout=120)
            with open(zip_path, "wb") as f:
                f.write(response.content)
            print(f"✓ 下载完成: {zip_path}")

            with zipfile.ZipFile(zip_path, "r") as z:
                z.extractall(output_dir)
            print(f"✓ 解压完成: {output_dir}")

            md_files = list(output_dir.glob("**/*.md"))
            images_dir = output_dir / "images"
            if not images_dir.exists():
                for d in output_dir.rglob("images"):
                    if d.is_dir():
                        images_dir = d
                        break

            zip_path.unlink()

            return {
                "method": "mineru_api",
                "markdown_path": str(md_files[0]) if md_files else None,
                "images_dir": str(images_dir) if images_dir.exists() else None,
                "image_count": len(list(images_dir.glob("*"))) if images_dir.exists() else 0
            }

        except Exception as e:
            print(f"✗ 下载/解压失败: {e}")
            return {}


def convert_pdf(pdf_path: str, output_dir: str, token: str) -> Dict:
    """本地文件上传模式"""
    pdf_path = Path(pdf_path).resolve()
    output_dir = Path(output_dir).resolve()

    if not pdf_path.exists():
        print(f"✗ PDF 文件不存在: {pdf_path}")
        return {}

    print(f"PDF: {pdf_path}")
    print(f"输出目录: {output_dir}")
    print("-" * 40)

    api = MinerUAPI(token)

    batch_id = api.submit_file(pdf_path)
    if not batch_id:
        return {}

    file_info = api.wait_for_batch(batch_id)
    if not file_info:
        return {}

    result = api.download_result(file_info, output_dir)

    if result:
        info_path = output_dir / "convert_info.json"
        with open(info_path, "w") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print(f"\n转换信息已保存: {info_path}")

    return result


def convert_url(pdf_url: str, output_dir: str, token: str) -> Dict:
    """URL 提交模式"""
    output_dir = Path(output_dir).resolve()

    print(f"URL: {pdf_url}")
    print(f"输出目录: {output_dir}")
    print("-" * 40)

    api = MinerUAPI(token)

    task_id = api.submit_url(pdf_url)
    if not task_id:
        return {}

    result_data = api.wait_for_task(task_id)
    if not result_data:
        return {}

    result = api.download_result(result_data, output_dir)

    if result:
        info_path = output_dir / "convert_info.json"
        with open(info_path, "w") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print(f"\n转换信息已保存: {info_path}")

    return result


def main():
    if len(sys.argv) < 3:
        print("用法: python mineru_api.py <pdf_path_or_url> <output_dir> [token]")
        print("\n参数:")
        print("  pdf_path_or_url - PDF 文件路径或 URL")
        print("  output_dir      - 输出目录")
        print("  token           - MinerU API Token (可选；默认读 MINERU_TOKEN 或本机 env 文件)")
        print("\n示例:")
        print("  python mineru_api.py paper.pdf ./output")
        print("  python mineru_api.py https://arxiv.org/pdf/2507.00715 ./output")
        sys.exit(1)

    source = sys.argv[1]
    output_dir = sys.argv[2]
    token = resolve_token(sys.argv[3] if len(sys.argv) > 3 else None)

    if not token:
        print("✗ 未找到 MinerU API Token")
        print("  请设置环境变量 MINERU_TOKEN，或在下面的文件中写入 MINERU_TOKEN=...：")
        print(f"  {ENV_FILE}")
        sys.exit(1)

    if source.startswith("http"):
        result = convert_url(source, output_dir, token)
    else:
        result = convert_pdf(source, output_dir, token)

    if result:
        print("\n" + "=" * 40)
        print("转换成功!")
        print(f"  Markdown: {result.get('markdown_path')}")
        print(f"  图片数量: {result.get('image_count')}")
    else:
        print("\n转换失败")
        sys.exit(1)


if __name__ == "__main__":
    main()
