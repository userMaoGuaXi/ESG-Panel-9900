# Docker implement

下载backend、frontend文件夹，以及docker-compose.yml文件到本地。然后打开docker desktop, 在本地上述三个文件对应的路径下开terminal，运行：
```bash
docker-compose up --build
```

## 更新日志
### 1.1.0（2025‑04‑23）
- **端口调整**  
  - 前端容器和后端容器监听端口由 `5000` 调整为 `5001`  
- **依赖变更**  
  - 后端新增 `python-dotenv` 库  
  - 在 `requirements.txt` 中补充缺失依赖  
- **Docker 配置**  
  1. 在 `backend/run.py` 中将 `host` 设置为 `"0.0.0.0"`，以暴露 API  
  2. 在 `frontend/vite.config.js` 中添加 `host: "0.0.0.0"`，以允许外部访问  
