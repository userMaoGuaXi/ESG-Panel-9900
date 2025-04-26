# 使用官方 Python 轻量版镜像作为基础镜像，这里选用 Python 3.8 的 slim 版本
FROM python:3.8-slim

# 设置工作目录为 /app，所有后续的命令都将在该目录下执行
WORKDIR /app

# 将项目依赖文件 requirements.txt 复制到容器中当前工作目录
COPY requirements.txt .

# 升级 pip 并安装项目所需的 Python 依赖包
RUN pip install --upgrade pip && pip install -r requirements.txt

# 将当前目录下的所有文件复制进工作目录 /app（包含 app/、run.py 等）
COPY . .

# 声明容器要监听的端口（Flask 默认监听 5000）
EXPOSE 5001

# 设置环境变量：告诉 Flask 入口文件，同时让开发服务器可以接受外部连接
ENV FLASK_APP=run.py
ENV FLASK_RUN_HOST=0.0.0.0

# 指定启动命令：运行 run.py 文件来启动 Flask 应用
CMD ["python", "run.py"]
